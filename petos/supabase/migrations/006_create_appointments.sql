CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME,
  vet_name TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  type TEXT NOT NULL DEFAULT 'checkup' CHECK (type IN ('checkup','vaccination','sick_visit','surgery','dental','grooming','other')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','missed')),
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_pet ON public.appointments(pet_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage appointments of own pets" ON public.appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.pets WHERE pets.id = appointments.pet_id AND pets.user_id = auth.uid())
  );
