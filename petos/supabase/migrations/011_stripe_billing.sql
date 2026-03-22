-- Add Stripe billing columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' NOT NULL,
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles (plan);
