/**
 * Apply database/seed.sql (run after apply-schema.mjs).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/diamond";

const sqlPath = path.join(__dirname, "seed.sql");
const sql = fs.readFileSync(sqlPath, "utf8");

const pool = new pg.Pool({ connectionString: DATABASE_URL });

try {
  console.log("Applying", sqlPath);
  await pool.query(sql);
  console.log("seed.sql applied OK.");
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await pool.end();
}
