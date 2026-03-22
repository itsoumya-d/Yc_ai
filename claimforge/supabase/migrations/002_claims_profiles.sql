-- ClaimForge: Insurance Claims Profiles and Claims Tables
-- Adds simplified profiles and claims tracking

create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  user_type text default 'claimant',
  onboarding_completed_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.claims (
  id uuid default gen_random_uuid() primary key,
  claimant_id uuid references public.profiles(id),
  claim_number text unique,
  claim_type text,
  incident_date date,
  description text,
  estimated_amount decimal(12,2),
  approved_amount decimal(12,2),
  status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists public.claim_documents (
  id uuid default gen_random_uuid() primary key,
  claim_id uuid references public.claims(id),
  document_type text,
  file_url text,
  ocr_extracted_data jsonb,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.claims enable row level security;
alter table public.claim_documents enable row level security;

create policy "profiles_own" on public.profiles for all using (auth.uid() = id);
create policy "claims_own" on public.claims for all using (auth.uid() = claimant_id);
create policy "docs_own" on public.claim_documents for all using (auth.uid() IS NOT NULL);

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
  for each row execute procedure public.handle_new_user();
