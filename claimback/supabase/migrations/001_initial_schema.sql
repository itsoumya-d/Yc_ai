-- Claimback schema
-- Bills table: stores scanned bill analysis results
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL,
  bill_type TEXT NOT NULL CHECK (bill_type IN ('medical', 'utility', 'telecom', 'insurance', 'subscription', 'other')),
  bill_date DATE NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  line_items JSONB NOT NULL DEFAULT '[]',
  overcharges JSONB NOT NULL DEFAULT '[]',
  potential_savings NUMERIC(10, 2) NOT NULL DEFAULT 0,
  summary TEXT,
  status TEXT NOT NULL DEFAULT 'analyzed' CHECK (status IN ('analyzed', 'disputed', 'resolved', 'denied')),
  outcome_amount NUMERIC(10, 2),
  outcome_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dispute letters
CREATE TABLE IF NOT EXISTS dispute_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  letter_content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'responded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_letters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bills" ON bills
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own letters" ON dispute_letters
  FOR ALL USING (auth.uid() = user_id);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER letters_updated_at BEFORE UPDATE ON dispute_letters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
