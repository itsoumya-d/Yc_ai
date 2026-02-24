-- meeting_documents table
-- For storing file attachments associated with meetings
-- document_type examples: 'agenda', 'minutes', 'presentation', 'report', 'other'

create table if not exists public.meeting_documents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  meeting_id uuid references public.meetings on delete cascade,
  title text not null,
  file_name text not null,
  file_type text,
  file_size integer,
  file_path text not null,
  document_type text not null default 'other',
  created_at timestamptz default now()
);

alter table public.meeting_documents enable row level security;

create policy "Users can view their own meeting documents"
  on public.meeting_documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meeting documents"
  on public.meeting_documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meeting documents"
  on public.meeting_documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meeting documents"
  on public.meeting_documents for delete
  using (auth.uid() = user_id);

create index idx_meeting_documents_user on public.meeting_documents (user_id, created_at desc);
create index idx_meeting_documents_meeting on public.meeting_documents (meeting_id);

-- ai_generations table
-- Tracks AI-generated content (agenda, summary, resolution drafts)
-- Sourced from: types/database.ts AIGeneration interface
-- generation_type values: 'agenda' | 'summary' | 'resolution'

create table if not exists public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  prompt text not null,
  result text not null,
  generation_type text not null,
  tokens_used integer not null default 0,
  model text not null,
  created_at timestamptz default now()
);

alter table public.ai_generations enable row level security;

create policy "Users can view their own ai generations"
  on public.ai_generations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ai generations"
  on public.ai_generations for insert
  with check (auth.uid() = user_id);

create index idx_ai_generations_user on public.ai_generations (user_id, created_at desc);
