CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  stage TEXT NOT NULL DEFAULT 'prospecting'
    CHECK (stage IN ('prospecting','qualification','proposal','negotiation','closed_won','closed_lost')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  close_date DATE,
  ai_score NUMERIC(5,2) NOT NULL DEFAULT 50,
  health_status TEXT NOT NULL DEFAULT 'healthy'
    CHECK (health_status IN ('healthy','at_risk','critical','stalled')),
  probability NUMERIC(5,2) NOT NULL DEFAULT 20,
  description TEXT NOT NULL DEFAULT '',
  next_action TEXT,
  next_action_due DATE,
  lost_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own deals" ON deals FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_deals_user ON deals(user_id, stage);
CREATE INDEX idx_deals_updated ON deals(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'note'
    CHECK (activity_type IN ('email','call','meeting','note','task')),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  sentiment NUMERIC(3,2),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own activities" ON deal_activities FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_activities_deal ON deal_activities(deal_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals ON DELETE CASCADE,
  close_probability NUMERIC(5,2) NOT NULL DEFAULT 0,
  risk_factors TEXT[] NOT NULL DEFAULT '{}',
  next_actions TEXT[] NOT NULL DEFAULT '{}',
  deal_health TEXT NOT NULL DEFAULT 'healthy',
  analysis_summary TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view predictions" ON ai_predictions FOR ALL
  USING (deal_id IN (SELECT id FROM deals WHERE user_id = auth.uid()));
