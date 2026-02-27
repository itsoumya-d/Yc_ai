-- Add transcription and recording fields to meetings
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS transcription TEXT,
  ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Storage bucket for meeting recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-recordings',
  'meeting-recordings',
  false,
  52428800,  -- 50MB
  ARRAY['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'video/mp4', 'video/webm']
) ON CONFLICT (id) DO NOTHING;

-- RLS: only meeting owner can upload/read their recordings
CREATE POLICY "Users can upload their recordings" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'meeting-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read their recordings" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'meeting-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their recordings" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'meeting-recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
