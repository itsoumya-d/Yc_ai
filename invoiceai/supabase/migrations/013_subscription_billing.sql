-- Add subscription billing columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users (plan);
