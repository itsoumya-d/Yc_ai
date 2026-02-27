'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Mic, Upload, Loader2, Copy, Check, FileAudio } from 'lucide-react';

interface TranscriptionPanelProps {
  meetingId: string;
  initialTranscription?: string | null;
}

export function TranscriptionPanel({ meetingId, initialTranscription }: TranscriptionPanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transcription, setTranscription] = useState(initialTranscription ?? '');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      toast({ title: 'File too large. Maximum size is 50MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/transcribe`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json() as { transcription?: string; error?: string };

      if (!res.ok) {
        toast({ title: data.error ?? 'Transcription failed', variant: 'destructive' });
        return;
      }

      setTranscription(data.transcription ?? '');
      toast({ title: 'Audio transcribed successfully' });
    } catch {
      toast({ title: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleCopy() {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-[var(--muted-foreground)]" />
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Transcription</h3>
        </div>
        <div className="flex gap-2">
          {transcription && (
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/mp4,video/webm"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Transcribing...</>
            ) : (
              <><Upload className="w-4 h-4 mr-1" />{transcription ? 'Re-upload' : 'Upload Audio'}</>
            )}
          </Button>
        </div>
      </div>

      {transcription ? (
        <div className="rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] p-3 max-h-64 overflow-y-auto">
          <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">{transcription}</p>
        </div>
      ) : (
        <div
          className="rounded-lg border-2 border-dashed border-[var(--border)] p-6 text-center cursor-pointer hover:border-[var(--muted-foreground)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <FileAudio className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">Upload an audio or video recording</p>
          <p className="text-xs text-[var(--muted-foreground)]/70 mt-1">MP3, MP4, WAV, WebM — max 50MB</p>
        </div>
      )}
    </Card>
  );
}
