-- GovPass: Government Benefits Navigator
-- Initial schema with pgcrypto for encrypted PII, RLS, triggers

-- ─── Extensions ─────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Enum Types ─────────────────────────────────────
create type language_enum as enum ('en', 'es');
create type income_bracket_enum as enum ('0_15000', '15000_30000', '30000_50000', '50000_75000', '75000_plus');
create type employment_status_enum as enum ('employed', 'unemployed', 'self_employed', 'retired', 'disabled', 'student');
create type citizenship_status_enum as enum ('citizen', 'permanent_resident', 'visa_holder', 'undocumented', 'refugee', 'prefer_not_say');
create type subscription_tier_enum as enum ('free', 'plus', 'family');
create type relationship_enum as enum ('spouse', 'child', 'parent', 'sibling', 'grandparent', 'grandchild', 'other');
create type age_bracket_enum as enum ('under_1', '1_4', '5_12', '13_17', '18_24', '25_54', '55_64', '65_plus');
create type document_type_enum as enum ('drivers_license', 'state_id', 'passport', 'ssn_card', 'w2', 'tax_return', 'pay_stub', 'birth_certificate', 'immigration_doc', 'utility_bill', 'bank_statement', 'lease_agreement', 'other');
create type benefit_category_enum as enum ('food', 'healthcare', 'housing', 'cash', 'tax_credit', 'childcare', 'education', 'disability', 'communication', 'energy', 'immigration', 'other');
create type eligibility_status_enum as enum ('likely_eligible', 'may_be_eligible', 'not_eligible', 'unknown', 'needs_more_info');
create type application_status_enum as enum ('draft', 'in_progress', 'submitted', 'pending', 'approved', 'denied', 'appealing', 'expired', 'withdrawn');
create type notification_type_enum as enum ('deadline_reminder', 'renewal_alert', 'missing_document', 'status_check', 'approval', 'denial', 'appeal_deadline', 'document_expiry', 'eligibility_update', 'welcome', 'general');
create type notification_priority_enum as enum ('low', 'normal', 'high', 'urgent');
create type notification_channel_enum as enum ('push', 'sms', 'both');
create type agency_type_enum as enum ('federal', 'state', 'county', 'city', 'nonprofit', 'legal_aid', 'community_health', 'library', 'other');
create type session_type_enum as enum ('form_guidance', 'eligibility_qa', 'general_help', 'appeal_guidance');

-- ─── Profiles ───────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  preferred_language language_enum not null default 'en',
  household_size integer not null default 1 check (household_size between 1 and 20),
  household_income_bracket income_bracket_enum,
  annual_income_cents bigint check (annual_income_cents >= 0),
  employment_status employment_status_enum,
  citizenship_status citizenship_status_enum,
  has_children_under_18 boolean not null default false,
  number_of_dependents integer not null default 0 check (number_of_dependents between 0 and 20),
  state_code char(2),
  county text,
  subscription_tier subscription_tier_enum not null default 'free',
  subscription_expires_at timestamptz,
  push_opted_in boolean not null default false,
  sms_opted_in boolean not null default false,
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '08:00',
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  last_eligibility_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Household Members ──────────────────────────────
create table household_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  relationship relationship_enum not null,
  age_bracket age_bracket_enum,
  is_dependent boolean not null default false,
  has_disability boolean not null default false,
  is_pregnant boolean not null default false,
  is_veteran boolean not null default false,
  employment_status employment_status_enum,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Scanned Documents ──────────────────────────────
create table scanned_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  document_type document_type_enum not null,
  raw_image_path text,
  encrypted_extracted_data bytea, -- pgcrypto encrypted PII
  extraction_confidence numeric(5,4),
  field_confidences jsonb not null default '{}',
  is_in_vault boolean not null default false,
  is_verified_by_user boolean not null default false,
  verification_notes text,
  expires_at timestamptz not null,
  scanned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Document Vault ─────────────────────────────────
create table document_vault_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  scanned_document_id uuid references scanned_documents(id) on delete set null,
  document_type document_type_enum not null,
  display_name text not null,
  display_name_es text,
  storage_path text not null,
  file_size_bytes bigint,
  document_date date,
  document_expiry_date date,
  is_expired boolean not null default false,
  tags text[] not null default '{}',
  notes text,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Benefit Programs (reference data) ──────────────
