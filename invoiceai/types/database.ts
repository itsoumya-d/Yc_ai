// Database types for InvoiceAI
// Auto-generated from Supabase schema

export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_email: string | null;
  tax_id: string | null;
  logo_url: string | null;
  brand_color: string;
  secondary_color: string | null;
  font_preference: string;
  auth_provider: string;
  email_verified: boolean;
  onboarding_completed: boolean;
  default_currency: string;
  default_payment_terms: number;
  invoice_number_format: string;
  next_invoice_number: number;
  default_template: 'classic' | 'modern' | 'minimal' | 'bold' | 'creative';
  default_notes: string | null;
  default_terms: string | null;
  stripe_connect_account_id: string | null;
  stripe_connect_onboarded: boolean;
  timezone: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  company: string | null;
  email: string;
  emails_additional: string[];
  phone: string | null;
  address: string | null;
  default_payment_terms: number | null;
  default_currency: string;
  notes: string | null;
  health_score: 'excellent' | 'good' | 'fair' | 'at_risk' | 'unknown';
  total_billed: number;
  total_paid: number;
  total_outstanding: number;
  average_days_to_pay: number | null;
  invoice_count: number;
  status: 'active' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string | null;
  recurring_invoice_id: string | null;
  invoice_number: string;
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issue_date: string;
  due_date: string;
  payment_terms: number;
  currency: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  discount_type: 'flat' | 'percent';
  total: number;
  amount_paid: number;
  amount_due: number;
  notes: string | null;
  terms: string | null;
  template: string;
  personal_message: string | null;
  pdf_url: string | null;
  portal_token: string;
  ai_input_text: string | null;
  ai_prediction_score: number | null;
  ai_prediction_details: Record<string, unknown> | null;
  sent_at: string | null;
  viewed_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  overdue_since: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_method: 'card' | 'ach' | 'manual' | 'other';
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded' | 'disputed';
  client_email: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  refund_amount: number | null;
  refunded_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PaymentReminder {
  id: string;
  invoice_id: string;
  reminder_type: 'before_due' | 'on_due' | 'friendly' | 'reminder' | 'firm' | 'final';
  sequence_step: number;
  scheduled_at: string;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  subject: string;
  body: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'skipped' | 'failed';
  ai_generated: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  is_tax_deductible: boolean;
  created_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id: string | null;
  client_id: string | null;
  invoice_id: string | null;
  description: string;
  amount: number;
  currency: string;
  date: string;
  receipt_url: string | null;
  is_billable: boolean;
  is_tax_deductible: boolean;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'business';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  trial_end: string | null;
  invoices_sent_this_month: number;
  invoice_limit: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Extended types with relations
export interface InvoiceWithDetails extends Invoice {
  client: Client | null;
  items: InvoiceItem[];
  payments: Payment[];
}

export interface ClientWithInvoices extends Client {
  invoices: Invoice[];
}

export interface RecurringInvoice {
  id: string;
  user_id: string;
  client_id: string | null;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'custom';
  interval_count: number;
  custom_interval_days: number | null;
  start_date: string;
  end_date: string | null;
  next_invoice_date: string;
  last_generated_at: string | null;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  paused_at: string | null;
  paused_reason: string | null;
  cancelled_at: string | null;
  invoice_template: {
    payment_terms: number;
    currency: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    discount_type: 'flat' | 'percent';
    total: number;
    notes: string | null;
    terms: string | null;
    template: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      amount: number;
    }>;
  };
  consecutive_failures: number;
  last_failure_at: string | null;
  last_failure_reason: string | null;
  total_invoices_generated: number;
  total_amount_billed: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface RecurringInvoiceWithClient extends RecurringInvoice {
  client: Client | null;
}
