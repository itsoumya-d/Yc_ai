-- ProposalPilot seed data — demo agency account for testing
-- Replace demo UUID with real auth.users row

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  client1_id   uuid := gen_random_uuid();
  prop1_id     uuid := gen_random_uuid();
  prop2_id     uuid := gen_random_uuid();
begin

-- Profile
insert into public.profiles (id, full_name, email, company_name, plan, created_at)
values (
  demo_user_id, 'Taylor Brooks', 'taylor@northstaragency.com', 'North Star Agency', 'pro',
  now() - interval '45 days'
) on conflict (id) do nothing;

-- Clients
insert into public.clients (id, user_id, name, email, company, industry, created_at)
values (
  client1_id, demo_user_id, 'David Wu', 'david@nexatech.com', 'NexaTech Solutions', 'SaaS',
  now() - interval '30 days'
) on conflict do nothing;

-- Proposals
insert into public.proposals (id, user_id, client_id, title, status, total_value, valid_until, signature_status, viewed_at, created_at)
values
  (prop1_id, demo_user_id, client1_id,
   'Digital Transformation Package — Q2 2026',
   'signed', 48000.00, now() + interval '30 days', 'signed',
   now() - interval '15 days', now() - interval '20 days'),
  (prop2_id, demo_user_id, client1_id,
   'Brand Refresh & Content Strategy',
   'sent', 22500.00, now() + interval '14 days', 'pending',
   now() - interval '1 day', now() - interval '3 days')
on conflict do nothing;

-- Proposal sections
insert into public.proposal_sections (proposal_id, title, content, sort_order)
values
  (prop2_id, 'Executive Summary',
   'NexaTech is positioned for a transformative brand refresh that will align visual identity with the company''s evolved market positioning and B2B enterprise focus.',
   1),
  (prop2_id, 'Scope of Work',
   '1. Brand audit & competitive analysis\n2. Logo evolution & brand guidelines\n3. Website homepage redesign\n4. Content strategy framework (6-month calendar)',
   2),
  (prop2_id, 'Investment',
   'Brand audit: $4,500\nVisual identity system: $8,000\nWebsite homepage: $6,500\nContent strategy: $3,500\nTotal: $22,500',
   3)
on conflict do nothing;

end $$;
