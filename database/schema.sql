-- Diamond Business Manager — PostgreSQL schema
-- Apply to database: CREATE DATABASE diamond; then \c diamond and run this script
-- Requires: PostgreSQL 14+ (uses gen_random_uuid from pgcrypto)

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------------
-- clients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  contact_person    TEXT NOT NULL,
  company           TEXT NOT NULL DEFAULT '',
  phone             TEXT,
  email             TEXT,
  four_p_plus_rate  DOUBLE PRECISION NOT NULL DEFAULT 0,
  four_p_minus_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_terms     TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_created ON clients (created_at DESC);

-- ---------------------------------------------------------------------------
-- market_rates (benchmark daily rates)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_rates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date               DATE NOT NULL,
  four_p_plus_rate   DOUBLE PRECISION NOT NULL,
  four_p_minus_rate  DOUBLE PRECISION NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_rates_date ON market_rates (date DESC);

-- ---------------------------------------------------------------------------
-- diamonds (inventory lots)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS diamonds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_id           UUID NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  kapan_id            TEXT NOT NULL,
  number_of_diamonds  INTEGER NOT NULL CHECK (number_of_diamonds > 0),
  weight_in_karats    DOUBLE PRECISION NOT NULL CHECK (weight_in_karats > 0),
  market_rate         DOUBLE PRECISION NOT NULL,
  category            TEXT NOT NULL CHECK (category IN ('4P Plus', '4P Minus')),
  raw_damage_weight   DOUBLE PRECISION,
  total_value         DOUBLE PRECISION NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diamonds_client ON diamonds (client_id);
CREATE INDEX IF NOT EXISTS idx_diamonds_entry ON diamonds (entry_date DESC);

-- ---------------------------------------------------------------------------
-- company_details (invoice letterhead — singleton row preferred)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS company_details (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name       TEXT NOT NULL,
  address            TEXT NOT NULL,
  phone              TEXT,
  email              TEXT,
  gst_number         TEXT,
  bank_name          TEXT NOT NULL,
  account_number     TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  ifsc_code          TEXT NOT NULL,
  branch             TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- invoices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number    TEXT NOT NULL UNIQUE,
  issue_date        TIMESTAMPTZ NOT NULL,
  due_date          TIMESTAMPTZ NOT NULL,
  client_id         UUID NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  total_amount      DOUBLE PRECISION NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'draft', 'sent', 'overdue', 'cancelled')),
  payment_date      TIMESTAMPTZ,
  payment_method    TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices (client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issue ON invoices (issue_date DESC);

-- ---------------------------------------------------------------------------
-- invoice_items (line items — one row per diamond on an invoice)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoice_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    UUID NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  diamond_id    UUID NOT NULL REFERENCES diamonds (id) ON DELETE RESTRICT,
  quantity      INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price         DOUBLE PRECISION NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_diamond ON invoice_items (diamond_id);

-- One line per diamond per invoice (enables idempotent seed ON CONFLICT)
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_items_invoice_diamond
  ON invoice_items (invoice_id, diamond_id);

-- Optional helper: ensure one diamond is not on two open invoices (business rule) — omitted for flexibility

COMMENT ON TABLE clients IS 'Wholesale / client parties with agreed 4P Plus/Minus rates';
COMMENT ON TABLE diamonds IS 'Inventory lots; category derived from avg weight vs 0.15 ct in app logic';
COMMENT ON TABLE invoice_items IS 'Links invoices to diamonds for line-level pricing';

-- ---------------------------------------------------------------------------
-- users (app login / profile)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  username        TEXT UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL DEFAULT '',
  phone           TEXT,
  position        TEXT,
  company         TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username)) WHERE username IS NOT NULL;
