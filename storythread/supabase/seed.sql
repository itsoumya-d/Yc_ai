-- StoryThread seed data — demo account for testing/onboarding demos
-- Run after migrations: supabase db seed

-- Demo user profile (matches Supabase auth.users seed if you create one)
-- Note: user_id references must match a real auth.users row in your project.
-- Replace '00000000-0000-0000-0000-000000000001' with your demo user's UUID.

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  story1_id    uuid := gen_random_uuid();
  story2_id    uuid := gen_random_uuid();
  chapter1_id  uuid := gen_random_uuid();
  chapter2_id  uuid := gen_random_uuid();
begin

-- Profile
insert into public.profiles (id, username, full_name, bio, plan, created_at)
values (
  demo_user_id,
  'demo_author',
  'Demo Author',
  'Fantasy and sci-fi writer exploring collaborative storytelling.',
  'pro',
  now() - interval '30 days'
) on conflict (id) do nothing;

-- Stories
insert into public.stories (id, user_id, title, genre, description, status, word_count, created_at)
values
  (story1_id, demo_user_id, 'The Last Archivist', 'Science Fiction',
   'In a world where memories can be extracted and traded, the last human archivist fights to preserve authentic experience.',
   'published', 24350, now() - interval '20 days'),
  (story2_id, demo_user_id, 'Echoes of the Forgotten Sea', 'Fantasy',
   'A young cartographer discovers that the sea she mapped does not exist — except in the dreams of the dying.',
   'draft', 8200, now() - interval '5 days')
on conflict do nothing;

-- Chapters
insert into public.chapters (id, story_id, user_id, title, content, word_count, chapter_number, created_at)
values
  (chapter1_id, story1_id, demo_user_id, 'The Memory Market',
   'The rain fell in grey curtains across the market stalls. Lena pulled her hood tighter and scanned the rows of crystalline vials...',
   1420, 1, now() - interval '19 days'),
  (chapter2_id, story1_id, demo_user_id, 'Extraction',
   'The chair was cold. That was the first thing Lena noticed — the cold creeping through the thin fabric of the hospital gown...',
   1380, 2, now() - interval '18 days')
on conflict do nothing;

end $$;
