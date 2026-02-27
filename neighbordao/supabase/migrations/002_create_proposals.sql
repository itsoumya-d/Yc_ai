create type proposal_status as enum ('draft', 'active', 'passed', 'rejected', 'executed');
create type proposal_category as enum ('governance', 'funding', 'membership', 'technical', 'other');

create table if not exists public.proposals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  description text not null,
  category proposal_category default 'other',
  status proposal_status default 'draft',
  votes_for integer default 0,
  votes_against integer default 0,
  votes_abstain integer default 0,
  quorum_required integer default 10,
  voting_deadline timestamptz,
  execution_data jsonb,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.proposals enable row level security;

create policy "Proposals viewable by all authenticated users"
  on public.proposals for select using (auth.uid() is not null);

create policy "Users can insert their own proposals"
  on public.proposals for insert with check (auth.uid() = user_id);

create policy "Users can update their own proposals"
  on public.proposals for update using (auth.uid() = user_id);

create policy "Users can delete their own proposals"
  on public.proposals for delete using (auth.uid() = user_id);

create index idx_proposals_user_id on public.proposals (user_id, created_at desc);
create index idx_proposals_status on public.proposals (status);
