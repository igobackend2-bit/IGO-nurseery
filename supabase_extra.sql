-- EXTRA TABLES FOR SUPABASE MIGRATION

CREATE TABLE IF NOT EXISTS pending_verifications (
  email TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE IF NOT EXISTS customer_sessions (
  token TEXT PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure customers table has the necessary columns from the SQLite version
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS deletion_requested BOOLEAN DEFAULT FALSE;
