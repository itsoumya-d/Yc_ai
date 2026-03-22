'use client';
import { useState, useCallback, useRef } from 'react';

export function useAiStream(opts: { onComplete?: (t: string) => void; onError?: (e: string) => void } = {}) {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (prompt: string, context?: string) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setStreaming(true); setText(''); setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');
      const dec = new TextDecoder();
      let acc = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setText(acc);
      }
      opts.onComplete?.(acc);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = e instanceof Error ? e.message : 'Failed';
      setError(msg); opts.onError?.(msg);
    } finally { setStreaming(false); }
  }, []);

  const cancel = useCallback(() => { abortRef.current?.abort(); setStreaming(false); }, []);
  const reset = useCallback(() => { setText(''); setError(null); }, []);
  return { generate, streaming, text, error, cancel, reset };
}
