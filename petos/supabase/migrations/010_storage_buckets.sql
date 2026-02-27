-- Storage buckets for PetOS
-- Note: Supabase Storage bucket creation must be done via the Supabase dashboard or CLI.
-- The policies below assume buckets named 'pet-photos' and 'symptom-photos' already exist.

-- Pet Photos Bucket Policies
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload pet photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own photos
CREATE POLICY "Users can read own pet photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read (for shared pet profiles)
CREATE POLICY "Public can read pet photos" ON storage.objects
  FOR SELECT TO anon
  USING (bucket_id = 'pet-photos');

-- Allow authenticated users to delete own pet photos
CREATE POLICY "Users can delete own pet photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'pet-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Symptom Photos Bucket Policies
CREATE POLICY "Users can upload symptom photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'symptom-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own symptom photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'symptom-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own symptom photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'symptom-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
