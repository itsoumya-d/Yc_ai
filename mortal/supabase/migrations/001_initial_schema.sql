-- ============================================================
-- Mortal: End-of-Life Planning Platform
-- Initial Schema Migration
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- Profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  date_of_birth date,
  phone text,
  address_city text,
  address_state char(2),
  address_zip text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'plus', 'family')),
  subscription_expires_at timestamptz,
  onboarding_completed boolean not null default false,
  onboarding_completed_at timestamptz,
  plan_completeness_percent integer not null default 0,
  last_check_in_at timestamptz,
  notification_email boolean not null default true,
  notification_sms boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Wishes
-- ============================================================
create table public.wishes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in (
    'funeral', 'burial', 'cremation', 'memorial',
    'organ_donation', 'medical_directive', 'care_preferences',
    'personal_message', 'other'
  )),
  title text not null,
  content text not null,
  is_ai_generated boolean not null default false,
  is_finalized boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

create policy "Users can manage own wishes" on public.wishes
  for all using (auth.uid() = user_id);

create index idx_wishes_user on public.wishes(user_id);

-- ============================================================
-- Digital Assets
-- ============================================================
create table public.digital_assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in (
    'email', 'social_media', 'financial', 'crypto',
    'cloud_storage', 'subscription', 'domain',
    'gaming', 'shopping', 'other'
  )),
  service_name text not null,
  username text,
  url text,
  notes text,
  action_on_death text,
  estimated_value_cents integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.digital_assets enable row level security;

create policy "Users can manage own assets" on public.digital_assets
  for all using (auth.uid() = user_id);

create index idx_digital_assets_user on public.digital_assets(user_id);

-- ============================================================
-- Documents (Vault)
-- ============================================================
create table public.documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (category in (
    'will', 'trust', 'power_of_attorney', 'healthcare_directive',
    'insurance', 'deed', 'financial', 'medical',
    'identification', 'tax', 'other'
  )),
  title text not null,
  description text,
  storage_path text not null,
  file_size_bytes integer,
  mime_type text,
  is_encrypted boolean not null default true,
  expires_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.documents enable row level security;

create policy "Users can manage own documents" on public.documents
  for all using (auth.uid() = user_id);

create index idx_documents_user on public.documents(user_id);

-- ============================================================
-- Trusted Contacts
-- ============================================================
create table public.trusted_contacts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  relationship text not null,
  role text not null check (role in (
    'executor', 'power_of_attorney', 'healthcare_proxy',
    'beneficiary', 'guardian', 'digital_executor',
    'emergency_contact', 'other'
  )),
  access_level text not null default 'emergency_only' check (access_level in (
    'full', 'documents_only', 'wishes_only',
    'assets_only', 'emergency_only', 'custom'
  )),
  is_verified boolean not null default false,
  verified_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trusted_contacts enable row level security;

create policy "Users can manage own contacts" on public.trusted_contacts
  for all using (auth.uid() = user_id);

create index idx_trusted_contacts_user on public.trusted_contacts(user_id);

-- ============================================================
-- Access Grants
-- ============================================================
create table public.access_grants (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid not null references public.trusted_contacts(id) on delete cascade,
  resource_type text not null,
  resource_id uuid,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  is_active boolean not null default true
);

alter table public.access_grants enable row level security;

create policy "Users can manage own grants" on public.access_grants
  for all using (auth.uid() = user_id);

create index idx_access_grants_user on public.access_grants(user_id);
create index idx_access_grants_contact on public.access_grants(contact_id);

-- ============================================================
-- Check-In Configs
-- ============================================================
create table public.check_in_configs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  frequency text not null check (frequency in (
    'daily', 'weekly', 'biweekly', 'monthly', 'quarterly'
  )),
  preferred_time time not null default '09:00',
  preferred_channel text not null default 'email' check (preferred_channel in ('email', 'sms', 'both')),
  grace_period_hours integer not null default 24,
  max_missed_before_escalation integer not null default 3,
  is_active boolean not null default true,
  next_check_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.check_in_configs enable row level security;

