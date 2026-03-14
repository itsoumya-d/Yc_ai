'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import SignaturePad from 'signature_pad';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { PenLine, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';

interface SignaturePadComponentProps {
  proposalId: string;
  proposalTitle: string;
}

export function SignaturePadComponent({ proposalId, proposalTitle }: SignaturePadComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePad | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isEmpty, setIsEmpty] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const { toast } = useToast();

  // Initialize SignaturePad
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);
      if (padRef.current) padRef.current.clear();
    };

    padRef.current = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)',
      penColor: '#1e3a5f',
      minWidth: 1.5,
      maxWidth: 3,
    });

    padRef.current.addEventListener('endStroke', () => {
      setIsEmpty(padRef.current?.isEmpty() ?? true);
    });

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      padRef.current?.off();
    };
  }, []);

  const handleClear = useCallback(() => {
    padRef.current?.clear();
    setIsEmpty(true);
  }, []);

  async function handleSubmit() {
    if (!signerName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    if (!signerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signerEmail)) {
      toast({ title: 'Please enter a valid email', variant: 'destructive' });
      return;
    }
    if (padRef.current?.isEmpty()) {
      toast({ title: 'Please draw your signature', variant: 'destructive' });
      return;
    }

    const signatureDataUrl = padRef.current!.toDataURL('image/png');

    setSubmitting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName, signerEmail, signatureDataUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.error ?? 'Failed to submit signature', variant: 'destructive' });
        return;
      }

      setSigned(true);
      toast({ title: 'Proposal signed successfully!', variant: 'success' });
    } catch {
      toast({ title: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  }

  if (signed) {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-green-700 mb-1">Proposal Signed!</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          Thank you, {signerName}. Your signature has been recorded and the proposer has been notified.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <PenLine className="w-5 h-5 text-blue-600" />
        <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">Sign This Proposal</h3>
      </div>

      <p className="text-sm text-[var(--muted-foreground)] mb-5">
        By signing, you agree to the terms outlined in <em>{proposalTitle}</em>.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Full Name *</label>
            <Input
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Your full name"
              disabled={submitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email *</label>
            <Input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[var(--foreground)]">Signature *</label>
            <button
              type="button"
              onClick={handleClear}
              disabled={isEmpty || submitting}
              className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1 disabled:opacity-40 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Clear
            </button>
          </div>
          <div className="relative rounded-lg border-2 border-dashed border-[var(--border)] bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full touch-none"
              style={{ height: 140 }}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-sm text-[var(--muted-foreground)]/60 select-none">Draw your signature here</p>
              </div>
            )}
          </div>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Draw your signature using mouse or touch
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || isEmpty}
          className="w-full"
        >
          {submitting
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>
            : <><PenLine className="w-4 h-4 mr-2" />Sign & Accept Proposal</>}
        </Button>
      </div>
    </Card>
  );
}
