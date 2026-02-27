-- PetOS: Photo Storage Bucket
-- Migration: 010_storage_bucket

-- Create storage bucket for pet photos
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload pet photos to their own folder
create policy "Users upload own pet photos"
  on storage.objects for insert
  with check (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view pet photos (bucket is public)
create policy "Public read pet photos"
  on storage.objects for select
  using (bucket_id = 'pet-photos');

-- Allow users to delete their own photos
create policy "Users delete own pet photos"
  on storage.objects for delete
  using (
    bucket_id = 'pet-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
