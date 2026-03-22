-- ClaimForge: Case Documents table for bulk evidence import
-- Tracks evidence items associated with FCA investigation cases

create table if not exists public.case_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  document_name text not null,
  document_type text not null default 'other',
  source text,                          -- origin of the document
  document_date timestamptz,            -- date of the document itself
  relevance_score integer not null default 50 check (relevance_score between 0 and 100),
  notes text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'admitted', 'rejected')),
  import_source text not null default 'manual' check (import_source in ('manual', 'csv', 'ocr', 'upload')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.case_documents enable row level security;

-- Users can manage their own uploaded documents
create policy "Own uploaded documents" on public.case_documents
  for all using (auth.uid() = uploaded_by);

-- Org members can view documents for their cases
create policy "Org members can view case documents" on public.case_documents
  for select using (
    case_id in (
      select id from public.cases where organization_id in (
        select organization_id from public.users where id = auth.uid()
      )
    )
  );

create index case_documents_case_id_idx on public.case_documents(case_id);
create index case_documents_uploaded_by_idx on public.case_documents(uploaded_by);
create index case_documents_status_idx on public.case_documents(status);
