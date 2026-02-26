'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, PenLine, RotateCcw, Loader2 } from 'lucide-react';

interface ProposalActionsProps {
  proposalId: string;
  proposalTitle: string;
  status: string;
}

type Step = 'idle' | 'sign' | 'declined' | 'accepted' | 'loading';

export function ProposalActions({ proposalId, proposalTitle, status }: ProposalActionsProps) {
  const [step, setStep] = useState<Step>('idle');
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const isAlreadyActioned = status === 'won' || status === 'lost';

  useEffect(() => {
    if (step !== 'sign' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [step]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPoint.current = getPos(e, canvas);
  }, []);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    lastPoint.current = current;
    setHasSignature(true);
  }, [isDrawing]);

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleAccept = async () => {
    if (!signerName.trim()) { setError('Please enter your name'); return; }
    if (!signerEmail.trim()) { setError('Please enter your email'); return; }
    if (!hasSignature) { setError('Please sign above to accept'); return; }

    setError('');
    setStep('loading');

    const signatureDataUrl = canvasRef.current?.toDataURL('image/png') ?? '';

    const res = await fetch(`/api/proposals/${proposalId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'accept',
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        signatureDataUrl,
        proposalTitle,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong. Please try again.');
      setStep('sign');
      return;
    }

    setStep('accepted');
  };

  const handleDecline = async () => {
    setStep('loading');
    await fetch(`/api/proposals/${proposalId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'decline', proposalTitle }),
    });
    setStep('declined');
  };

  if (isAlreadyActioned) {
    return (
      <div className={`rounded-xl border-2 p-6 text-center ${
        status === 'won'
          ? 'border-green-200 bg-green-50'
          : 'border-gray-200 bg-gray-50'
      }`}>
        {status === 'won' ? (
          <>
            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
            <p className="font-semibold text-green-800">Proposal Accepted</p>
            <p className="text-sm text-green-600 mt-1">This proposal has been signed and accepted.</p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto mb-2 h-8 w-8 text-gray-500" />
            <p className="font-semibold text-gray-700">Proposal Declined</p>
          </>
        )}
      </div>
    );
  }

  if (step === 'accepted') {
    return (
      <div className="rounded-xl border-2 border-green-200 bg-green-50 p-8 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-green-900">Proposal Accepted!</h3>
        <p className="mt-2 text-sm text-green-700">
          Thank you for accepting. A confirmation has been sent to {signerEmail}.
        </p>
      </div>
    );
  }

  if (step === 'declined') {
    return (
      <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-700">Proposal Declined</h3>
        <p className="mt-1 text-sm text-gray-500">Thank you for letting us know.</p>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-10">
        <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
      </div>
    );
  }

  if (step === 'sign') {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
          <PenLine className="h-5 w-5 text-brand-600" />
          Sign to Accept Proposal
        </h3>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Your Name *</label>
            <input
              type="text"
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Your Email *</label>
            <input
              type="email"
              value={signerEmail}
              onChange={(e) => setSignerEmail(e.target.value)}
              placeholder="email@company.com"
              className="w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>
        </div>

        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">
            Draw your signature *
          </label>
          {hasSignature && (
            <button
              onClick={clearSignature}
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        <div className="relative mb-4 overflow-hidden rounded-lg border-2 border-dashed border-[var(--border)] bg-white transition-colors hover:border-brand-400">
          {!hasSignature && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-[var(--muted-foreground)]">Sign here</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            width={600}
            height={150}
            className="w-full cursor-crosshair touch-none"
            style={{ display: 'block' }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleAccept}
            className="flex-1 bg-brand-600 text-white hover:bg-brand-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Accept & Sign Proposal
          </Button>
          <Button variant="outline" onClick={() => setStep('idle')} className="shrink-0">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // Default idle state: show Accept / Decline CTAs
  return (
    <div className="rounded-xl border-2 border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6">
      <h3 className="mb-1 text-base font-semibold text-[var(--foreground)]">Ready to move forward?</h3>
      <p className="mb-5 text-sm text-[var(--muted-foreground)]">
        Review the proposal above, then accept or decline below.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => setStep('sign')}
          className="flex-1 bg-brand-600 py-3 text-base font-semibold text-white hover:bg-brand-700"
        >
          <PenLine className="mr-2 h-5 w-5" />
          Accept &amp; Sign
        </Button>
        <Button
          variant="outline"
          onClick={handleDecline}
          className="shrink-0 border-gray-300 text-gray-600 hover:bg-gray-50"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Decline
        </Button>
      </div>
    </div>
  );
}
