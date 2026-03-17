-- Migrate billing from Stripe to Paddle
alter table public.profiles
  add column if not exists paddle_customer_id text unique,
  add column if not exists paddle_subscription_id text unique,
  add column if not exists paddle_subscription_status text;

-- Keep old stripe columns for data retention (don't delete user data)
-- New signups will only populate paddle_ columns
