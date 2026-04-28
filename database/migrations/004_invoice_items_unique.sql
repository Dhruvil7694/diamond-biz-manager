-- Idempotent seed: one diamond per invoice per line
CREATE UNIQUE INDEX IF NOT EXISTS ux_invoice_items_invoice_diamond
  ON invoice_items (invoice_id, diamond_id);
