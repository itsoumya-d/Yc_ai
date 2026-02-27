-- ============================================================
-- FieldLens: AI Mentor for Tradespeople
-- Initial Schema Migration
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ─── Types ───────────────────────────────────────────

create type trade_type as enum ('plumbing', 'electrical', 'hvac', 'carpentry', 'welding', 'general');
create type session_status as enum ('active', 'paused', 'completed', 'cancelled');
create type analysis_type as enum ('safety_check', 'technique_review', 'tool_identification', 'code_compliance');
create type skill_level as enum ('beginner', 'intermediate', 'advanced', 'expert');
create type subscription_tier as enum ('free', 'pro', 'master');

-- ─── Profiles ────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  trade trade_type not null default 'general',
  skill_level skill_level not null default 'beginner',
  years_experience integer not null default 0,
  company text,
  license_number text,
  subscription_tier subscription_tier not null default 'free',
  subscription_expires_at timestamptz,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- ─── Trade Specialties ───────────────────────────────

create table trade_specialties (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  trade trade_type not null,
  specialty text not null,
  certified boolean not null default false,
  certification_date date,
  certification_expiry date,
  created_at timestamptz not null default now()
);

alter table trade_specialties enable row level security;

create policy "Users can manage own specialties"
  on trade_specialties for all using (auth.uid() = user_id);

create index idx_trade_specialties_user on trade_specialties(user_id);

-- ─── Coaching Sessions ───────────────────────────────

create table coaching_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  trade trade_type not null,
  status session_status not null default 'active',
  description text not null,
  location text,
  notes text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table coaching_sessions enable row level security;

create policy "Users can manage own sessions"
  on coaching_sessions for all using (auth.uid() = user_id);

create index idx_coaching_sessions_user on coaching_sessions(user_id);
create index idx_coaching_sessions_status on coaching_sessions(status);
create index idx_coaching_sessions_trade on coaching_sessions(trade);

-- ─── Session Photos ──────────────────────────────────

