-- CompliBot Initial Schema
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ORGANIZATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage their org (simplified - production would scope this)
CREATE POLICY "Authenticated users can manage organizations"
  ON public.organizations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FRAMEWORKS
-- =============================================
CREATE TABLE IF NOT EXISTS public.frameworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('soc2', 'gdpr', 'hipaa', 'iso27001')),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'audit_ready', 'certified')),
  compliance_score INTEGER NOT NULL DEFAULT 0 CHECK (compliance_score >= 0 AND compliance_score <= 100),
  enabled BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMPTZ,
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, type)
);

CREATE INDEX idx_frameworks_org_id ON public.frameworks(organization_id);

ALTER TABLE public.frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org frameworks"
  ON public.frameworks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = frameworks.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = frameworks.organization_id
    )
  );

-- =============================================
-- CONTROLS
-- =============================================
CREATE TABLE IF NOT EXISTS public.controls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  framework_id UUID NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  control_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'implemented', 'not_applicable')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  owner TEXT,
  notes TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_controls_framework_id ON public.controls(framework_id);
CREATE INDEX idx_controls_org_id ON public.controls(organization_id);

ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org controls"
  ON public.controls FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = controls.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = controls.organization_id
    )
  );

-- =============================================
-- POLICIES
-- =============================================
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id UUID REFERENCES public.frameworks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  version TEXT NOT NULL DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'archived')),
  owner TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policies_org_id ON public.policies(organization_id);

ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org policies"
  ON public.policies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = policies.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = policies.organization_id
    )
  );

-- =============================================
-- EVIDENCE
-- =============================================
CREATE TABLE IF NOT EXISTS public.evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  control_id UUID REFERENCES public.controls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT,
  collected_by TEXT,
  collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_org_id ON public.evidence(organization_id);
CREATE INDEX idx_evidence_control_id ON public.evidence(control_id);

ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org evidence"
  ON public.evidence FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = evidence.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = evidence.organization_id
    )
  );

-- =============================================
-- TASKS
-- =============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  control_id UUID REFERENCES public.controls(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'blocked')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  assignee TEXT,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tasks_org_id ON public.tasks(organization_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their org tasks"
  ON public.tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = tasks.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.organization_id = tasks.organization_id
    )
  );

-- =============================================
-- UPDATED_AT TRIGGERS
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_frameworks_updated_at
  BEFORE UPDATE ON public.frameworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_controls_updated_at
  BEFORE UPDATE ON public.controls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON public.policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKET FOR EVIDENCE
-- =============================================
-- Run this in Supabase dashboard Storage section:
-- Create bucket 'evidence' with RLS enabled
-- INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', false);