create table benefit_programs (
  id uuid primary key default uuid_generate_v4(),
  program_code text unique not null,
  program_name text not null,
  program_name_es text not null,
  short_description text not null,
  short_description_es text not null,
  description text not null default '',
  description_es text not null default '',
  agency text not null,
  agency_url text,
  agency_phone text,
  category benefit_category_enum not null,
  eligibility_rules jsonb not null default '{}',
  income_limit_fpl_percent integer,
  estimated_annual_value_min integer,
  estimated_annual_value_max integer,
  application_url text,
  application_url_es text,
  required_documents text[] not null default '{}',
  application_steps jsonb not null default '[]',
  application_steps_es jsonb not null default '[]',
  estimated_application_minutes integer not null default 30,
  renewal_period_months integer,
  processing_time_days_min integer,
  processing_time_days_max integer,
  is_federal boolean not null default true,
  state_codes text[],
  requires_interview boolean not null default false,
  allows_online_application boolean not null default true,
  is_active boolean not null default true,
  priority_score integer not null default 50,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─── Eligibility Results ────────────────────────────
create table eligibility_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references benefit_programs(id) on delete cascade,
  is_eligible boolean not null default false,
  eligibility_status eligibility_status_enum not null default 'unknown',
  confidence numeric(5,4) not null default 0.0,
  estimated_annual_value integer,
  estimated_monthly_value integer,
  missing_documents text[] not null default '{}',
  missing_information text[] not null default '{}',
  disqualifying_factors text[] not null default '{}',
  qualifying_factors text[] not null default '{}',
  income_ratio_to_limit numeric(5,4),
  calculated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique(user_id, program_id)
);

-- ─── Saved Benefits ─────────────────────────────────
create table saved_benefits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references benefit_programs(id) on delete cascade,
  notes text,
  saved_at timestamptz not null default now(),
  unique(user_id, program_id)
);

-- ─── Applications ───────────────────────────────────
create table applications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  program_id uuid not null references benefit_programs(id) on delete cascade,
  status application_status_enum not null default 'draft',
  current_step integer not null default 0,
  total_steps integer not null default 5,
  completed_steps integer[] not null default '{}',
  documents_attached uuid[] not null default '{}',
  submitted_at timestamptz,
  agency_confirmation_number text,
  agency_case_number text,
  next_action text,
  next_action_es text,
  next_deadline timestamptz,
  approval_date date,
  approval_amount_annual integer,
  denial_date date,
  denial_reason text,
  denial_reason_es text,
  appeal_deadline timestamptz,
  renewal_date date,
  notes text,
  is_renewal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Notification Schedules ─────────────────────────
create table notification_schedules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  program_id uuid references benefit_programs(id) on delete set null,
  notification_type notification_type_enum not null,
  scheduled_for timestamptz not null,
  channel notification_channel_enum not null default 'push',
  message_en text not null,
  message_es text not null default '',
  title_en text,
  title_es text,
  deep_link text,
  priority notification_priority_enum not null default 'normal',
  is_sent boolean not null default false,
  is_read boolean not null default false,
  is_dismissed boolean not null default false,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Referral Agencies ──────────────────────────────
