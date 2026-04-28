-- Dummy data for local testing (safe to re-run — skips rows that already exist)
-- Requires schema.sql (including users).
-- Logins: hiren.patel@example.com / Hp#9879225849 | admin / admin (display name: test user)

INSERT INTO users (id, email, username, password_hash, name, phone, position, company)
VALUES (
  'd0000004-0004-4004-8004-000000000001',
  'hiren.patel@example.com',
  'hiren',
  '$2b$10$mh8Dbc0ALpSbt/I/CngId./9207JWEqEkR7gQZW.gEWmysTYDDZVy',
  'Hiren Patel',
  '+91 9879225849',
  'Diamond Merchant',
  'Diamond Business Management Systems'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, username, password_hash, name)
VALUES (
  'd0000004-0004-4004-8004-000000000002',
  'admin',
  'admin',
  '$2b$10$euVnbwMmoQsHsDuZVwizWOyrmIaPjQ.yU5bU0TVDAip5tTjj6xLk.',
  'test user'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO clients (id, name, contact_person, company, phone, email, four_p_plus_rate, four_p_minus_rate, payment_terms, notes)
VALUES
  ('a0000001-0001-4001-8001-000000000001', 'Mehta Diamonds', 'Raj Mehta', 'Mehta Gems Pvt Ltd', '+91-9876543210', 'raj@mehtagems.example', 4850, 120, 'Net 30', 'Preferred client'),
  ('a0000001-0001-4001-8001-000000000002', 'Joshi Enterprises', 'Priya Joshi', 'Joshi Trading', '+91-9123456789', 'priya@joshi.example', 4700, 115, 'Net 15', NULL)
ON CONFLICT (id) DO NOTHING;

-- One benchmark row per day (skip if we already have a rate for CURRENT_DATE)
INSERT INTO market_rates (date, four_p_plus_rate, four_p_minus_rate)
SELECT CURRENT_DATE, 5000, 125
WHERE NOT EXISTS (
  SELECT 1 FROM market_rates mr WHERE mr.date = CURRENT_DATE
);

INSERT INTO company_details (company_name, address, phone, email, gst_number, bank_name, account_number, account_holder_name, ifsc_code, branch)
SELECT
  'Rashi Diamonds',
  'Bamanji Ni seri, Rushab Tower, Lal Darwaja, Surat',
  '9879225849',
  'hirenpatel29111997@gmail.com',
  '27ABCDE1234F1Z5',
  'HDFC Bank',
  '12312312311',
  'Hirenbhai R Patel',
  'BARB0KIMXXX',
  'Kim, Surat'
WHERE NOT EXISTS (SELECT 1 FROM company_details LIMIT 1);

INSERT INTO diamonds (id, entry_date, client_id, kapan_id, number_of_diamonds, weight_in_karats, market_rate, category, raw_damage_weight, total_value)
VALUES
  ('b0000002-0002-4002-8002-000000000001', NOW(), 'a0000001-0001-4001-8001-000000000001', 'K203A', 80, 18.5, 5000, '4P Plus', NULL, 89725),
  ('b0000002-0002-4002-8002-000000000002', NOW(), 'a0000001-0001-4001-8001-000000000001', 'K204B', 120, 14.0, 5000, '4P Minus', NULL, 14400)
ON CONFLICT (id) DO NOTHING;

INSERT INTO invoices (id, invoice_number, issue_date, due_date, client_id, total_amount, status, notes)
VALUES (
  'c0000003-0003-4003-8003-000000000001',
  'INV-202604-0001',
  NOW(),
  NOW() + INTERVAL '14 days',
  'a0000001-0001-4001-8001-000000000001',
  89725 + 14400,
  'pending',
  'Seed invoice'
)
ON CONFLICT (invoice_number) DO NOTHING;

INSERT INTO invoice_items (invoice_id, diamond_id, quantity, price, description)
VALUES
  ('c0000003-0003-4003-8003-000000000001', 'b0000002-0002-4002-8002-000000000001', 1, 89725, 'K203A — seed line'),
  ('c0000003-0003-4003-8003-000000000001', 'b0000002-0002-4002-8002-000000000002', 1, 14400, 'K204B — seed line')
ON CONFLICT (invoice_id, diamond_id) DO NOTHING;
