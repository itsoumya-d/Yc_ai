CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'mild' CHECK (severity IN ('mild','moderate','severe','emergency')),
  photo_url TEXT,
  ai_analysis TEXT,
  ai_recommendation TEXT,
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptoms_pet ON public.symptoms(pet_id);
CREATE INDEX idx_symptoms_severity ON public.symptoms(severity);
CREATE INDEX idx_symptoms_resolved ON public.symptoms(resolved);

ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage symptoms of own pets" ON public.symptoms
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = symptoms.pet_id AND pets.user_id = auth.uid())
  );