create table referral_agencies (
  id uuid primary key default uuid_generate_v4(),
  agency_name text not null,
  agency_name_es text not null default '',
  agency_type agency_type_enum not null,
  description text,
  description_es text,
  programs_served text[] not null default '{}',
  phone text,
  email text,
  website text,
  address_city text,
  address_state char(2),
  hours_of_operation jsonb,
  languages_spoken text[] not null default '{en}',
  accepts_walk_ins boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── AI Guidance Sessions ───────────────────────────
create table ai_guidance_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  application_id uuid references applications(id) on delete set null,
  program_id uuid references benefit_programs(id) on delete set null,
  session_type session_type_enum not null,
  current_step integer,
  language language_enum not null default 'en',
  messages jsonb not null default '[]',
  message_count integer not null default 0,
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─── Audit Log ──────────────────────────────────────
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- ─── Indexes ────────────────────────────────────────
create index idx_household_members_user on household_members(user_id);
create index idx_scanned_documents_user on scanned_documents(user_id);
create index idx_scanned_documents_type on scanned_documents(document_type);
create index idx_vault_items_user on document_vault_items(user_id);
create index idx_vault_items_type on document_vault_items(document_type);
create index idx_vault_items_expiry on document_vault_items(document_expiry_date) where document_expiry_date is not null;
create index idx_benefit_programs_category on benefit_programs(category);
create index idx_benefit_programs_active on benefit_programs(is_active, priority_score desc);
create index idx_eligibility_user on eligibility_results(user_id);
create index idx_eligibility_program on eligibility_results(program_id);
create index idx_eligibility_eligible on eligibility_results(user_id) where is_eligible = true;
create index idx_saved_benefits_user on saved_benefits(user_id);
create index idx_applications_user on applications(user_id);
create index idx_applications_status on applications(user_id, status);
create index idx_applications_deadline on applications(next_deadline) where next_deadline is not null;
create index idx_notifications_user on notification_schedules(user_id);
create index idx_notifications_unread on notification_schedules(user_id) where is_read = false and is_sent = true;
create index idx_notifications_scheduled on notification_schedules(scheduled_for) where is_sent = false;
create index idx_guidance_user on ai_guidance_sessions(user_id);
create index idx_guidance_active on ai_guidance_sessions(user_id) where is_active = true;
create index idx_audit_log_user on audit_log(user_id);
create index idx_audit_log_table on audit_log(table_name, created_at desc);

-- ─── Row Level Security ─────────────────────────────
alter table profiles enable row level security;
alter table household_members enable row level security;
alter table scanned_documents enable row level security;
alter table document_vault_items enable row level security;
alter table eligibility_results enable row level security;
alter table saved_benefits enable row level security;
alter table applications enable row level security;
alter table notification_schedules enable row level security;
alter table ai_guidance_sessions enable row level security;
alter table audit_log enable row level security;
-- benefit_programs and referral_agencies are public read

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can view own household" on household_members for select using (auth.uid() = user_id);
create policy "Users can insert own household" on household_members for insert with check (auth.uid() = user_id);
create policy "Users can update own household" on household_members for update using (auth.uid() = user_id);
create policy "Users can delete own household" on household_members for delete using (auth.uid() = user_id);

create policy "Users can view own scans" on scanned_documents for select using (auth.uid() = user_id);
create policy "Users can insert own scans" on scanned_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own scans" on scanned_documents for update using (auth.uid() = user_id);

create policy "Users can view own vault" on document_vault_items for select using (auth.uid() = user_id);
create policy "Users can insert own vault" on document_vault_items for insert with check (auth.uid() = user_id);
create policy "Users can update own vault" on document_vault_items for update using (auth.uid() = user_id);
create policy "Users can delete own vault" on document_vault_items for delete using (auth.uid() = user_id);

create policy "Users can view own eligibility" on eligibility_results for select using (auth.uid() = user_id);
create policy "Users can insert own eligibility" on eligibility_results for insert with check (auth.uid() = user_id);
create policy "Users can update own eligibility" on eligibility_results for update using (auth.uid() = user_id);

create policy "Users can view own saved" on saved_benefits for select using (auth.uid() = user_id);
create policy "Users can insert own saved" on saved_benefits for insert with check (auth.uid() = user_id);
create policy "Users can delete own saved" on saved_benefits for delete using (auth.uid() = user_id);

create policy "Users can view own applications" on applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on applications for update using (auth.uid() = user_id);

create policy "Users can view own notifications" on notification_schedules for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notification_schedules for update using (auth.uid() = user_id);

create policy "Users can view own sessions" on ai_guidance_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions" on ai_guidance_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on ai_guidance_sessions for update using (auth.uid() = user_id);

create policy "Users can view own audit" on audit_log for select using (auth.uid() = user_id);

-- ─── Updated At Triggers ────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger trg_household_updated_at before update on household_members for each row execute function update_updated_at();
create trigger trg_scanned_updated_at before update on scanned_documents for each row execute function update_updated_at();
create trigger trg_vault_updated_at before update on document_vault_items for each row execute function update_updated_at();
create trigger trg_applications_updated_at before update on applications for each row execute function update_updated_at();

-- ─── Auto-create Profile on Signup ──────────────────
create or replace function handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into profiles (id, preferred_language)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'preferred_language')::language_enum, 'en')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Seed Data: Benefit Programs ────────────────────
insert into benefit_programs (program_code, program_name, program_name_es, short_description, short_description_es, agency, category, eligibility_rules, income_limit_fpl_percent, estimated_annual_value_min, estimated_annual_value_max, estimated_application_minutes, renewal_period_months, is_federal, allows_online_application, priority_score) values
  ('SNAP', 'Supplemental Nutrition Assistance Program', 'Programa de Asistencia Nutricional Suplementaria', 'Monthly food benefits for low-income households', 'Beneficios alimentarios mensuales para hogares de bajos ingresos', 'USDA / State DHS', 'food', '{"max_income_fpl_percent": 130, "citizenship_required": true}', 130, 2400, 7200, 20, 12, true, true, 95),
  ('MEDICAID', 'Medicaid', 'Medicaid', 'Free or low-cost health coverage', 'Cobertura de salud gratuita o de bajo costo', 'CMS / State Medicaid', 'healthcare', '{"max_income_fpl_percent": 138, "citizenship_required": true}', 138, 6000, 12000, 30, 12, true, true, 95),
  ('CHIP', 'Children''s Health Insurance Program', 'Programa de Seguro de Salud Infantil', 'Low-cost health coverage for children', 'Cobertura de salud de bajo costo para niños', 'CMS / State CHIP', 'healthcare', '{"max_income_fpl_percent": 200, "children_required": true}', 200, 3000, 8000, 25, 12, true, true, 90),
  ('WIC', 'Women, Infants, and Children', 'Mujeres, Infantes y Niños', 'Nutrition program for pregnant women and young children', 'Programa de nutrición para mujeres embarazadas y niños pequeños', 'USDA / State WIC', 'food', '{"max_income_fpl_percent": 185, "children_required": true}', 185, 600, 1800, 15, 6, true, false, 88),
  ('HCV', 'Housing Choice Vouchers (Section 8)', 'Vales de Elección de Vivienda (Sección 8)', 'Rental assistance for low-income families', 'Asistencia de alquiler para familias de bajos ingresos', 'HUD / Local PHA', 'housing', '{"max_income_fpl_percent": 100}', 100, 8000, 18000, 45, 12, true, true, 92),
  ('EITC', 'Earned Income Tax Credit', 'Crédito Tributario por Ingreso del Trabajo', 'Tax credit for low to moderate income workers', 'Crédito fiscal para trabajadores de ingresos bajos a moderados', 'IRS', 'tax_credit', '{"employment_required": true}', null, 600, 7400, 30, 12, true, true, 93),
  ('CTC', 'Child Tax Credit', 'Crédito Tributario por Hijos', 'Tax credit per qualifying child', 'Crédito fiscal por hijo calificado', 'IRS', 'tax_credit', '{"children_required": true}', null, 2000, 3600, 20, 12, true, true, 90),
  ('LIHEAP', 'Low Income Home Energy Assistance', 'Asistencia de Energía para Hogares de Bajos Ingresos', 'Help paying heating and cooling bills', 'Ayuda para pagar facturas de calefacción y refrigeración', 'HHS / State Agency', 'energy', '{"max_income_fpl_percent": 150}', 150, 300, 1200, 15, 12, true, true, 80),
  ('TANF', 'Temporary Assistance for Needy Families', 'Asistencia Temporal para Familias Necesitadas', 'Cash assistance for families with children', 'Asistencia en efectivo para familias con hijos', 'HHS / State DHS', 'cash', '{"max_income_fpl_percent": 100, "children_required": true}', 100, 2400, 6000, 30, 6, true, true, 85),
  ('SSI', 'Supplemental Security Income', 'Ingreso de Seguridad Suplementario', 'Monthly payments for disabled or elderly individuals', 'Pagos mensuales para personas discapacitadas o ancianas', 'SSA', 'disability', '{"max_income_fpl_percent": 75}', 75, 9000, 10800, 45, null, true, true, 88),
  ('PELL', 'Federal Pell Grant', 'Beca Federal Pell', 'College grant for undergrad students', 'Beca universitaria para estudiantes de pregrado', 'Dept of Education', 'education', '{"max_income_fpl_percent": 250}', 250, 700, 7400, 30, 12, true, true, 82),
  ('LIFELINE', 'Lifeline Phone/Internet', 'Línea de Vida Teléfono/Internet', 'Discount on phone or internet service', 'Descuento en servicio de teléfono o internet', 'FCC / USAC', 'communication', '{"max_income_fpl_percent": 135}', 135, 110, 200, 10, 12, true, true, 70),
  ('CCDF', 'Child Care Assistance', 'Asistencia para el Cuidado Infantil', 'Subsidized childcare for working families', 'Cuidado infantil subsidiado para familias trabajadoras', 'HHS / State Agency', 'childcare', '{"max_income_fpl_percent": 200, "children_required": true, "employment_required": true}', 200, 3000, 12000, 25, 12, true, true, 85),
  ('FHAP', 'Federally-Assisted Housing', 'Vivienda con Asistencia Federal', 'Public housing for low-income families', 'Vivienda pública para familias de bajos ingresos', 'HUD / Local PHA', 'housing', '{"max_income_fpl_percent": 80}', 80, 6000, 15000, 40, 12, true, true, 78),
  ('NSLP', 'National School Lunch Program', 'Programa Nacional de Almuerzos Escolares', 'Free or reduced-price school meals', 'Comidas escolares gratuitas o a precio reducido', 'USDA / School District', 'food', '{"max_income_fpl_percent": 185, "children_required": true}', 185, 800, 2000, 10, 12, true, true, 86);
