-- BoardBrief seed data — demo founder account for testing
-- Replace demo UUID with real auth.users row

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  board1_id    uuid := gen_random_uuid();
  meeting1_id  uuid := gen_random_uuid();
  member1_id   uuid := gen_random_uuid();
begin

-- Profile
insert into public.profiles (id, full_name, email, company_name, job_title, plan, created_at)
values (
  demo_user_id, 'Alex Founder', 'alex@demovc.com', 'AcmeTech Inc', 'CEO & Co-Founder', 'pro',
  now() - interval '120 days'
) on conflict (id) do nothing;

-- Board
insert into public.boards (id, user_id, name, company_name, fiscal_year_end, created_at)
values (
  board1_id, demo_user_id, 'AcmeTech Board of Directors', 'AcmeTech Inc', 12,
  now() - interval '100 days'
) on conflict do nothing;

-- Board members
insert into public.board_members (id, board_id, name, email, role, added_at)
values
  (member1_id, board1_id, 'Sandra Kim', 'sandra@sequoiacap.com', 'Lead Investor', now() - interval '100 days'),
  (gen_random_uuid(), board1_id, 'Tom Price', 'tprice@independent.com', 'Independent Director', now() - interval '90 days')
on conflict do nothing;

-- Board meeting
insert into public.meetings (id, board_id, user_id, title, scheduled_at, status, agenda, created_at)
values (
  meeting1_id, board1_id, demo_user_id,
  'Q1 2026 Board Review',
  now() + interval '7 days',
  'scheduled',
  '1. Q1 financials & KPI review\n2. Product roadmap update\n3. Fundraising strategy\n4. Team updates & org chart\n5. AOB',
  now() - interval '3 days'
) on conflict do nothing;

-- KPI snapshot (simulated Stripe pull)
insert into public.kpi_snapshots (board_id, period, mrr, arr, churn_rate, new_customers, cac, ltv, recorded_at)
values (
  board1_id, '2026-03',
  48500.00,       -- MRR
  582000.00,      -- ARR
  2.3,            -- Churn %
  42,             -- New customers
  340.00,         -- CAC
  4200.00,        -- LTV
  now()
) on conflict do nothing;

end $$;
