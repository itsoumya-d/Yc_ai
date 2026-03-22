-- E-signature columns on proposals table
alter table public.proposals
  add column if not exists signature_request_id text,
  add column if not exists signature_status text default 'draft' check (signature_status in ('draft', 'sent', 'viewed', 'signed', 'declined')),
  add column if not exists signature_sent_at timestamptz,
  add column if not exists signature_signed_at timestamptz;

-- Index for webhook lookups
create index if not exists proposals_signature_request_id_idx on public.proposals (signature_request_id);
