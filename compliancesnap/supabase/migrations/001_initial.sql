-- ============================================================
-- ComplianceSnap: Initial Database Schema
-- OSHA Safety Compliance Inspection Platform
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS
-- ============================================================
create table organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  industry    text,
  settings    jsonb default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table organizations is 'B2B tenants — each org is a company using ComplianceSnap';

-- ============================================================
-- ORG MEMBERS  (links auth.users → organizations with a role)
-- ============================================================
create table org_members (
  id          uuid primary key default uuid_generate_v4(),
  org_id      uuid not null references organizations (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'inspector'
                check (role in ('owner', 'admin', 'ehs_manager', 'inspector', 'viewer')),
  joined_at   timestamptz not null default now(),
  unique (org_id, user_id)
);

create index idx_org_members_org  on org_members (org_id);
create index idx_org_members_user on org_members (user_id);

-- ============================================================
-- FACILITIES
-- ============================================================
create table facilities (
  id               uuid primary key default uuid_generate_v4(),
  org_id           uuid not null references organizations (id) on delete cascade,
  name             text not null,
  address          text,
  facility_type    text not null
                     check (facility_type in (
                       'Manufacturing Plant', 'Construction Site', 'Warehouse',
                       'Distribution Center', 'Chemical Plant', 'Food Processing',
                       'Healthcare Facility', 'Office Building'
                     )),
  compliance_score integer not null default 100
                     check (compliance_score between 0 and 100),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_facilities_org on facilities (org_id);

-- ============================================================
-- INSPECTIONS
-- ============================================================
create table inspections (
  id             uuid primary key default uuid_generate_v4(),
  org_id         uuid not null references organizations (id) on delete cascade,
  facility_id    uuid not null references facilities (id) on delete cascade,
  inspector_id   uuid not null references auth.users (id),
  status         text not null default 'in_progress'
                   check (status in ('in_progress', 'review', 'submitted')),
  overall_score  integer check (overall_score between 0 and 100),
  created_at     timestamptz not null default now(),
  submitted_at   timestamptz,
  updated_at     timestamptz not null default now()
);

create index idx_inspections_org         on inspections (org_id);
create index idx_inspections_facility    on inspections (facility_id);
create index idx_inspections_inspector   on inspections (inspector_id);
create index idx_inspections_created_at  on inspections (created_at desc);
create index idx_inspections_status      on inspections (status);

-- ============================================================
-- INSPECTION AREAS
-- ============================================================
create table inspection_areas (
  id               uuid primary key default uuid_generate_v4(),
  inspection_id    uuid not null references inspections (id) on delete cascade,
  area_name        text not null,
  photo_url        text,
  analysis         jsonb default '{}'::jsonb,
  compliance_score integer check (compliance_score between 0 and 100),
  created_at       timestamptz not null default now()
);

create index idx_inspection_areas_inspection on inspection_areas (inspection_id);
create index idx_inspection_areas_created_at on inspection_areas (created_at desc);

-- ============================================================
-- VIOLATIONS
-- ============================================================
create table violations (
  id                uuid primary key default uuid_generate_v4(),
  inspection_id     uuid not null references inspections (id) on delete cascade,
  area_id           uuid references inspection_areas (id) on delete set null,
  org_id            uuid not null references organizations (id) on delete cascade,
  violation_type    text not null,
  severity          text not null
                      check (severity in ('low', 'medium', 'high', 'critical')),
  osha_standard     text,         -- e.g. "29 CFR 1910.132"
  description       text,
  immediate_action  text,
  corrective_action text,
  worker_risk       text not null default 'minimal'
                      check (worker_risk in ('minimal', 'moderate', 'serious', 'imminent_danger')),
  estimated_fine    text,         -- human-readable, e.g. "$15,625 per violation"
  area_affected     text,
  status            text not null default 'open'
                      check (status in ('open', 'in_progress', 'resolved')),
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz
);

create index idx_violations_org              on violations (org_id);
create index idx_violations_inspection       on violations (inspection_id);
create index idx_violations_severity_status  on violations (severity, status);
create index idx_violations_created_at       on violations (created_at desc);
create index idx_violations_status           on violations (status);

-- ============================================================
-- CORRECTIVE ACTIONS
-- ============================================================
create table corrective_actions (
  id           uuid primary key default uuid_generate_v4(),
  violation_id uuid not null references violations (id) on delete cascade,
  assigned_to  uuid references auth.users (id) on delete set null,
  due_date     date,
  status       text not null default 'open'
                 check (status in ('open', 'in_progress', 'resolved')),
  notes        text,
  created_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index idx_corrective_actions_violation   on corrective_actions (violation_id);
create index idx_corrective_actions_assigned_to on corrective_actions (assigned_to);
create index idx_corrective_actions_status      on corrective_actions (status);
create index idx_corrective_actions_due_date    on corrective_actions (due_date);

-- ============================================================
-- REPORTS
-- ============================================================
create table reports (
  id            uuid primary key default uuid_generate_v4(),
  inspection_id uuid not null references inspections (id) on delete cascade,
  org_id        uuid not null references organizations (id) on delete cascade,
  report_text   text,
  pdf_url       text,
  created_at    timestamptz not null default now()
);

create index idx_reports_inspection  on reports (inspection_id);
create index idx_reports_org         on reports (org_id);
create index idx_reports_created_at  on reports (created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGER HELPER
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function set_updated_at();

create trigger trg_facilities_updated_at
  before update on facilities
  for each row execute function set_updated_at();

create trigger trg_inspections_updated_at
  before update on inspections
  for each row execute function set_updated_at();

-- ============================================================
-- TRIGGER: Update facility compliance_score when inspection submitted
-- ============================================================
create or replace function update_facility_score_on_inspection_submit()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'submitted'
    and new.overall_score is not null
    and (old.status is distinct from 'submitted')
  then
    update facilities
    set
      compliance_score = new.overall_score,
      updated_at       = now()
    where id = new.facility_id;

    -- also stamp the submitted_at
    new.submitted_at := coalesce(new.submitted_at, now());
  end if;
  return new;
end;
$$;

create trigger trg_inspection_submitted
  before update on inspections
  for each row
  when (new.status = 'submitted')
  execute function update_facility_score_on_inspection_submit();

-- ============================================================
-- TRIGGER: Notify org_members with 'ehs_manager'/'admin'/'owner'
--          when a critical violation is inserted
-- ============================================================
create or replace function notify_critical_violation()
returns trigger language plpgsql security definer as $$
declare
  v_org_id uuid;
begin
  if new.severity = 'critical' then
    -- Resolve org_id from the parent inspection
    select org_id into v_org_id
    from inspections
    where id = new.inspection_id;

    -- Insert a row into a notifications table (create below) for each mgr
    insert into violation_notifications (org_id, violation_id, created_at)
    values (v_org_id, new.id, now());
  end if;
  return new;
end;
$$;

-- Lightweight notifications log for critical violations
create table violation_notifications (
  id           uuid primary key default uuid_generate_v4(),
  org_id       uuid not null references organizations (id) on delete cascade,
  violation_id uuid not null references violations (id) on delete cascade,
  read         boolean not null default false,
  created_at   timestamptz not null default now()
);

create index idx_violation_notifs_org        on violation_notifications (org_id);
create index idx_violation_notifs_created_at on violation_notifications (created_at desc);

create trigger trg_critical_violation_notify
  after insert on violations
  for each row
  execute function notify_critical_violation();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
alter table organizations          enable row level security;
alter table org_members            enable row level security;
alter table facilities             enable row level security;
alter table inspections            enable row level security;
alter table inspection_areas       enable row level security;
alter table violations             enable row level security;
alter table corrective_actions     enable row level security;
alter table reports                enable row level security;
alter table violation_notifications enable row level security;

-- Helper: is the current user a member of this org?
create or replace function current_user_org_ids()
returns setof uuid language sql security definer stable as $$
  select org_id from org_members where user_id = auth.uid();
$$;

-- ORGANIZATIONS: members can read their own org
create policy "org_read" on organizations
  for select using (id in (select current_user_org_ids()));

create policy "org_insert" on organizations
  for insert with check (true); -- Allow creating org during signup

-- ORG_MEMBERS: users see their own memberships
create policy "org_members_read" on org_members
  for select using (user_id = auth.uid() or org_id in (select current_user_org_ids()));

create policy "org_members_insert_owner" on org_members
  for insert with check (org_id in (select current_user_org_ids()));

-- FACILITIES: scoped to org membership
create policy "facilities_read" on facilities
  for select using (org_id in (select current_user_org_ids()));

create policy "facilities_write" on facilities
  for all using (org_id in (select current_user_org_ids()));

-- INSPECTIONS: scoped to org membership
create policy "inspections_read" on inspections
  for select using (org_id in (select current_user_org_ids()));

create policy "inspections_write" on inspections
  for all using (org_id in (select current_user_org_ids()));

-- INSPECTION_AREAS: via parent inspection's org
create policy "inspection_areas_read" on inspection_areas
  for select using (
    inspection_id in (
      select id from inspections
      where org_id in (select current_user_org_ids())
    )
  );

create policy "inspection_areas_write" on inspection_areas
  for all using (
    inspection_id in (
      select id from inspections
      where org_id in (select current_user_org_ids())
    )
  );

-- VIOLATIONS: scoped to org_id column (denormalized for performance)
create policy "violations_read" on violations
  for select using (org_id in (select current_user_org_ids()));

create policy "violations_write" on violations
  for all using (org_id in (select current_user_org_ids()));

-- CORRECTIVE ACTIONS: via parent violation's org
create policy "corrective_actions_read" on corrective_actions
  for select using (
    violation_id in (
      select id from violations
      where org_id in (select current_user_org_ids())
    )
  );

create policy "corrective_actions_write" on corrective_actions
  for all using (
    violation_id in (
      select id from violations
      where org_id in (select current_user_org_ids())
    )
  );

-- REPORTS: scoped to org_id column
create policy "reports_read" on reports
  for select using (org_id in (select current_user_org_ids()));

create policy "reports_write" on reports
  for all using (org_id in (select current_user_org_ids()));

-- VIOLATION NOTIFICATIONS
create policy "violation_notifs_read" on violation_notifications
  for select using (org_id in (select current_user_org_ids()));

create policy "violation_notifs_update" on violation_notifications
  for update using (org_id in (select current_user_org_ids()));
