# Taxonaut -- Database Schema

> Complete database schema for the AI tax strategy optimizer for freelancers. Supabase (PostgreSQL) for cloud sync and financial data, with local SQLite cache for offline transaction viewing.

---

## Entity Relationship Summary

```
users
  |-- 1:N -- bank_connections
  |-- 1:N -- transactions
  |-- 1:N -- categories (custom rules)
  |-- 1:N -- deductions
  |-- 1:N -- quarterly_estimates
  |-- 1:N -- strategies
  |-- 1:N -- tax_years
  |-- 1:N -- subscriptions
  |-- 1:N -- entities (business entity analysis)
  |
  bank_connections
    |-- 1:N -- transactions
  |
  transactions
    |-- N:1 -- categories (assigned category)
    |-- 1:N -- deductions (deductible transactions)
  |
  tax_years
    |-- 1:N -- quarterly_estimates
    |-- 1:N -- strategies
```

**Key relationships:**
- A **user** connects multiple **bank accounts** via Plaid
- **Transactions** flow in from bank connections and get AI-categorized
- **Categories** map to IRS Schedule C line items
- **Deductions** are flagged transactions or discovered opportunities
- **Quarterly estimates** track safe harbor payments per tax year
- **Strategies** are AI-generated tax optimization recommendations
- **Entities** store business structure analysis (Sole Prop vs LLC vs S-Corp)
- **Tax years** partition financial data by fiscal year

---

## Complete SQL DDL

### Users Table

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT,
    business_type TEXT DEFAULT 'freelance' CHECK (business_type IN ('freelance', 'small_business', 'gig_worker', 'online_seller', 'content_creator', 'real_estate', 'other')),
    business_entity TEXT DEFAULT 'sole_proprietor' CHECK (business_entity IN ('sole_proprietor', 'llc_single', 'llc_multi', 's_corp', 'c_corp', 'not_sure')),
    filing_status TEXT DEFAULT 'single' CHECK (filing_status IN ('single', 'married_jointly', 'married_separately', 'head_of_household')),
    state_of_residence TEXT DEFAULT 'CA',
    estimated_annual_income NUMERIC(12, 2) DEFAULT 0,
    has_w2_income BOOLEAN DEFAULT false,
    estimated_w2_income NUMERIC(12, 2) DEFAULT 0,
    industry TEXT DEFAULT 'technology',
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    notification_deadlines BOOLEAN DEFAULT true,
    notification_strategies BOOLEAN DEFAULT true,
    notification_weekly_summary BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Bank Connections Table

```sql
CREATE TABLE public.bank_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plaid_item_id TEXT NOT NULL,
    plaid_access_token TEXT NOT NULL,
    institution_id TEXT,
    institution_name TEXT NOT NULL,
    institution_logo_url TEXT,
    account_id TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit_card', 'business_checking', 'business_savings', 'other')),
    account_mask TEXT,
    current_balance NUMERIC(14, 2),
    available_balance NUMERIC(14, 2),
    currency_code TEXT DEFAULT 'USD',
    status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'syncing', 'error', 'disconnected', 'pending_reauth')),
    last_synced_at TIMESTAMPTZ,
    error_message TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Transactions Table

```sql
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE SET NULL,
    plaid_transaction_id TEXT,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    merchant_name TEXT,
    merchant_logo_url TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    currency_code TEXT DEFAULT 'USD',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    ai_category_suggestion TEXT,
    ai_confidence NUMERIC(5, 2) DEFAULT 0 CHECK (ai_confidence >= 0 AND ai_confidence <= 100),
    business_percentage INTEGER DEFAULT 0 CHECK (business_percentage >= 0 AND business_percentage <= 100),
    is_income BOOLEAN DEFAULT false,
    is_deductible BOOLEAN DEFAULT false,
    deduction_percentage INTEGER DEFAULT 100 CHECK (deduction_percentage >= 0 AND deduction_percentage <= 100),
    is_reviewed BOOLEAN DEFAULT false,
    is_manual_entry BOOLEAN DEFAULT false,
    notes TEXT,
    receipt_url TEXT,
    irs_schedule_line TEXT,
    tax_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    tags JSONB DEFAULT '[]'::jsonb,
    split_transactions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Categories Table

