-- Optional login alias — users may sign in with email OR username
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username)) WHERE username IS NOT NULL;

-- Backfill seed users when migrating existing databases
UPDATE users SET username = 'hiren' WHERE email = 'hiren.patel@example.com' AND username IS NULL;
UPDATE users SET username = 'admin' WHERE email = 'admin' AND username IS NULL;
