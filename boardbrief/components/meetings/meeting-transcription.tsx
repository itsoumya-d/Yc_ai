'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { transcribeMeetingAudio, generateMinutesFromTranscript } from '@/lib/actions/transcription';
import {
  Mic,
  Upload,
  FileAudio,
  Loader2,
  FileText,
  ClipboardCopy,
  CheckCheck,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MeetingTranscriptionProps {
  meetingId: string;
  meetingTitle: string;
}

export function MeetingTranscription({ meetingId, meetingTitle }: MeetingTranscriptionProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [minutes, setMinutes] = useState('');
  const [generatingMinutes, setGeneratingMinutes] = useState(false);
  const [copied, setCopied] = useState<'transcript' | 'minutes' | null>(null);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showMinutes, setShowMinutes] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;
    setTranscribing(true);

    const formData = new FormData();
    formData.append('audio', selectedFile);

    const result = await transcribeMeetingAudio(meetingId, formData);
    setTranscribing(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    if (result.data) {
      setTranscript(result.data.transcript);
      toast({ title: 'Transcription complete!' });
    }
  };

  const handleGenerateMinutes = async () => {
    if (!transcript) return;
    setGeneratingMinutes(true);

    const result = await generateMinutesFromTranscript(meetingId, transcript, meetingTitle);
    setGeneratingMinutes(false);

    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }

    if (result.data) {
      setMinutes(result.data);
      toast({ title: 'Meeting minutes generated!' });
    }
  };

  const handleCopy = async (type: 'transcript' | 'minutes') => {
    const text = type === 'transcript' ? transcript : minutes;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Mic className="w-4 h-4 text-gold-500" />
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Meeting Transcription</h3>
      </div>

      {/* Upload Area */}
      {!transcript && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="rounded-xl border-2 border-dashed border-[var(--border)] hover:border-gold-400 transition-colors cursor-pointer"
          onClick={() => !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/mp4,video/webm"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
              <div className="rounded-full bg-navy-900/10 p-3">
                <FileAudio className="w-6 h-6 text-navy-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Drop audio file or click to upload
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  MP3, MP4, WAV, WEBM, OGG, FLAC — max 25MB
                </p>
              </div>
              <Button variant="outline" size="sm" className="mt-1" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                Choose File
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-navy-900/10 p-2">
                <FileAudio className="w-5 h-5 text-navy-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{selectedFile.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-[var(--muted-foreground)] hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transcribe Button */}
      {selectedFile && !transcript && (
        <Button
          onClick={handleTranscribe}
          disabled={transcribing}
          className="w-full bg-navy-900 hover:bg-navy-800 text-white"
        >
          {transcribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Transcribing with Whisper AI...
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Transcribe Recording
            </>
          )}
        </Button>
      )}

      {/* Transcript Output */}
      {transcript && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Transcript</span>
              <span className="text-xs text-[var(--muted-foreground)]">
                ({transcript.split(' ').length.toLocaleString()} words)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy('transcript')}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                title="Copy transcript"
              >
                {copied === 'transcript' ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
              >
                {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showTranscript && (
            <div className="max-h-48 overflow-y-auto rounded-lg bg-[var(--muted)] p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {transcript}
            </div>
          )}

          {/* Generate Minutes Button */}
          {!minutes && (
            <Button
              onClick={handleGenerateMinutes}
              disabled={generatingMinutes}
              variant="outline"
              className="w-full border-gold-400 text-navy-900 hover:bg-gold-50"
            >
              {generatingMinutes ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Meeting Minutes...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Meeting Minutes
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Generated Minutes */}
      {minutes && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gold-600" />
              <span className="text-xs font-semibold text-[var(--foreground)]">Meeting Minutes</span>
              <span className="text-xs bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full">AI Generated</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleCopy('minutes')}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
                title="Copy minutes"
              >
                {copied === 'minutes' ? <CheckCheck className="w-3.5 h-3.5 text-green-500" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowMinutes(!showMinutes)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors p-1"
              >
                {showMinutes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {showMinutes && (
            <div className="max-h-64 overflow-y-auto rounded-lg border border-gold-200 bg-gold-50/50 p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
              {minutes}
            </div>
          )}

          <Button
            onClick={handleGenerateMinutes}
            disabled={generatingMinutes}
            variant="ghost"
            size="sm"
            className="text-[var(--muted-foreground)] text-xs"
          >
            {generatingMinutes ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
            Regenerate Minutes
          </Button>
        </div>
      )}

      {/* Reset */}
      {transcript && (
        <button
          onClick={() => { setTranscript(''); setMinutes(''); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
          className="text-xs text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
        >
          Upload different file
        </button>
      )}
    </Card>
  );
}
