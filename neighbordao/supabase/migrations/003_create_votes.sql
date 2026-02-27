create type vote_choice as enum ('for', 'against', 'abstain');

create table if not exists public.votes (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid not null references public.proposals on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  choice vote_choice not null,
  voting_power integer default 1,
  reason text,
  created_at timestamptz default now(),
  unique(proposal_id, user_id)
);

alter table public.votes enable row level security;

create policy "Votes viewable by authenticated users"
  on public.votes for select using (auth.uid() is not null);

create policy "Users can insert their own votes"
  on public.votes for insert with check (auth.uid() = user_id);

create index idx_votes_proposal on public.votes (proposal_id);
create index idx_votes_user on public.votes (user_id);