```sql
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    irs_category TEXT,
    schedule_c_line TEXT,
    is_deductible BOOLEAN DEFAULT true,
    default_deduction_percentage INTEGER DEFAULT 100,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    parent_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category rules for auto-categorization
CREATE TABLE public.category_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    merchant_pattern TEXT NOT NULL,
    match_type TEXT DEFAULT 'contains' CHECK (match_type IN ('exact', 'contains', 'starts_with', 'regex')),
    business_percentage INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Deductions Table

```sql
CREATE TABLE public.deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    tax_year INTEGER NOT NULL,
    deduction_type TEXT NOT NULL CHECK (deduction_type IN ('transaction', 'home_office', 'mileage', 'health_insurance', 'retirement', 'equipment_179', 'other')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    deductible_amount NUMERIC(12, 2) NOT NULL,
    tax_savings_estimate NUMERIC(12, 2) DEFAULT 0,
    irs_reference TEXT,
    documentation_status TEXT DEFAULT 'pending' CHECK (documentation_status IN ('pending', 'documented', 'missing', 'not_required')),
    documentation_notes TEXT,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('suggested', 'confirmed', 'dismissed', 'flagged')),
    ai_explanation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Quarterly Estimates Table

```sql
CREATE TABLE public.quarterly_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter >= 1 AND quarter <= 4),
    due_date DATE NOT NULL,
    estimated_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(12, 2) DEFAULT 0,
    payment_date DATE,
    payment_confirmation TEXT,
    calculation_method TEXT DEFAULT 'current_year_90' CHECK (calculation_method IN ('prior_year_100', 'prior_year_110', 'current_year_90', 'annualized_installment')),
    calculation_breakdown JSONB DEFAULT '{}'::jsonb,
    federal_amount NUMERIC(12, 2) DEFAULT 0,
    state_amount NUMERIC(12, 2) DEFAULT 0,
    se_tax_amount NUMERIC(12, 2) DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'paid', 'overdue', 'partial')),
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, tax_year, quarter)
);
```

### Strategies Table

```sql
CREATE TABLE public.strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_analysis TEXT,
    estimated_savings NUMERIC(12, 2) NOT NULL DEFAULT 0,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    complexity TEXT DEFAULT 'low' CHECK (complexity IN ('low', 'medium', 'high')),
    deadline DATE,
    irs_references JSONB DEFAULT '[]'::jsonb,
    implementation_steps JSONB DEFAULT '[]'::jsonb,
    trade_offs TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'implemented', 'dismissed', 'expired')),
    dismiss_reason TEXT,
    ai_model_used TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Entities Table (Business Entity Analysis)

```sql
CREATE TABLE public.entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    net_income_used NUMERIC(12, 2) NOT NULL,
    recommended_entity TEXT,
    sole_prop_total_tax NUMERIC(12, 2),
    llc_total_tax NUMERIC(12, 2),
    s_corp_total_tax NUMERIC(12, 2),
    c_corp_total_tax NUMERIC(12, 2),
    s_corp_reasonable_salary NUMERIC(12, 2),
    s_corp_annual_savings NUMERIC(12, 2),
    break_even_income NUMERIC(12, 2),
    compliance_costs JSONB DEFAULT '{}'::jsonb,
    detailed_breakdown JSONB DEFAULT '{}'::jsonb,
    state_specific_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Tax Years Table

```sql
CREATE TABLE public.tax_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    filing_status TEXT NOT NULL,
    state TEXT NOT NULL,
    total_income NUMERIC(12, 2) DEFAULT 0,
    total_expenses NUMERIC(12, 2) DEFAULT 0,
    net_profit NUMERIC(12, 2) DEFAULT 0,
    total_deductions NUMERIC(12, 2) DEFAULT 0,
    estimated_federal_tax NUMERIC(12, 2) DEFAULT 0,
    estimated_state_tax NUMERIC(12, 2) DEFAULT 0,
    estimated_se_tax NUMERIC(12, 2) DEFAULT 0,
    estimated_total_tax NUMERIC(12, 2) DEFAULT 0,
    effective_tax_rate NUMERIC(5, 2) DEFAULT 0,
    marginal_tax_rate NUMERIC(5, 2) DEFAULT 0,
    total_quarterly_paid NUMERIC(12, 2) DEFAULT 0,
    qbi_deduction NUMERIC(12, 2) DEFAULT 0,
    prior_year_tax NUMERIC(12, 2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'filed', 'extended', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, year)
);
```

### Subscriptions Table

```sql
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'strategist', 'pro')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    connected_accounts_limit INTEGER DEFAULT 2,
    strategies_per_month_limit INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## Indexes

```sql
-- Users
CREATE INDEX idx_users_email ON public.users(email);

