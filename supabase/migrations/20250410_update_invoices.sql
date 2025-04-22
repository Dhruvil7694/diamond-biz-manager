-- Update invoices table to include diamond_ids array
ALTER TABLE invoices
ALTER COLUMN diamond_ids SET DATA TYPE text[] USING ARRAY[diamond_ids]::text[],
ALTER COLUMN status SET DATA TYPE text,
ADD CONSTRAINT invoices_status_check CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));
