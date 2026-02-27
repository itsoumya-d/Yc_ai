-- Claimback Database Schema

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro')),
  total_saved DECIMAL(12, 2) DEFAULT 0,
  disputes_won INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles USING (auth.uid() = id);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bill_type TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  bill_date DATE,
  due_date DATE,
  total_amount DECIMAL(12, 2) NOT NULL,
  fair_total DECIMAL(12, 2),
  image_url TEXT,
  storage_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzed', 'disputed', 'resolved')),
  analysis_raw JSONB,
  ai_dispute_letter TEXT,
  total_overcharge DECIMAL(12, 2) DEFAULT 0,
  dispute_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own bills" ON bills USING (auth.uid() = user_id);

-- Line Items
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES bills(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  code TEXT,
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10, 2),
  billed_amount DECIMAL(10, 2) NOT NULL,
  fair_amount DECIMAL(10, 2),
  is_overcharge BOOLEAN DEFAULT FALSE,
  overcharge_reason TEXT,
  overcharge_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own line items" ON line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = line_items.bill_id AND bills.user_id = auth.uid())
  );
CREATE POLICY "Users can insert own line items" ON line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = line_items.bill_id AND bills.user_id = auth.uid())
  );

-- Disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  bill_id UUID REFERENCES bills(id) NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'won', 'lost', 'open', 'in_progress', 'cancelled')),
  dispute_letter TEXT,
  dispute_amount DECIMAL(12, 2) DEFAULT 0,
  amount_disputed DECIMAL(12, 2) DEFAULT 0,
  resolved_amount DECIMAL(12, 2),
  provider_name TEXT,
  bill_type TEXT,
  submitted_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  outcome_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own disputes" ON disputes USING (auth.uid() = user_id);

-- Savings Events
CREATE TABLE IF NOT EXISTS savings_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  dispute_id UUID REFERENCES disputes(id),
  bill_id UUID REFERENCES bills(id),
  amount_saved DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount DECIMAL(12, 2),
  provider_name TEXT,
  event_type TEXT DEFAULT 'dispute_won',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own savings" ON savings_events USING (auth.uid() = user_id);

-- Storage
INSERT INTO storage.buckets (id, name, public) VALUES ('bill-images', 'bill-images', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own bills" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bill-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view own bills" ON storage.objects
  FOR SELECT USING (bucket_id = 'bill-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own bills" ON storage.objects
  FOR DELETE USING (bucket_id = 'bill-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