-- Bank Connections
CREATE INDEX idx_bank_connections_user_id ON public.bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON public.bank_connections(status);
CREATE INDEX idx_bank_connections_plaid_item ON public.bank_connections(plaid_item_id);

-- Transactions
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_bank_connection_id ON public.transactions(bank_connection_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_tax_year ON public.transactions(tax_year);
CREATE INDEX idx_transactions_is_deductible ON public.transactions(user_id, is_deductible) WHERE is_deductible = true;
CREATE INDEX idx_transactions_is_income ON public.transactions(user_id, is_income) WHERE is_income = true;
CREATE INDEX idx_transactions_not_reviewed ON public.transactions(user_id, is_reviewed) WHERE is_reviewed = false;
CREATE INDEX idx_transactions_plaid_id ON public.transactions(plaid_transaction_id);
CREATE INDEX idx_transactions_user_year_date ON public.transactions(user_id, tax_year, date DESC);
CREATE INDEX idx_transactions_merchant_trgm ON public.transactions USING gin (merchant_name gin_trgm_ops);
CREATE INDEX idx_transactions_description_trgm ON public.transactions USING gin (description gin_trgm_ops);

-- Categories
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_system ON public.categories(is_system) WHERE is_system = true;
CREATE INDEX idx_category_rules_user_id ON public.category_rules(user_id);
CREATE INDEX idx_category_rules_category_id ON public.category_rules(category_id);

-- Deductions
CREATE INDEX idx_deductions_user_id ON public.deductions(user_id);
CREATE INDEX idx_deductions_tax_year ON public.deductions(tax_year);
CREATE INDEX idx_deductions_transaction_id ON public.deductions(transaction_id);
CREATE INDEX idx_deductions_status ON public.deductions(status);
CREATE INDEX idx_deductions_user_year ON public.deductions(user_id, tax_year);

-- Quarterly Estimates
CREATE INDEX idx_quarterly_user_id ON public.quarterly_estimates(user_id);
CREATE INDEX idx_quarterly_year ON public.quarterly_estimates(tax_year);
CREATE INDEX idx_quarterly_due_date ON public.quarterly_estimates(due_date);
CREATE INDEX idx_quarterly_status ON public.quarterly_estimates(status);

-- Strategies
CREATE INDEX idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX idx_strategies_tax_year ON public.strategies(tax_year);
CREATE INDEX idx_strategies_priority ON public.strategies(priority);
CREATE INDEX idx_strategies_status ON public.strategies(status);
CREATE INDEX idx_strategies_user_year ON public.strategies(user_id, tax_year);

-- Entities
CREATE INDEX idx_entities_user_id ON public.entities(user_id);

-- Tax Years
CREATE INDEX idx_tax_years_user_id ON public.tax_years(user_id);
CREATE INDEX idx_tax_years_year ON public.tax_years(year);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Enable trigram extension for transaction search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

---

## Row Level Security Policies

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quarterly_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Bank Connections: strictly user-owned (sensitive financial data)
CREATE POLICY "Users can CRUD own bank connections" ON public.bank_connections FOR ALL USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can CRUD own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Categories: system categories readable by all, custom ones user-owned
CREATE POLICY "System categories are readable" ON public.categories FOR SELECT USING (is_system = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON public.categories FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Category Rules
CREATE POLICY "Users can CRUD own category rules" ON public.category_rules FOR ALL USING (auth.uid() = user_id);

-- Deductions
CREATE POLICY "Users can CRUD own deductions" ON public.deductions FOR ALL USING (auth.uid() = user_id);

-- Quarterly Estimates
CREATE POLICY "Users can CRUD own quarterly estimates" ON public.quarterly_estimates FOR ALL USING (auth.uid() = user_id);

-- Strategies
CREATE POLICY "Users can CRUD own strategies" ON public.strategies FOR ALL USING (auth.uid() = user_id);

-- Entities
CREATE POLICY "Users can CRUD own entity analyses" ON public.entities FOR ALL USING (auth.uid() = user_id);

-- Tax Years
CREATE POLICY "Users can CRUD own tax years" ON public.tax_years FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "Users can read own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);
```

---

## Database Functions & Triggers

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.bank_connections FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.deductions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.quarterly_estimates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.strategies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tax_years FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));

    INSERT INTO public.subscriptions (user_id, plan, status, connected_accounts_limit, strategies_per_month_limit)
    VALUES (NEW.id, 'free', 'active', 2, 3);

    INSERT INTO public.tax_years (user_id, year, filing_status, state)
    VALUES (NEW.id, EXTRACT(YEAR FROM CURRENT_DATE), 'single', 'CA');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update tax year totals when transactions change
CREATE OR REPLACE FUNCTION public.update_tax_year_totals()
RETURNS TRIGGER AS $$
DECLARE
    target_year INTEGER;
    target_user UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_year := OLD.tax_year;
        target_user := OLD.user_id;
    ELSE
        target_year := NEW.tax_year;
        target_user := NEW.user_id;
    END IF;

    UPDATE public.tax_years SET
        total_income = COALESCE((
            SELECT SUM(amount) FROM public.transactions
            WHERE user_id = target_user AND tax_year = target_year AND is_income = true
        ), 0),
        total_expenses = COALESCE((
            SELECT SUM(ABS(amount)) FROM public.transactions
            WHERE user_id = target_user AND tax_year = target_year AND is_income = false AND business_percentage > 0
        ), 0),
        total_deductions = COALESCE((
            SELECT SUM(deductible_amount) FROM public.deductions
            WHERE user_id = target_user AND tax_year = target_year AND status = 'confirmed'
        ), 0)
    WHERE user_id = target_user AND year = target_year;

    UPDATE public.tax_years SET
        net_profit = total_income - total_expenses
    WHERE user_id = target_user AND year = target_year;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_tax_totals_on_transaction
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_tax_year_totals();

CREATE TRIGGER update_tax_totals_on_deduction
    AFTER INSERT OR UPDATE OR DELETE ON public.deductions
    FOR EACH ROW EXECUTE FUNCTION public.update_tax_year_totals();

-- Calculate estimated federal tax (simplified progressive brackets)
CREATE OR REPLACE FUNCTION public.calculate_federal_tax(
    p_taxable_income NUMERIC,
    p_filing_status TEXT
)
RETURNS NUMERIC AS $$
DECLARE
    tax NUMERIC := 0;
    remaining NUMERIC;
BEGIN
    remaining := GREATEST(p_taxable_income, 0);

    -- 2025 brackets for Single (simplified)
    IF p_filing_status = 'single' THEN
        IF remaining > 609350 THEN tax := tax + (remaining - 609350) * 0.37; remaining := 609350; END IF;
        IF remaining > 243725 THEN tax := tax + (remaining - 243725) * 0.35; remaining := 243725; END IF;
        IF remaining > 191950 THEN tax := tax + (remaining - 191950) * 0.32; remaining := 191950; END IF;
        IF remaining > 100525 THEN tax := tax + (remaining - 100525) * 0.24; remaining := 100525; END IF;
        IF remaining > 47150 THEN tax := tax + (remaining - 47150) * 0.22; remaining := 47150; END IF;
        IF remaining > 11600 THEN tax := tax + (remaining - 11600) * 0.12; remaining := 11600; END IF;
        tax := tax + remaining * 0.10;
    END IF;

    RETURN ROUND(tax, 2);
END;
$$ LANGUAGE plpgsql;

-- Audit log for sensitive financial operations
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON public.audit_log(created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own audit log" ON public.audit_log FOR SELECT USING (auth.uid() = user_id);
```

---

## TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  business_type: 'freelance' | 'small_business' | 'gig_worker' | 'online_seller' | 'content_creator' | 'real_estate' | 'other';
  business_entity: 'sole_proprietor' | 'llc_single' | 'llc_multi' | 's_corp' | 'c_corp' | 'not_sure';
  filing_status: 'single' | 'married_jointly' | 'married_separately' | 'head_of_household';
  state_of_residence: string;
  estimated_annual_income: number;
  has_w2_income: boolean;
  estimated_w2_income: number;
  industry: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface BankConnection {
  id: string;
  user_id: string;
  plaid_item_id: string;
  plaid_access_token: string;
  institution_id: string | null;
  institution_name: string;
  institution_logo_url: string | null;
  account_id: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit_card' | 'business_checking' | 'business_savings' | 'other';
  account_mask: string | null;
  current_balance: number | null;
  available_balance: number | null;
  status: 'connected' | 'syncing' | 'error' | 'disconnected' | 'pending_reauth';
  last_synced_at: string | null;
  error_message: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: string;
  user_id: string;
  bank_connection_id: string | null;
  plaid_transaction_id: string | null;
  date: string;
  description: string;
  merchant_name: string | null;
  amount: number;
  category_id: string | null;
  ai_category_suggestion: string | null;
  ai_confidence: number;
  business_percentage: number;
  is_income: boolean;
  is_deductible: boolean;
  deduction_percentage: number;
  is_reviewed: boolean;
  is_manual_entry: boolean;
  notes: string | null;
  receipt_url: string | null;
  irs_schedule_line: string | null;
  tax_year: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  user_id: string | null;
  name: string;
  display_name: string;
  irs_category: string | null;
  schedule_c_line: string | null;
  is_deductible: boolean;
  default_deduction_percentage: number;
  description: string | null;
  is_system: boolean;
  parent_category_id: string | null;
  created_at: string;
}

interface Deduction {
  id: string;
  user_id: string;
  transaction_id: string | null;
  tax_year: number;
  deduction_type: 'transaction' | 'home_office' | 'mileage' | 'health_insurance' | 'retirement' | 'equipment_179' | 'other';
  category: string;
  description: string;
  amount: number;
  deductible_amount: number;
  tax_savings_estimate: number;
  irs_reference: string | null;
  documentation_status: 'pending' | 'documented' | 'missing' | 'not_required';
  status: 'suggested' | 'confirmed' | 'dismissed' | 'flagged';
  ai_explanation: string | null;
  created_at: string;
  updated_at: string;
}

interface QuarterlyEstimate {
  id: string;
  user_id: string;
  tax_year: number;
  quarter: number;
  due_date: string;
  estimated_amount: number;
  amount_paid: number;
  payment_date: string | null;
  payment_confirmation: string | null;
  calculation_method: 'prior_year_100' | 'prior_year_110' | 'current_year_90' | 'annualized_installment';
  calculation_breakdown: Record<string, unknown>;
  federal_amount: number;
  state_amount: number;
  se_tax_amount: number;
  status: 'upcoming' | 'paid' | 'overdue' | 'partial';
  created_at: string;
  updated_at: string;
}

interface Strategy {
  id: string;
  user_id: string;
  tax_year: number;
  title: string;
  description: string;
  detailed_analysis: string | null;
  estimated_savings: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  complexity: 'low' | 'medium' | 'high';
  deadline: string | null;
  irs_references: string[];
  implementation_steps: { step: number; description: string; completed: boolean }[];
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed' | 'expired';
  created_at: string;
  updated_at: string;
}

interface TaxYear {
  id: string;
  user_id: string;
  year: number;
  filing_status: string;
  state: string;
  total_income: number;
  total_expenses: number;
  net_profit: number;
  total_deductions: number;
  estimated_federal_tax: number;
  estimated_state_tax: number;
  estimated_se_tax: number;
  estimated_total_tax: number;
  effective_tax_rate: number;
  marginal_tax_rate: number;
  total_quarterly_paid: number;
  qbi_deduction: number;
  status: 'active' | 'filed' | 'extended' | 'archived';
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'strategist' | 'pro';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  connected_accounts_limit: number;
  strategies_per_month_limit: number;
  created_at: string;
  updated_at: string;
}
```

---

## Seed Data

```sql
-- System categories (IRS Schedule C mapping)
INSERT INTO public.categories (id, name, display_name, irs_category, schedule_c_line, is_deductible, default_deduction_percentage, description, is_system) VALUES
    (gen_random_uuid(), 'advertising', 'Advertising & Marketing', 'Advertising', 'Line 8', true, 100, 'Advertising, marketing, and promotional expenses', true),
    (gen_random_uuid(), 'car_truck', 'Car & Truck Expenses', 'Car and truck expenses', 'Line 9', true, 100, 'Vehicle expenses for business use', true),
    (gen_random_uuid(), 'contract_labor', 'Contract Labor', 'Contract labor', 'Line 11', true, 100, 'Payments to independent contractors', true),
    (gen_random_uuid(), 'insurance', 'Business Insurance', 'Insurance (other than health)', 'Line 15', true, 100, 'Business liability, property, and professional insurance', true),
    (gen_random_uuid(), 'interest', 'Interest', 'Interest', 'Line 16', true, 100, 'Mortgage and business loan interest', true),
    (gen_random_uuid(), 'legal_professional', 'Legal & Professional Services', 'Legal and professional services', 'Line 17', true, 100, 'Accounting, legal, and consulting fees', true),
    (gen_random_uuid(), 'office_expenses', 'Office Expenses', 'Office expenses', 'Line 18', true, 100, 'Office supplies, postage, printing', true),
    (gen_random_uuid(), 'rent_lease', 'Rent or Lease', 'Rent or lease', 'Line 20', true, 100, 'Office rent, equipment leasing, coworking', true),
    (gen_random_uuid(), 'repairs', 'Repairs & Maintenance', 'Repairs and maintenance', 'Line 21', true, 100, 'Equipment and property repairs', true),
    (gen_random_uuid(), 'supplies', 'Supplies', 'Supplies', 'Line 22', true, 100, 'Materials and supplies consumed in business', true),
    (gen_random_uuid(), 'taxes_licenses', 'Taxes & Licenses', 'Taxes and licenses', 'Line 23', true, 100, 'Business licenses, permits, state taxes', true),
    (gen_random_uuid(), 'travel', 'Travel', 'Travel', 'Line 24a', true, 100, 'Business travel: airfare, hotels, ground transport', true),
    (gen_random_uuid(), 'meals', 'Meals', 'Meals', 'Line 24b', true, 50, 'Business meals (50% deductible)', true),
    (gen_random_uuid(), 'utilities', 'Utilities', 'Utilities', 'Line 25', true, 100, 'Phone, internet, electricity for business', true),
    (gen_random_uuid(), 'software', 'Software & Subscriptions', 'Other expenses', 'Line 27', true, 100, 'SaaS tools, software licenses, digital subscriptions', true),
    (gen_random_uuid(), 'education', 'Education & Training', 'Other expenses', 'Line 27', true, 100, 'Courses, conferences, books, certifications', true),
    (gen_random_uuid(), 'equipment', 'Equipment & Depreciation', 'Depreciation', 'Line 13', true, 100, 'Equipment purchases and depreciation (Section 179)', true),
    (gen_random_uuid(), 'home_office', 'Home Office', 'Business use of home', 'Line 30', true, 100, 'Home office deduction (simplified or actual)', true),
    (gen_random_uuid(), 'health_insurance', 'Health Insurance', 'Self-employed health insurance', 'Form 1040 Line 17', true, 100, 'Self-employed health insurance deduction', true),
    (gen_random_uuid(), 'income', 'Income', NULL, NULL, false, 0, 'Business income received', true),
    (gen_random_uuid(), 'personal', 'Personal', NULL, NULL, false, 0, 'Personal expenses (not deductible)', true);
```

---

## Local SQLite Cache Notes

```
-- Tables mirrored locally for offline transaction viewing:
-- transactions (full history for current user, encrypted at rest)
-- categories (system + custom categories)
-- category_rules (for offline auto-categorization)
-- deductions (current tax year)
-- tax_years (all years for the user)
-- quarterly_estimates (current year)
--
-- CRITICAL: Bank connection tokens (plaid_access_token) are NEVER
-- stored locally. They remain server-side only.
--
-- Offline behavior:
-- 1. Transaction list/search works fully offline
-- 2. Manual categorization queued for sync
-- 3. Tax liability estimates computed locally using cached data
-- 4. Bank sync requires internet
-- 5. Strategy generation requires internet (AI API)
--
-- Sync strategy:
-- 1. On app launch: pull new transactions from Supabase
-- 2. Manual edits: write locally, queue for cloud sync
-- 3. On reconnect: push queued changes, pull new transactions
-- 4. Conflict resolution: server wins for transactions (Plaid is source of truth),
--    client wins for user categorizations with timestamp merge
--
-- Encryption: SQLite database encrypted with SQLCipher,
-- key derived from user's auth token
```

---

## Migration Strategy

### File Naming Convention

```
migrations/
  001_initial_schema.sql          -- Users, extensions (pg_trgm)
  002_bank_connections.sql        -- Bank connections table
  003_categories.sql              -- Categories, category rules
  004_transactions.sql            -- Transactions table
  005_deductions.sql              -- Deductions table
  006_quarterly_estimates.sql     -- Quarterly estimates
  007_strategies_entities.sql     -- Strategies, entities
  008_tax_years.sql               -- Tax years
  009_subscriptions.sql           -- Subscriptions
  010_audit_log.sql               -- Audit log table
  011_indexes.sql                 -- All indexes
  012_rls_policies.sql            -- Row level security
  013_functions_triggers.sql      -- Functions and triggers
  014_seed_categories.sql         -- System IRS categories
```

### Execution Order

1. Run migrations sequentially (001 through 014)
2. Enable `pg_trgm` extension in migration 001
3. Categories seeded before transactions (FK dependency)
4. RLS policies applied after all tables exist
5. Triggers applied after functions are created
6. System categories seeded last
7. Local SQLite schema generated from TypeScript interfaces with SQLCipher encryption

---

*Schema designed for an AI tax strategist that proactively finds money freelancers leave on the table.*
