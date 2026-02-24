-- action_items table
-- Columns sourced from: lib/actions/action-items.ts insert/update calls and types/database.ts ActionItem interface
-- status values: 'open' | 'in_progress' | 'completed' | 'deferred'
-- priority values: 'high' | 'medium' | 'low'

create table if not exists public.action_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  meeting_id uuid references public.meetings on delete set null,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  assignee_name text,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.action_items enable row level security;

create policy "Users can view their own action items"
  on public.action_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own action items"
  on public.action_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own action items"
  on public.action_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own action items"
  on public.action_items for delete
  using (auth.uid() = user_id);

create index idx_action_items_user on public.action_items (user_id, created_at desc);
create index idx_action_items_meeting on public.action_items (meeting_id);
create index idx_action_items_status on public.action_items (user_id, status);
create index idx_action_items_due_date on public.action_items (user_id, due_date asc nulls last);