create table session_photos (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references coaching_sessions(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  caption text,
  analysis_id uuid,
  created_at timestamptz not null default now()
);

alter table session_photos enable row level security;

create policy "Users can manage own photos"
  on session_photos for all using (auth.uid() = user_id);

create index idx_session_photos_session on session_photos(session_id);
create index idx_session_photos_user on session_photos(user_id);

-- ─── AI Analyses ─────────────────────────────────────

create table ai_analyses (
  id uuid primary key default uuid_generate_v4(),
  photo_id uuid not null references session_photos(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  analysis_type analysis_type not null,
  result_summary text not null,
  details jsonb not null default '{}',
  safety_score numeric(3,1),
  recommendations text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table ai_analyses enable row level security;

create policy "Users can view own analyses"
  on ai_analyses for select using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on ai_analyses for insert with check (auth.uid() = user_id);

create index idx_ai_analyses_photo on ai_analyses(photo_id);
create index idx_ai_analyses_user on ai_analyses(user_id);

-- ─── Guides ──────────────────────────────────────────

create table guides (
  id uuid primary key default uuid_generate_v4(),
  trade trade_type not null,
  title text not null,
  slug text not null unique,
  difficulty skill_level not null default 'beginner',
  description text not null,
  content text not null,
  estimated_minutes integer not null default 30,
  tools_needed text[] not null default '{}',
  safety_warnings text[] not null default '{}',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table guides enable row level security;

create policy "Anyone can view published guides"
  on guides for select using (is_published = true);

create index idx_guides_trade on guides(trade);
create index idx_guides_difficulty on guides(difficulty);
create index idx_guides_slug on guides(slug);

-- ─── Skill Milestones ────────────────────────────────

create table skill_milestones (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  trade trade_type not null,
  skill text not null,
  description text,
  skill_level skill_level not null default 'beginner',
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table skill_milestones enable row level security;

create policy "Users can manage own milestones"
  on skill_milestones for all using (auth.uid() = user_id);

create index idx_skill_milestones_user on skill_milestones(user_id);
create index idx_skill_milestones_trade on skill_milestones(trade);

-- ─── Subscriptions ───────────────────────────────────

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  tier subscription_tier not null default 'free',
  status text not null default 'active',
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Users can manage own subscriptions"
  on subscriptions for all using (auth.uid() = user_id);

create index idx_subscriptions_user on subscriptions(user_id);

-- ─── Audit Log ───────────────────────────────────────

create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_log_user on audit_log(user_id);
create index idx_audit_log_action on audit_log(action);

-- ─── Handle New User ─────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, trade)
  values (
    new.id,
    coalesce((new.raw_user_meta_data ->> 'trade')::public.trade_type, 'general')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Updated At Trigger ─────────────────────────────

create or replace function update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

create trigger coaching_sessions_updated_at
  before update on coaching_sessions
  for each row execute function update_updated_at();

create trigger guides_updated_at
  before update on guides
  for each row execute function update_updated_at();

-- ─── Seed Guides ─────────────────────────────────────

insert into guides (trade, title, slug, difficulty, description, content, estimated_minutes, tools_needed, safety_warnings, is_published) values
  ('plumbing', 'How to Fix a Leaky Faucet', 'fix-leaky-faucet', 'beginner', 'Learn the basics of diagnosing and repairing common faucet leaks.', E'Step 1: Turn off the water supply valves under the sink.\nStep 2: Remove the faucet handle using a screwdriver or Allen wrench.\nStep 3: Inspect the cartridge or washer for wear.\nStep 4: Replace the damaged component.\nStep 5: Reassemble the faucet and test.', 30, ARRAY['Adjustable wrench', 'Screwdriver set', 'Replacement washers'], ARRAY['Ensure water supply is fully shut off before disassembly'], true),
  ('plumbing', 'Installing a Toilet', 'installing-toilet', 'intermediate', 'Complete guide to removing an old toilet and installing a new one.', E'Step 1: Shut off water supply and flush the old toilet.\nStep 2: Disconnect the supply line and remove mounting bolts.\nStep 3: Lift the old toilet and clean the flange.\nStep 4: Install a new wax ring on the flange.\nStep 5: Set the new toilet and secure with bolts.\nStep 6: Connect the supply line and test for leaks.', 60, ARRAY['Adjustable wrench', 'Wax ring', 'Level', 'Caulk gun'], ARRAY['Toilets are heavy — use proper lifting technique', 'Wear gloves when handling the wax ring'], true),
  ('electrical', 'Replacing a Light Switch', 'replacing-light-switch', 'beginner', 'Safely replace a standard single-pole light switch.', E'Step 1: Turn off power at the breaker panel.\nStep 2: Verify power is off using a voltage tester.\nStep 3: Remove the switch plate cover.\nStep 4: Disconnect the wires from the old switch.\nStep 5: Connect wires to the new switch.\nStep 6: Mount the switch and replace the cover plate.\nStep 7: Restore power and test.', 20, ARRAY['Voltage tester', 'Flathead screwdriver', 'Phillips screwdriver'], ARRAY['ALWAYS verify power is off before touching wires', 'Never work on live circuits'], true),
  ('electrical', 'Installing a GFCI Outlet', 'installing-gfci-outlet', 'intermediate', 'Install a Ground Fault Circuit Interrupter outlet for wet locations.', E'Step 1: Turn off power at the breaker panel.\nStep 2: Use a voltage tester to confirm power is off.\nStep 3: Remove the old outlet.\nStep 4: Identify LINE and LOAD wires.\nStep 5: Connect LINE wires to the LINE terminals on the GFCI.\nStep 6: Connect LOAD wires to LOAD terminals if protecting downstream outlets.\nStep 7: Mount the GFCI outlet and test.', 30, ARRAY['Voltage tester', 'Wire strippers', 'Screwdriver set', 'GFCI outlet'], ARRAY['ALWAYS verify power is off', 'Incorrect LINE/LOAD wiring can prevent protection'], true),
  ('hvac', 'Changing an HVAC Filter', 'changing-hvac-filter', 'beginner', 'Regular filter replacement for optimal HVAC performance.', E'Step 1: Locate the air filter slot on your HVAC unit.\nStep 2: Note the filter size printed on the existing filter frame.\nStep 3: Turn off the HVAC system.\nStep 4: Slide out the old filter.\nStep 5: Insert the new filter with airflow arrows pointing toward the unit.\nStep 6: Turn the system back on.', 10, ARRAY['Replacement filter (correct size)'], ARRAY['Turn off HVAC system before changing filter'], true),
  ('hvac', 'Troubleshooting No Cooling', 'troubleshooting-no-cooling', 'intermediate', 'Diagnose common reasons why an AC unit is not cooling.', E'Step 1: Check the thermostat settings and batteries.\nStep 2: Inspect the air filter for blockage.\nStep 3: Check the condensate drain line for clogs.\nStep 4: Inspect the outdoor condenser unit for debris.\nStep 5: Verify the circuit breaker has not tripped.\nStep 6: Check refrigerant lines for ice buildup.\nStep 7: If ice is present, turn off the system and let it thaw.', 45, ARRAY['Multimeter', 'Thermometer', 'Wet/dry vacuum'], ARRAY['Never work on refrigerant lines without EPA certification', 'Turn off power before inspecting electrical components'], true),
  ('carpentry', 'Building a Basic Shelf', 'building-basic-shelf', 'beginner', 'Build and mount a simple wall shelf with brackets.', E'Step 1: Measure and mark the desired shelf location.\nStep 2: Use a stud finder to locate wall studs.\nStep 3: Mount shelf brackets to studs using screws.\nStep 4: Check brackets are level.\nStep 5: Place the shelf board on brackets and secure.', 30, ARRAY['Tape measure', 'Level', 'Drill', 'Stud finder', 'Screws', 'Shelf brackets'], ARRAY['Wear safety glasses when drilling', 'Ensure shelf is rated for intended weight'], true),
  ('welding', 'MIG Welding Basics', 'mig-welding-basics', 'beginner', 'Introduction to MIG welding setup and basic technique.', E'Step 1: Set up the MIG welder with correct wire and gas.\nStep 2: Adjust voltage and wire feed speed for your material.\nStep 3: Clean the base metal with a wire brush.\nStep 4: Position your body and gun at a 15-20 degree angle.\nStep 5: Maintain consistent travel speed and distance.\nStep 6: Practice straight beads on scrap metal.\nStep 7: Inspect welds for consistency and penetration.', 60, ARRAY['MIG welder', 'Welding helmet', 'Welding gloves', 'Wire brush', 'Clamps'], ARRAY['Always wear proper PPE including auto-darkening helmet', 'Ensure adequate ventilation', 'Keep flammable materials away from welding area', 'Never look at the arc without eye protection'], true);
