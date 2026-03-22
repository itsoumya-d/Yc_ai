'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TranscriptionResult {
  transcript: string;
  segments?: Array<{ text: string; start: number; end: number }>;
  structured: {
    summary: string;
    decisions: string[];
    actionItems: Array<{ task: string; owner: string; deadline?: string }>;
    topics: string[];
  };
  duration?: number;
}

interface MeetingTranscriptionProps {
  meetingId?: string;
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'complete' | 'error';

export function MeetingTranscription({
  meetingId,
  onTranscriptionComplete,
}: MeetingTranscriptionProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'actions'>('summary');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const processAudio = useCallback(
    async (blob: Blob, filename: string) => {
      setState('processing');
      setError(null);
      try {
        const formData = new FormData();
        formData.append('audio', blob, filename);
        if (meetingId) formData.append('meetingId', meetingId);

        const res = await fetch('/api/ai/transcribe', { method: 'POST', body: formData });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? 'Transcription failed');
        }

        const data: TranscriptionResult = await res.json();
        setResult(data);
        setState('complete');
        onTranscriptionComplete?.(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Transcription failed. Please try again.';
        setError(message);
        setState('error');
      }
    },
    [meetingId, onTranscriptionComplete]
  );

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob, 'recording.webm');
      };

      mediaRecorder.start(1000);
      setState('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      setError(
        'Microphone access denied. Please allow microphone access or upload a recording.'
      );
      setState('error');
    }
  }, [processAudio]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setState('processing');
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAudio(file, file.name);
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const downloadTranscript = () => {
    if (!result) return;
    const content = [
      '# Meeting Transcript\n',
      `## Summary\n${result.structured.summary}\n`,
      `## Key Decisions\n${result.structured.decisions.map((d) => `- ${d}`).join('\n')}\n`,
      `## Action Items\n${result.structured.actionItems
        .map(
          (a) =>
            `- [ ] ${a.task} (${a.owner}${a.deadline ? ` — ${a.deadline}` : ''})`
        )
        .join('\n')}\n`,
      `## Full Transcript\n${result.transcript}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meeting-transcript.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetState = () => {
    setState('idle');
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[var(--foreground)] font-semibold flex items-center gap-2">
            <Mic className="w-4 h-4 text-amber-500" />
            Meeting Transcription
          </h3>
          {state === 'complete' && (
            <button
              onClick={downloadTranscript}
              className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors"
              aria-label="Download transcript as markdown"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {state === 'idle' || state === 'error' ? (
            <>
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-all active:scale-[0.97]"
                aria-label="Start recording meeting audio"
              >
                <Mic className="w-4 h-4" />
                Record Meeting
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] rounded-lg text-sm transition-all border border-[var(--border)] active:scale-[0.97]"
                aria-label="Upload audio file for transcription"
              >
                <Upload className="w-4 h-4" />
                Upload Audio
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
                aria-label="Audio file input"
              />
            </>
          ) : state === 'recording' ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-3 h-3 bg-red-500 rounded-full"
                aria-hidden="true"
              />
              <span className="text-red-400 text-sm font-mono" aria-live="polite">
                {formatTime(recordingTime)}
              </span>
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] rounded-lg text-sm transition-all border border-[var(--border)] active:scale-[0.97]"
                aria-label="Stop recording and start transcription"
              >
                <MicOff className="w-4 h-4" />
                Stop &amp; Transcribe
              </button>
            </>
          ) : state === 'processing' ? (
            <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-sm" aria-live="polite">
              <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
              Transcribing with Whisper AI...
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-emerald-500 text-sm" aria-live="polite">
                <CheckCircle className="w-4 h-4" />
                Transcription complete
                {result?.duration && (
                  <span className="text-[var(--muted-foreground)]">
                    ({Math.round(result.duration / 60)} min audio)
                  </span>
                )}
              </div>
              <button
                onClick={resetState}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline transition-colors"
              >
                New transcription
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 text-red-400 text-sm" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]" role="tablist">
              {(['summary', 'actions', 'transcript'] as const).map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-amber-500 border-b-2 border-amber-500'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {tab === 'actions'
                    ? 'Action Items'
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-5" role="tabpanel">
              {activeTab === 'summary' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                      Executive Summary
                    </h4>
                    <p className="text-[var(--foreground)] text-sm leading-relaxed">
                      {result.structured.summary}
                    </p>
                  </div>
                  {result.structured.decisions.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                        Key Decisions
                      </h4>
                      <ul className="space-y-1.5">
                        {result.structured.decisions.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                            <span className="text-amber-500 mt-0.5" aria-hidden="true">•</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.structured.topics.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                        Topics Discussed
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {result.structured.topics.map((t, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-[var(--muted)] text-[var(--foreground)] rounded-full text-xs border border-[var(--border)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-3">
                  {result.structured.actionItems.length === 0 ? (
                    <p className="text-[var(--muted-foreground)] text-sm">
                      No action items extracted.
                    </p>
                  ) : (
                    result.structured.actionItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-[var(--muted)] rounded-lg border border-[var(--border)]"
                      >
                        <div
                          className="w-5 h-5 mt-0.5 rounded border-2 border-[var(--border)] shrink-0"
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--foreground)]">{item.task}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-amber-500 font-medium">
                              {item.owner}
                            </span>
                            {item.deadline && (
                              <span className="text-xs text-[var(--muted-foreground)]">
                                · {item.deadline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'transcript' && (
                <div className="max-h-72 overflow-y-auto">
                  {result.segments && result.segments.length > 0 ? (
                    <div className="space-y-2">
                      {result.segments.map((seg, i) => (
                        <div key={i} className="flex gap-3">
                          <span className="text-xs text-[var(--muted-foreground)] font-mono shrink-0 mt-0.5 w-12">
                            {Math.floor(seg.start / 60)
                              .toString()
                              .padStart(2, '0')}
                            :
                            {Math.floor(seg.start % 60)
                              .toString()
                              .padStart(2, '0')}
                          </span>
                          <p className="text-sm text-[var(--foreground)] leading-relaxed">
                            {seg.text.trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                      {result.transcript}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
