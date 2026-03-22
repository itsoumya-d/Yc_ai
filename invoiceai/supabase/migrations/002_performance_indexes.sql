-- InvoiceAI: Performance Indexes
-- Migration: 002_performance_indexes

CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- invoices: user invoices by status + date (most common query)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_status_created
  ON invoices(user_id, status, created_at DESC);

-- invoices: client's invoices
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_user_client_created
  ON invoices(user_id, client_id, created_at DESC);

-- invoices: overdue detection
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_overdue
  ON invoices(due_date ASC) WHERE status = 'sent';

-- payments: user payments by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_created
  ON payments(user_id, created_at DESC);

-- payments: by invoice for reconciliation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_invoice
  ON payments(invoice_id, created_at DESC);

-- expenses: user expenses by date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expenses_user_created
  ON expenses(user_id, created_at DESC);

-- transactions: bank connection transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_user_date
  ON transactions(user_id, transaction_date DESC);

-- clients: user's clients (alphabetical)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_clients_user_name
  ON clients(user_id, company_name ASC);

-- invoice_activities: audit trail per invoice
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoice_activities_invoice_created
  ON invoice_activities(invoice_id, created_at DESC);
