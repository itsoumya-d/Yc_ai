-- InvoiceAI seed data — demo freelancer account for testing
-- Replace demo UUID with real auth.users row

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  client1_id   uuid := gen_random_uuid();
  client2_id   uuid := gen_random_uuid();
  inv1_id      uuid := gen_random_uuid();
  inv2_id      uuid := gen_random_uuid();
  inv3_id      uuid := gen_random_uuid();
begin

-- Profile
insert into public.profiles (id, full_name, email, company_name, plan, created_at)
values (
  demo_user_id, 'Jordan Kim', 'jordan@example.com', 'JK Design Studio', 'pro',
  now() - interval '90 days'
) on conflict (id) do nothing;

-- Clients
insert into public.clients (id, user_id, name, email, company, address, created_at)
values
  (client1_id, demo_user_id, 'Marcus Thompson', 'marcus@acmecorp.com', 'Acme Corp',
   '100 Business Ave, New York, NY 10001', now() - interval '60 days'),
  (client2_id, demo_user_id, 'Priya Sharma', 'priya@techstart.io', 'TechStart Inc',
   '200 Innovation Dr, San Francisco, CA 94107', now() - interval '45 days')
on conflict do nothing;

-- Invoices
insert into public.invoices (id, user_id, client_id, invoice_number, status, subtotal, tax_rate, total, due_date, paid_at, created_at)
values
  (inv1_id, demo_user_id, client1_id, 'INV-001', 'paid',    4500.00, 0.00, 4500.00,
   now() - interval '45 days', now() - interval '42 days', now() - interval '60 days'),
  (inv2_id, demo_user_id, client2_id, 'INV-002', 'sent',    2800.00, 0.00, 2800.00,
   now() + interval '15 days', null,                        now() - interval '5 days'),
  (inv3_id, demo_user_id, client1_id, 'INV-003', 'overdue', 1200.00, 0.00, 1200.00,
   now() - interval '10 days', null,                        now() - interval '40 days')
on conflict do nothing;

-- Line items
insert into public.invoice_line_items (invoice_id, description, quantity, unit_price, total)
values
  (inv1_id, 'Brand identity design',   1, 3000.00, 3000.00),
  (inv1_id, 'Logo variations package', 1, 1500.00, 1500.00),
  (inv2_id, 'Website redesign — UX',   1, 2000.00, 2000.00),
  (inv2_id, 'Responsive CSS implementation', 8, 100.00, 800.00),
  (inv3_id, 'Social media graphics (10 assets)', 1, 1200.00, 1200.00)
on conflict do nothing;

end $$;
