/**
 * PostgreSQL-backed REST API for Diamond Business Manager (replaces Supabase REST).
 *
 * DATABASE_URL example:
 * postgresql://USER:PASSWORD@localhost:5432/diamond
 */
import express from "express";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  "postgresql://postgres:postgres@localhost:5432/diamond";

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-only-change-me-use-JWT_SECRET-in-production";

/** Public fields for authenticated user (no password). */
function stripUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username ?? null,
    name: row.name ?? "",
    phone: row.phone ?? null,
    position: row.position ?? null,
    company: row.company ?? null,
    avatar_url: row.avatar_url ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Require Bearer JWT on /api routes except health + auth/register + auth/login POST. */
function jwtGate(req, res, next) {
  if (!req.path.startsWith("/api")) return next();
  if (req.path === "/api/health") return next();
  if (
    req.method === "POST" &&
    (req.path === "/api/auth/register" || req.path === "/api/auth/login")
  ) {
    return next();
  }
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(hdr.slice(7), JWT_SECRET);
    req.userId = decoded.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, phone, position, company } = req.body;
    if (!email || typeof email !== "string" || password == null) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    const em = email.trim().toLowerCase();
    const hash = await bcrypt.hash(String(password), 10);
    const r = await pool.query(
      `INSERT INTO users (email, password_hash, name, phone, position, company)
       VALUES ($1, $2, COALESCE($3, ''), $4, $5, $6)
       RETURNING id, email, username, name, phone, position, company, avatar_url, created_at, updated_at`,
      [
        em,
        hash,
        typeof name === "string" ? name : "",
        phone ?? null,
        position ?? null,
        company ?? null,
      ]
    );
    const row = r.rows[0];
    const token = jwt.sign({ sub: row.id, email: row.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ user: stripUser(row), token });
  } catch (e) {
    if (e.code === "23505") {
      return res.status(409).json({ error: "That email is already registered" });
    }
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const raw =
      req.body?.identifier ?? req.body?.email ?? req.body?.username;
    const { password } = req.body ?? {};
    if (raw == null || String(raw).trim() === "" || password == null) {
      return res
        .status(400)
        .json({ error: "Email or username and password are required" });
    }
    const loginId = String(raw).trim();
    const r = await pool.query(
      `SELECT * FROM users
       WHERE lower(trim(email)) = lower(trim($1))
          OR (username IS NOT NULL AND lower(trim(username)) = lower(trim($1)))`,
      [loginId]
    );
    if (!r.rows.length) {
      return res.status(401).json({ error: "Invalid email, username, or password" });
    }
    const row = r.rows[0];
    const ok = await bcrypt.compare(String(password), row.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email, username, or password" });
    }
    const token = jwt.sign({ sub: row.id, email: row.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ user: stripUser(row), token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.use(jwtGate);

app.get("/api/auth/me", async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, email, username, name, phone, position, company, avatar_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.userId]
    );
    if (!r.rows.length) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json({ user: stripUser(r.rows[0]) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/auth/me", async (req, res) => {
  try {
    const cur = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      req.userId,
    ]);
    if (!cur.rows.length)
      return res.status(401).json({ error: "User not found" });
    const row = cur.rows[0];
    const b = req.body ?? {};
    const name = typeof b.name === "string" ? b.name : row.name;
    const phone = b.phone !== undefined ? b.phone : row.phone;
    const position = b.position !== undefined ? b.position : row.position;
    const company = b.company !== undefined ? b.company : row.company;
    const avatar_url =
      b.avatar_url !== undefined ? b.avatar_url : b.avatar ?? row.avatar_url;

    const r = await pool.query(
      `UPDATE users SET
        name = $1,
        phone = $2,
        position = $3,
        company = $4,
        avatar_url = $5,
        updated_at = NOW()
       WHERE id = $6
       RETURNING id, email, username, name, phone, position, company, avatar_url, created_at, updated_at`,
      [name, phone, position, company, avatar_url, req.userId]
    );
    res.json({ user: stripUser(r.rows[0]) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/bootstrap", async (_req, res) => {
  try {
    const [clients, diamonds, invoices, invoice_items, market_rates, cd] =
      await Promise.all([
        pool.query("SELECT * FROM clients ORDER BY created_at DESC"),
        pool.query("SELECT * FROM diamonds ORDER BY entry_date DESC"),
        pool.query("SELECT * FROM invoices ORDER BY issue_date DESC"),
        pool.query("SELECT * FROM invoice_items"),
        pool.query("SELECT * FROM market_rates ORDER BY date DESC"),
        pool.query(
          "SELECT * FROM company_details ORDER BY updated_at DESC LIMIT 1"
        ),
      ]);
    let company_details = cd.rows[0] || null;
    if (!company_details) {
      company_details = null;
    }
    res.json({
      clients: clients.rows,
      diamonds: diamonds.rows,
      invoices: invoices.rows,
      invoice_items: invoice_items.rows,
      market_rates: market_rates.rows,
      company_details,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.get("/api/invoices/count", async (_req, res) => {
  try {
    const r = await pool.query("SELECT COUNT(*)::int AS c FROM invoices");
    res.json({ count: r.rows[0].c });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** Fetch invoice_items + diamonds for an invoice */
app.get("/api/invoices/:invoiceId/with-diamonds", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const itemsR = await pool.query(
      "SELECT * FROM invoice_items WHERE invoice_id = $1",
      [invoiceId]
    );
    const ids = [...new Set(itemsR.rows.map((i) => i.diamond_id))];
    let diamonds = [];
    if (ids.length) {
      const d = await pool.query(
        "SELECT * FROM diamonds WHERE id = ANY($1::uuid[])",
        [ids]
      );
      diamonds = d.rows;
    }
    res.json({ items: itemsR.rows, diamonds });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** --- clients --- */
app.post("/api/clients", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `INSERT INTO clients (
        name, contact_person, phone, email, company, four_p_plus_rate, four_p_minus_rate, payment_terms, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        b.name,
        b.contact_person,
        b.phone ?? null,
        b.email ?? null,
        b.company ?? "",
        b.four_p_plus_rate,
        b.four_p_minus_rate,
        b.payment_terms ?? null,
        b.notes ?? null,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/clients/:id", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `UPDATE clients SET
        name = $1,
        contact_person = $2,
        phone = $3,
        email = $4,
        company = $5,
        four_p_plus_rate = $6,
        four_p_minus_rate = $7,
        payment_terms = $8,
        notes = $9,
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        b.name,
        b.contact_person,
        b.phone,
        b.email,
        b.company ?? "",
        b.four_p_plus_rate,
        b.four_p_minus_rate,
        b.payment_terms,
        b.notes,
        req.params.id,
      ]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM clients WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** --- diamonds --- */
app.post("/api/diamonds", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `INSERT INTO diamonds (
        entry_date, client_id, kapan_id, number_of_diamonds, weight_in_karats,
        market_rate, category, raw_damage_weight, total_value
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        b.entry_date,
        b.client_id,
        b.kapan_id,
        b.number_of_diamonds,
        b.weight_in_karats,
        b.market_rate,
        b.category,
        b.raw_damage_weight ?? null,
        b.total_value,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/diamonds/:id", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `UPDATE diamonds SET
        entry_date = $1::timestamptz,
        client_id = $2::uuid,
        kapan_id = $3,
        number_of_diamonds = $4,
        weight_in_karats = $5,
        market_rate = $6,
        category = $7,
        raw_damage_weight = $8,
        total_value = $9,
        updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        b.entry_date,
        b.client_id,
        b.kapan_id,
        b.number_of_diamonds,
        b.weight_in_karats,
        b.market_rate,
        b.category,
        b.raw_damage_weight ?? null,
        b.total_value,
        req.params.id,
      ]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/diamonds/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM diamonds WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** --- market_rates --- */
app.post("/api/market-rates", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `INSERT INTO market_rates (date, four_p_plus_rate, four_p_minus_rate)
       VALUES ($1::date,$2,$3)
       RETURNING *`,
      [b.date, b.four_p_plus_rate, b.four_p_minus_rate]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** --- company_details --- */
app.post("/api/company-details", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `INSERT INTO company_details (
        company_name, address, phone, email, gst_number, bank_name, account_number, account_holder_name, ifsc_code, branch
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        b.company_name,
        b.address,
        b.phone ?? null,
        b.email ?? null,
        b.gst_number ?? null,
        b.bank_name,
        b.account_number,
        b.account_holder_name,
        b.ifsc_code,
        b.branch,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/company-details/:id", async (req, res) => {
  try {
    const b = req.body;
    const r = await pool.query(
      `UPDATE company_details SET
        company_name = COALESCE($1, company_name),
        address = COALESCE($2, address),
        phone = $3,
        email = $4,
        gst_number = $5,
        bank_name = COALESCE($6, bank_name),
        account_number = COALESCE($7, account_number),
        account_holder_name = COALESCE($8, account_holder_name),
        ifsc_code = COALESCE($9, ifsc_code),
        branch = COALESCE($10, branch),
        updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        b.company_name,
        b.address,
        b.phone,
        b.email,
        b.gst_number,
        b.bank_name,
        b.account_number,
        b.account_holder_name,
        b.ifsc_code,
        b.branch,
        req.params.id,
      ]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/** --- invoices --- */
app.post("/api/invoices", async (req, res) => {
  const cli = await pool.connect();
  try {
    await cli.query("BEGIN");
    const b = req.body;
    const ins = await cli.query(
      `INSERT INTO invoices (
        invoice_number, issue_date, due_date, client_id, total_amount,
        status, payment_date, payment_method, notes
      ) VALUES ($1,$2::timestamptz,$3::timestamptz,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        b.invoice_number,
        b.issue_date,
        b.due_date,
        b.client_id,
        b.total_amount,
        b.status,
        b.payment_date ?? null,
        b.payment_method ?? null,
        b.notes ?? null,
      ]
    );
    const inv = ins.rows[0];
    const items = [];
    const diamondLines = b.invoice_items || [];
    if (Array.isArray(diamondLines)) {
      for (const row of diamondLines) {
        const rowIns = await cli.query(
          `INSERT INTO invoice_items (invoice_id, diamond_id, quantity, price, description)
           VALUES ($1,$2,$3,$4,$5)
           RETURNING *`,
          [
            inv.id,
            row.diamond_id,
            row.quantity ?? 1,
            row.price,
            row.description ?? null,
          ]
        );
        items.push(rowIns.rows[0]);
      }
    }
    await cli.query("COMMIT");
    res.status(201).json({ invoice: inv, invoice_items: items });
  } catch (e) {
    await cli.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    cli.release();
  }
});

app.put("/api/invoices/:id", async (req, res) => {
  const cli = await pool.connect();
  try {
    await cli.query("BEGIN");
    const b = req.body.invoice;
    await cli.query(
      `UPDATE invoices SET
        issue_date = $1::timestamptz,
        due_date = $2::timestamptz,
        client_id = $3::uuid,
        total_amount = $4,
        status = $5,
        payment_date = $6,
        payment_method = $7,
        notes = $8,
        updated_at = NOW()
       WHERE id = $9`,
      [
        b.issue_date,
        b.due_date,
        b.client_id,
        b.total_amount,
        b.status,
        b.payment_date ?? null,
        b.payment_method ?? null,
        b.notes ?? null,
        req.params.id,
      ]
    );
    await cli.query("DELETE FROM invoice_items WHERE invoice_id = $1", [
      req.params.id,
    ]);
    const invoiceItems = req.body.invoice_items || [];
    for (const row of invoiceItems) {
      await cli.query(
        `INSERT INTO invoice_items (invoice_id, diamond_id, quantity, price, description)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          req.params.id,
          row.diamond_id,
          row.quantity ?? 1,
          row.price,
          row.description ?? null,
        ]
      );
    }
    await cli.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await cli.query("ROLLBACK");
    console.error(e);
    res.status(500).json({ error: e.message });
  } finally {
    cli.release();
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
  const cli = await pool.connect();
  try {
    await cli.query("BEGIN");
    await cli.query("DELETE FROM invoice_items WHERE invoice_id = $1", [
      req.params.id,
    ]);
    await cli.query("DELETE FROM invoices WHERE id = $1", [req.params.id]);
    await cli.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await cli.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    cli.release();
  }
});

const PORT = Number(process.env.API_PORT) || 3333;
const server = app.listen(PORT, () => {
  const redacted = DATABASE_URL.replace(/:[^:@/]+@/, ":****@");
  console.log(`PostgreSQL API listening on http://localhost:${PORT}`);
  console.log(`Using ${redacted}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPort ${PORT} is already in use. Either stop the other process using it,\n` +
        `or set API_PORT in .env to a free port (e.g. API_PORT=3340). Vite reads the same variable.\n`
    );
    process.exit(1);
    return;
  }
  console.error(err);
  process.exit(1);
});
