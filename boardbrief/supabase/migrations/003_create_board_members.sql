-- board_members table
-- Columns sourced from: lib/actions/board-members.ts insert/update calls and types/database.ts BoardMember interface
-- member_type values: 'director' | 'observer' | 'advisor'

create table if not exists public.board_members (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  full_name text not null,
  email text not null,
  member_type text not null default 'director',
  title text,
  company text,
  phone text,
  can_vote boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.board_members enable row level security;

create policy "Users can view their own board members"
  on public.board_members for select
  using (auth.uid() = user_id);

create policy "Users can insert their own board members"
  on public.board_members for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own board members"
  on public.board_members for update
  using (auth.uid() = user_id);

create policy "Users can delete their own board members"
  on public.board_members for delete
  using (auth.uid() = user_id);

create index idx_board_members_user on public.board_members (user_id, created_at desc);
create index idx_board_members_active on public.board_members (user_id, is_active);
