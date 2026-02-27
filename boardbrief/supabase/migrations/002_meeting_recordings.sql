-- Meeting recordings storage bucket for transcription feature
-- Run this in your Supabase SQL editor or dashboard

-- Create storage bucket for meeting recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meeting-recordings',
  'meeting-recordings',
  false,
  26214400,  -- 25MB limit
  ARRAY[
    'audio/mpeg',
    'audio/mp4',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/flac',
    'video/mp4',
    'video/webm',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for meeting recordings bucket
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'meeting-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'meeting-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own recordings"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'meeting-recordings' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Add transcript column to meetings table (optional - we store in notes currently)
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcript_url TEXT;
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS minutes TEXT;
