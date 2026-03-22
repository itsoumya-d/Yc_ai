-- ClaimForge seed data — demo investigator account for testing
-- Replace demo UUID with real auth.users row

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  case1_id     uuid := gen_random_uuid();
  case2_id     uuid := gen_random_uuid();
  doc1_id      uuid := gen_random_uuid();
begin

-- Profile
insert into public.profiles (id, full_name, email, organization, plan, created_at)
values (
  demo_user_id, 'Chris Investigator', 'chris@auditfirm.com', 'Meridian Audit Group', 'pro',
  now() - interval '60 days'
) on conflict (id) do nothing;

-- Cases
insert into public.cases (id, user_id, title, description, status, risk_score, claim_amount, fraud_indicators, created_at)
values
  (case1_id, demo_user_id,
   'Construction Overbilling — Atlas Federal Project #2847',
   'Subcontractor submitted invoices totaling $2.1M for work on federal construction project. Benford analysis shows significant deviation in leading digits.',
   'active', 87, 2100000.00,
   ARRAY['Benford deviation: 0.34', 'Duplicate vendor EINs', 'Round number clustering', 'USASpending mismatch'],
   now() - interval '14 days'),
  (case2_id, demo_user_id,
   'Grant Misuse — Metro Community Services 2025',
   'Non-profit organization received $450K federal grant. Expense reports show purchases inconsistent with grant scope.',
   'review', 62, 450000.00,
   ARRAY['Benford deviation: 0.18', 'Off-category expenses'],
   now() - interval '5 days')
on conflict do nothing;

-- Documents
insert into public.documents (id, case_id, user_id, filename, file_type, status, page_count, extracted_text_preview, created_at)
values (
  doc1_id, case1_id, demo_user_id,
  'atlas_subcontractor_invoices_batch1.pdf', 'application/pdf',
  'analyzed', 24,
  'INVOICE #4821... Atlas Construction Services... Date: Jan 15 2026... Labor: 840 hrs @ $85/hr = $71,400... Materials: $124,850...',
  now() - interval '13 days'
) on conflict do nothing;

-- Entity extractions
insert into public.entities (case_id, document_id, entity_type, name, value, confidence, created_at)
values
  (case1_id, doc1_id, 'organization', 'Atlas Construction Services', null, 0.98, now() - interval '13 days'),
  (case1_id, doc1_id, 'amount', 'Invoice Total', '$71,400.00', 0.99, now() - interval '13 days'),
  (case1_id, doc1_id, 'amount', 'Invoice Total', '$124,850.00', 0.97, now() - interval '13 days'),
  (case1_id, doc1_id, 'date', 'Invoice Date', '2026-01-15', 0.99, now() - interval '13 days')
on conflict do nothing;

end $$;
