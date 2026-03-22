-- ClaimForge: Court-Ready Document Exports
-- Tracks Bates-numbered export bundles for litigation

CREATE TABLE IF NOT EXISTS public.court_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  claim_id UUID NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  bates_prefix TEXT NOT NULL,
  bates_start INTEGER NOT NULL DEFAULT 1,
  bates_end INTEGER,
  bates_padding INTEGER DEFAULT 6,
  bates_separator TEXT DEFAULT '-',
  format TEXT NOT NULL DEFAULT 'pdf_bundle' CHECK (format IN ('pdf_bundle', 'zip')),
  confidentiality TEXT DEFAULT 'none' CHECK (confidentiality IN ('none', 'confidential', 'attorneys_eyes_only', 'highly_confidential')),
  include_index BOOLEAN DEFAULT true,
  include_privilege_log BOOLEAN DEFAULT true,
  include_cover_sheet BOOLEAN DEFAULT true,
  document_count INTEGER DEFAULT 0,
  file_size_bytes BIGINT,
  storage_path TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.court_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own exports" ON public.court_exports
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX court_exports_user_id_idx ON public.court_exports(user_id);
CREATE INDEX court_exports_claim_id_idx ON public.court_exports(claim_id);
CREATE INDEX court_exports_status_idx ON public.court_exports(status);
