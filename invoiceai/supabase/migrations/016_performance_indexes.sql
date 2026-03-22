-- 016_performance_indexes.sql
-- Performance indexes for common query patterns

-- invoices: dashboard overview — status filter + date sort
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_status_created
  ON invoices (user_id, status, created_at DESC);

-- invoices: overdue detection (due_date range queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_due_status
  ON invoices (user_id, due_date, status);

-- invoices: analytics date-range queries (issue_date bucketing)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_issue_date
  ON invoices (user_id, issue_date DESC);

-- invoices: recurring invoice linkage
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_recurring_id
  ON invoices (recurring_invoice_id)
  WHERE recurring_invoice_id IS NOT NULL;

-- clients: quick lookup by name within a user's account
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_name
  ON clients (user_id, name);

-- invoice_items: joining to invoice (cascade queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_items_invoice
  ON invoice_items (invoice_id);

-- payments: lookup by invoice + filter by status
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice_status
  ON payments (invoice_id, status);

-- payment_reminders: scheduled reminders per invoice
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payment_reminders_invoice_status
  ON payment_reminders (invoice_id, status)
  WHERE status = 'scheduled';

-- expenses: user expense history with date sort
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_date_category
  ON expenses (user_id, date DESC, category);

-- recurring_invoices: active recurring invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recurring_invoices_user_status
  ON recurring_invoices (user_id, status);