create policy "Users can manage own config" on public.check_in_configs
  for all using (auth.uid() = user_id);

-- ============================================================
-- Check-Ins
-- ============================================================
create table public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  config_id uuid not null references public.check_in_configs(id) on delete cascade,
  scheduled_at timestamptz not null,
  responded_at timestamptz,
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'missed', 'escalated'
  )),
  response_method text,
  created_at timestamptz not null default now()
);

alter table public.check_ins enable row level security;

create policy "Users can manage own check-ins" on public.check_ins
  for all using (auth.uid() = user_id);

create index idx_check_ins_user on public.check_ins(user_id);
create index idx_check_ins_status on public.check_ins(status);

-- ============================================================
-- Escalation Events
-- ============================================================
create table public.escalation_events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  check_in_id uuid references public.check_ins(id) on delete set null,
  action text not null check (action in (
    'notify_contact', 'send_reminder', 'grant_access', 'release_documents'
  )),
  contact_id uuid references public.trusted_contacts(id) on delete set null,
  message text,
  executed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.escalation_events enable row level security;

create policy "Users can view own escalations" on public.escalation_events
  for select using (auth.uid() = user_id);

create index idx_escalation_events_user on public.escalation_events(user_id);

-- ============================================================
-- Legal Templates
-- ============================================================
create table public.legal_templates (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in (
    'will', 'living_will', 'power_of_attorney', 'healthcare_proxy',
    'trust', 'beneficiary_designation', 'digital_asset_directive',
    'letter_of_instruction'
  )),
  title text not null,
  description text not null,
  template_content text not null,
  required_fields text[] not null default '{}',
  state_specific boolean not null default false,
  state_codes text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.legal_templates enable row level security;

create policy "Anyone can view active templates" on public.legal_templates
  for select using (is_active = true);

-- ============================================================
-- User Legal Documents
-- ============================================================
create table public.user_legal_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid references public.legal_templates(id) on delete set null,
  category text not null check (category in (
    'will', 'living_will', 'power_of_attorney', 'healthcare_proxy',
    'trust', 'beneficiary_designation', 'digital_asset_directive',
    'letter_of_instruction'
  )),
  title text not null,
  content text not null,
  field_values jsonb not null default '{}',
  is_draft boolean not null default true,
  is_signed boolean not null default false,
  signed_at timestamptz,
  witness_names text[] not null default '{}',
  storage_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_legal_documents enable row level security;

create policy "Users can manage own legal docs" on public.user_legal_documents
  for all using (auth.uid() = user_id);

create index idx_user_legal_documents_user on public.user_legal_documents(user_id);

-- ============================================================
-- Conversations (AI Chat)
-- ============================================================
create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conversation_type text not null check (conversation_type in (
    'wishes_guidance', 'legal_help', 'general_planning', 'document_review'
  )),
  title text,
  messages jsonb not null default '[]',
  message_count integer not null default 0,
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can manage own conversations" on public.conversations
  for all using (auth.uid() = user_id);

create index idx_conversations_user on public.conversations(user_id);

-- ============================================================
-- Updated At Trigger
-- ============================================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_wishes_updated_at
  before update on public.wishes
  for each row execute function public.update_updated_at_column();

create trigger update_digital_assets_updated_at
  before update on public.digital_assets
  for each row execute function public.update_updated_at_column();

create trigger update_documents_updated_at
  before update on public.documents
  for each row execute function public.update_updated_at_column();

create trigger update_trusted_contacts_updated_at
  before update on public.trusted_contacts
  for each row execute function public.update_updated_at_column();

create trigger update_check_in_configs_updated_at
  before update on public.check_in_configs
  for each row execute function public.update_updated_at_column();

create trigger update_user_legal_documents_updated_at
  before update on public.user_legal_documents
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- Storage Bucket for Document Vault
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict do nothing;

create policy "Users can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can view own documents" on storage.objects
  for select using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own documents" on storage.objects
  for delete using (
    bucket_id = 'documents' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
