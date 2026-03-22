'use client';

import { useState, useCallback, useRef } from 'react';

interface UseAiStreamOptions {
  onComplete?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useAiStream({ onComplete, onError }: UseAiStreamOptions = {}) {
  const [streaming, setStreaming] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (prompt: string, context?: string) => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setStreaming(true);
      setText('');
      setError(null);

      try {
        const response = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, context }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: 'Generation failed' }));
          throw new Error(data.error ?? 'Generation failed');
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setText(accumulated);
        }

        onComplete?.(accumulated);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Generation failed';
        setError(msg);
        onError?.(msg);
      } finally {
        setStreaming(false);
      }
    },
    [onComplete, onError]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setText('');
    setError(null);
  }, []);

  return { generate, streaming, text, error, cancel, reset };
}
