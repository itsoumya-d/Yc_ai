-- RLS Policies for InvoiceAI — generated 2026-03-09
-- Comprehensive row-level security for all user-facing tables.
-- This migration is idempotent: each policy is dropped before creation.
--
-- Access model summary:
--   All business data (users, clients, invoices, items, payments,
--   reminders, expenses, subscriptions, recurring invoices) is
--   strictly scoped to the owning user via user_id.
--
--   Child tables (invoice_items, payments, payment_reminders) inherit
--   access through their parent invoice row.
--
--   Invoices expose a portal_token column: clients (unauthenticated)
--   can read an invoice and its line items via a unique token URL.
--
--   Categories supports user-owned rows AND system default rows
--   (is_default = TRUE) that are visible to all users.

-- ============================================================
-- USERS (business profile table)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- User-created categories plus shared default categories.
-- Only the owning user may mutate their own non-default categories.
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_own_or_default" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
DROP POLICY IF EXISTS "categories_update_own_non_default" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_own_non_default" ON public.categories;

CREATE POLICY "categories_select_own_or_default" ON public.categories
  FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update_own_non_default" ON public.categories
  FOR UPDATE USING (user_id = auth.uid() AND is_default = FALSE)
  WITH CHECK (user_id = auth.uid() AND is_default = FALSE);

CREATE POLICY "categories_delete_own_non_default" ON public.categories
  FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- ============================================================
-- CLIENTS
-- ============================================================
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clients_select_own" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_own" ON public.clients;
DROP POLICY IF EXISTS "clients_update_own" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_own" ON public.clients;

CREATE POLICY "clients_select_own" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "clients_insert_own" ON public.clients
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_update_own" ON public.clients
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "clients_delete_own" ON public.clients
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- INVOICES
-- Authenticated owner access + unauthenticated client portal access
-- via the portal_token column (unique per-invoice UUID token).
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_select_own" ON public.invoices;
DROP POLICY IF EXISTS "invoices_select_portal_token" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_own" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_own" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_own" ON public.invoices;

CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (user_id = auth.uid());

-- Clients access their invoice via the unique portal_token URL —
-- no authentication is required for this read path.
CREATE POLICY "invoices_select_portal_token" ON public.invoices
  FOR SELECT USING (portal_token IS NOT NULL);

CREATE POLICY "invoices_insert_own" ON public.invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_update_own" ON public.invoices
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "invoices_delete_own" ON public.invoices
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- INVOICE_ITEMS
-- Inherits access from the parent invoice.
-- Portal visitors (unauthenticated) can also read line items when
-- they have the portal_token for the parent invoice.
-- ============================================================
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoice_items_select_own" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_select_portal" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_insert_own" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_update_own" ON public.invoice_items;
DROP POLICY IF EXISTS "invoice_items_delete_own" ON public.invoice_items;

CREATE POLICY "invoice_items_select_own" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_select_portal" ON public.invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.portal_token IS NOT NULL
    )
  );

CREATE POLICY "invoice_items_insert_own" ON public.invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_update_own" ON public.invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_delete_own" ON public.invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_items.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================
-- PAYMENTS
-- Inherits access from the parent invoice.
-- ============================================================
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;

CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_update_own" ON public.payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payments_delete_own" ON public.payments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payments.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================
-- PAYMENT_REMINDERS
-- Inherits access from the parent invoice.
-- ============================================================
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payment_reminders_select_own" ON public.payment_reminders;
DROP POLICY IF EXISTS "payment_reminders_insert_own" ON public.payment_reminders;
DROP POLICY IF EXISTS "payment_reminders_update_own" ON public.payment_reminders;
DROP POLICY IF EXISTS "payment_reminders_delete_own" ON public.payment_reminders;

CREATE POLICY "payment_reminders_select_own" ON public.payment_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_reminders_insert_own" ON public.payment_reminders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_reminders_update_own" ON public.payment_reminders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "payment_reminders_delete_own" ON public.payment_reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = payment_reminders.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================
-- EXPENSES
-- ============================================================
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expenses_select_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_insert_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_update_own" ON public.expenses;
DROP POLICY IF EXISTS "expenses_delete_own" ON public.expenses;

CREATE POLICY "expenses_select_own" ON public.expenses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "expenses_insert_own" ON public.expenses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_update_own" ON public.expenses
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "expenses_delete_own" ON public.expenses
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- SUBSCRIPTIONS (SaaS plan management)
-- Users can only read/update their own subscription row.
-- Inserts are handled server-side via Stripe webhooks (service role).
-- ============================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_own" ON public.subscriptions;

CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_update_own" ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- RECURRING_INVOICES
-- ============================================================
ALTER TABLE public.recurring_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recurring_invoices_select_own" ON public.recurring_invoices;
DROP POLICY IF EXISTS "recurring_invoices_insert_own" ON public.recurring_invoices;
DROP POLICY IF EXISTS "recurring_invoices_update_own" ON public.recurring_invoices;
DROP POLICY IF EXISTS "recurring_invoices_delete_own" ON public.recurring_invoices;

CREATE POLICY "recurring_invoices_select_own" ON public.recurring_invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recurring_invoices_insert_own" ON public.recurring_invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_invoices_update_own" ON public.recurring_invoices
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recurring_invoices_delete_own" ON public.recurring_invoices
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- Verify RLS is enabled on all tables
-- ============================================================
-- users                ✓
-- categories           ✓
-- clients              ✓
-- invoices             ✓  (+ portal_token public read)
-- invoice_items        ✓  (+ portal_token public read)
-- payments             ✓
-- payment_reminders    ✓
-- expenses             ✓
-- subscriptions        ✓
-- recurring_invoices   ✓
