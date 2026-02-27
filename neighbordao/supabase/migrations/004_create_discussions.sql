create table if not exists public.discussions (
  id uuid default uuid_generate_v4() primary key,
  proposal_id uuid references public.proposals on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  parent_id uuid references public.discussions on delete cascade,
  content text not null,
  upvotes integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.discussions enable row level security;

create policy "Discussions viewable by authenticated users"
  on public.discussions for select using (auth.uid() is not null);

create policy "Users can insert discussions"
  on public.discussions for insert with check (auth.uid() = user_id);

create policy "Users can update their own discussions"
  on public.discussions for update using (auth.uid() = user_id);

create policy "Users can delete their own discussions"
  on public.discussions for delete using (auth.uid() = user_id);

create index idx_discussions_proposal on public.discussions (proposal_id, created_at);
