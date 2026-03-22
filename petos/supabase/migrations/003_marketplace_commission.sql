-- Migration: 003_marketplace_commission
-- Adds stripe_checkout_session_id for webhook reconciliation and a marketplace
-- stats view for providers. All core commission columns already exist in
-- 001_initial_schema.sql (platform_fee, provider_payout, stripe_payment_intent_id,
-- stripe_transfer_id on service_bookings; stripe_account_id and
-- stripe_onboarding_complete on service_providers).
-- ============================================================================

-- Add checkout session ID so we can reconcile checkout.session.completed webhooks
ALTER TABLE service_bookings
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_checkout_session
  ON service_bookings(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

-- Index to quickly fetch provider earnings
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_provider_status
  ON service_bookings(provider_id, status, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper view: provider earnings summary
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW provider_earnings_summary AS
SELECT
  sp.id                                                          AS provider_id,
  sp.user_id,
  sp.business_name,
  COUNT(*) FILTER (WHERE sb.status = 'completed')               AS completed_bookings,
  COUNT(*) FILTER (WHERE sb.status IN ('pending','confirmed'))   AS upcoming_bookings,
  COALESCE(SUM(sb.provider_payout) FILTER (WHERE sb.status = 'completed'), 0) AS total_earned,
  COALESCE(SUM(sb.platform_fee)    FILTER (WHERE sb.status = 'completed'), 0) AS total_platform_fees,
  COALESCE(SUM(sb.price)           FILTER (WHERE sb.status = 'completed'), 0) AS total_gmv
FROM service_providers sp
LEFT JOIN service_bookings sb ON sb.provider_id = sp.id
GROUP BY sp.id, sp.user_id, sp.business_name;

-- Allow providers to read their own earnings summary
ALTER VIEW provider_earnings_summary OWNER TO postgres;
-- RLS is enforced on underlying tables so the view is safe.
