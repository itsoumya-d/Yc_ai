'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { deleteProposal, updateProposalStatus } from '@/lib/actions/proposals';
import { generateShareToken, revokeShareToken } from '@/lib/actions/sharing';
import { ProposalSectionList } from './proposal-section-list';
import { formatCurrency, formatDate, getStatusLabel, getPricingLabel } from '@/lib/utils';
import {
  Edit, Trash2, Plus, Building2, Calendar, DollarSign, Send, Download, Share2,
  Copy, Check, LinkIcon, X, FileSignature, CheckCircle2,
} from 'lucide-react';
import type { ProposalWithDetails, ProposalStatus, PricingModel } from '@/types/database';
import { ProposalAnalytics } from '@/components/ProposalAnalytics';
import { ProposalPresence } from '@/components/ProposalPresence';

interface ViewEvent {
  viewed_at: string;
  viewer_name?: string;
  time_spent_seconds?: number;
}

interface ProposalDetailProps {
  proposal: ProposalWithDetails;
  analytics?: {
    viewEvents: ViewEvent[];
    totalViews: number;
    lastViewedAt?: string;
    avgTimeSeconds: number;
  };
}

// ─── Status Timeline ────────────────────────────────────────────────────────

const STATUS_STEPS: { key: ProposalStatus; label: string; icon: string }[] = [
  { key: 'draft', label: 'Created', icon: '📝' },
  { key: 'sent', label: 'Sent', icon: '📤' },
  { key: 'viewed', label: 'Viewed', icon: '👁️' },
  { key: 'won', label: 'Signed', icon: '✅' },
];

const STATUS_ORDER: ProposalStatus[] = ['draft', 'sent', 'viewed', 'won', 'lost'];

function getStepIndex(status: ProposalStatus): number {
  if (status === 'lost' || status === 'expired' || status === 'archived') return -1;
  return STATUS_ORDER.indexOf(status);
}

function ProposalStatusTimeline({
  proposal,
}: {
  proposal: ProposalWithDetails;
}) {
  const currentIndex = getStepIndex(proposal.status);
  const isLost = proposal.status === 'lost' || proposal.status === 'expired';

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Proposal Lifecycle</h3>
      <div className="flex items-center gap-0">
        {STATUS_STEPS.map((step, i) => {
          const stepIndex = STATUS_ORDER.indexOf(step.key);
          const isDone = !isLost && currentIndex >= stepIndex;
          const isCurrent = !isLost && currentIndex === stepIndex;
          const isLastStep = i === STATUS_STEPS.length - 1;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all"
                  style={{
                    backgroundColor: isDone
                      ? isCurrent
                        ? 'var(--primary)'
                        : 'rgb(16 185 129)'
                      : 'var(--muted)',
                    border: isCurrent ? '2px solid var(--primary)' : '2px solid transparent',
                    boxShadow: isCurrent ? '0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent)' : 'none',
                  }}
                >
                  {isDone && !isCurrent ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span
                  className="text-xs mt-1.5 font-medium"
                  style={{
                    color: isDone ? (isCurrent ? 'var(--foreground)' : 'rgb(16 185 129)') : 'var(--muted-foreground)',
                  }}
                >
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(proposal.updated_at)}
                  </span>
                )}
                {!isCurrent && isDone && i === 0 && (
                  <span className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {formatDate(proposal.created_at)}
                  </span>
                )}
              </div>
              {!isLastStep && (
                <div
                  className="flex-1 h-0.5 mx-1 mb-5 transition-all"
                  style={{
                    backgroundColor:
                      !isLost && currentIndex > STATUS_ORDER.indexOf(step.key)
                        ? 'rgb(16 185 129)'
                        : 'var(--border)',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Lost state indicator */}
        {isLost && (
          <>
            <div className="flex-1 h-0.5 mx-1 mb-5" style={{ backgroundColor: 'var(--border)' }} />
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.4)' }}
              >
                <X className="w-4 h-4" style={{ color: '#EF4444' }} />
              </div>
              <span className="text-xs mt-1.5 font-medium" style={{ color: '#EF4444' }}>
                {proposal.status === 'expired' ? 'Expired' : 'Lost'}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// ─── Signature Modal ────────────────────────────────────────────────────────

type SignStep = 'review' | 'sign' | 'complete';
const SIGN_STEPS: SignStep[] = ['review', 'sign', 'complete'];

interface SignatureModalProps {
  proposal: ProposalWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSigned: () => void;
}

function SignatureModal({ proposal, isOpen, onClose, onSigned }: SignatureModalProps) {
  const [step, setStep] = useState<SignStep>('review');
  const [sigMethod, setSigMethod] = useState<'type' | 'draw'>('type');
  const [typedSig, setTypedSig] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setSigMethod('type');
      setTypedSig('');
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isOpen]);

  // Canvas drawing logic
  useEffect(() => {
    if (step !== 'sign' || sigMethod !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear on method switch
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let drawing = false;

    const getPos = (e: MouseEvent | TouchEvent) => {
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

    const start = (e: MouseEvent | TouchEvent) => {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return;
      const pos = getPos(e);
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };
    const stop = () => {
      drawing = false;
      ctx.beginPath();
    };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseleave', stop);
    canvas.addEventListener('touchstart', start, { passive: true });
    canvas.addEventListener('touchmove', draw, { passive: true });
    canvas.addEventListener('touchend', stop);

    return () => {
      canvas.removeEventListener('mousedown', start);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stop);
      canvas.removeEventListener('mouseleave', stop);
      canvas.removeEventListener('touchstart', start);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stop);
    };
  }, [step, sigMethod]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function canProceedFromSign() {
    if (sigMethod === 'type') return typedSig.trim().length > 0;
    // For draw, check if canvas has any content
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return data.some(v => v !== 0);
  }

  async function handleSubmitSignature() {
    setSubmitting(true);
    const result = await updateProposalStatus(proposal.id, 'won');
    setSubmitting(false);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    setStep('complete');
    onSigned();
  }

  if (!isOpen) return null;

  const currentStepIndex = SIGN_STEPS.indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" style={{ color: 'var(--primary)' }} />
            <h2 className="font-semibold text-[var(--foreground)]">Sign Proposal</h2>
          </div>
          {step !== 'complete' && (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* Step progress indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {SIGN_STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{
                    backgroundColor:
                      step === s
                        ? 'var(--primary)'
                        : currentStepIndex > i
                        ? 'rgb(16 185 129)'
                        : 'var(--muted)',
                    color:
                      step === s || currentStepIndex > i
                        ? '#fff'
                        : 'var(--muted-foreground)',
                  }}
                >
                  {currentStepIndex > i ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium capitalize"
                  style={{
                    color: step === s ? 'var(--foreground)' : 'var(--muted-foreground)',
                  }}
                >
                  {s}
                </span>
                {i < SIGN_STEPS.length - 1 && (
                  <div
                    className="h-px w-6"
                    style={{
                      backgroundColor: currentStepIndex > i ? 'rgb(16 185 129)' : 'var(--border)',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1: Review ── */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Proposal</p>
                  <p className="font-semibold text-[var(--foreground)]">{proposal.title}</p>
                </div>
                {proposal.clients && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Client</p>
                    <p className="text-sm text-[var(--foreground)]">
                      {proposal.clients.name}
                      {proposal.clients.company ? ` · ${proposal.clients.company}` : ''}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Value</p>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {formatCurrency(proposal.value, proposal.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Pricing</p>
                    <p className="text-sm text-[var(--foreground)]">{getPricingLabel(proposal.pricing_model)}</p>
                  </div>
                </div>
                {proposal.valid_until && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Valid Until</p>
                    <p className="text-sm text-[var(--foreground)]">{formatDate(proposal.valid_until)}</p>
                  </div>
                )}
                {proposal.notes && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Key Notes</p>
                    <p className="text-sm text-[var(--foreground)] line-clamp-2">{proposal.notes}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                By proceeding, you confirm you have reviewed the proposal details above.
              </p>
              <Button className="w-full" onClick={() => setStep('sign')}>
                Continue to Sign →
              </Button>
            </div>
          )}

          {/* ── Step 2: Sign ── */}
          {step === 'sign' && (
            <div className="space-y-4">
              {/* Method tabs */}
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {(['type', 'draw'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => setSigMethod(m)}
                    className="flex-1 py-2 text-sm font-medium transition-colors capitalize"
                    style={{
                      backgroundColor: sigMethod === m ? 'var(--primary)' : 'transparent',
                      color: sigMethod === m ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {m === 'type' ? 'Type Signature' : 'Draw Signature'}
                  </button>
                ))}
              </div>

              {sigMethod === 'type' ? (
                <div>
                  <label className="block text-xs text-[var(--muted-foreground)] mb-1.5">
                    Type your full name to sign
                  </label>
                  <input
                    type="text"
                    value={typedSig}
                    onChange={e => setTypedSig(e.target.value)}
                    placeholder="Your full name..."
                    className="w-full px-4 py-3 rounded-lg outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--muted)',
                      border: '1px solid var(--border)',
                      color: 'var(--foreground)',
                      fontFamily: 'Georgia, "Times New Roman", serif',
                      fontStyle: 'italic',
                      fontSize: '1.25rem',
                      letterSpacing: '0.025em',
                    }}
                  />
                  {typedSig && (
                    <div
                      className="mt-3 px-4 py-3 rounded-lg text-center"
                      style={{
                        backgroundColor: '#fafafa',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontStyle: 'italic',
                        fontSize: '1.5rem',
                        color: '#1a1a1a',
                      }}
                    >
                      {typedSig}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs text-[var(--muted-foreground)]">
                      Draw your signature below
                    </label>
                    <button
                      onClick={clearCanvas}
                      className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] underline"
                    >
                      Clear
                    </button>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={140}
                    className="w-full rounded-lg touch-none cursor-crosshair"
                    style={{
                      backgroundColor: '#fafafa',
                      border: '1px solid #e2e8f0',
                      display: 'block',
                    }}
                  />
                  <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
                    Use your mouse or finger to draw your signature
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('review')}>
                  ← Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitSignature}
                  disabled={submitting || !canProceedFromSign()}
                >
                  {submitting ? 'Signing...' : 'Submit Signature'}
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Complete ── */}
          {step === 'complete' && (
            <div className="text-center py-4 space-y-5">
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.4)' }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: 'rgb(16 185 129)' }} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Proposal Signed!</h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  The proposal has been signed and marked as won.
                </p>
              </div>
              <div className="flex gap-3">
                <a href={`/api/proposals/${proposal.id}/pdf`} download className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
                <Button className="flex-1" onClick={onClose}>
                  Return to Proposals
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ProposalDetail({ proposal, analytics }: ProposalDetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareToken, setShareToken] = useState(proposal.share_token);
  const [copied, setCopied] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProposalStatus>(proposal.status);

  async function handleDelete() {
    if (!confirm('Delete this proposal? This action cannot be undone.')) return;
    setDeleting(true);
    const result = await deleteProposal(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setDeleting(false);
      return;
    }
    toast({ title: 'Proposal deleted' });
    router.push('/proposals');
  }

  async function handleShare() {
    if (shareToken) {
      setShowSharePanel(true);
      return;
    }
    setSharing(true);
    const result = await generateShareToken(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      setSharing(false);
      return;
    }
    setShareToken(result.data!);
    setShowSharePanel(true);
    setSharing(false);
    toast({ title: 'Share link created' });
  }

  async function handleRevoke() {
    const result = await revokeShareToken(proposal.id);
    if (result.error) {
      toast({ title: result.error, variant: 'destructive' });
      return;
    }
    setShareToken(null);
    setShowSharePanel(false);
    toast({ title: 'Share link revoked' });
  }

  function handleCopy() {
    const url = `${window.location.origin}/share/${shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSigned() {
    setCurrentStatus('won');
    toast({ title: 'Proposal signed successfully!' });
  }

  const shareUrl = shareToken ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareToken}` : '';

  // Build a proposal object with updated status for the timeline
  const proposalWithStatus = { ...proposal, status: currentStatus };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{proposal.title}</h1>
            <Badge variant={currentStatus as ProposalStatus}>{getStatusLabel(currentStatus)}</Badge>
          </div>
          {proposal.clients && (
            <div className="flex items-center gap-1 mt-1 text-[var(--muted-foreground)]">
              <Building2 className="w-4 h-4" />
              <span>{proposal.clients.name}{proposal.clients.company ? ` · ${proposal.clients.company}` : ''}</span>
            </div>
          )}
          <div className="mt-2">
            <ProposalPresence proposalId={proposal.id} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          {currentStatus !== 'won' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSignModal(true)}
              style={{ borderColor: 'rgb(16 185 129)', color: 'rgb(16 185 129)' }}
            >
              <FileSignature className="w-4 h-4 mr-1" />
              Send for Signature
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleShare} disabled={sharing}>
            <Share2 className="w-4 h-4 mr-1" />{sharing ? 'Creating...' : shareToken ? 'Share Link' : 'Share'}
          </Button>
          <Link href={`/proposals/${proposal.id}/edit`}>
            <Button variant="outline" size="sm"><Edit className="w-4 h-4 mr-1" />Edit</Button>
          </Link>
          <a href={`/api/proposals/${proposal.id}/pdf`} download>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />PDF</Button>
          </a>
          <Button variant="outline" size="sm" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-1" />{deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Share Panel */}
      {showSharePanel && shareToken && (
        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-[var(--foreground)]">Share Link</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSharePanel(false)} aria-label="Close share panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 text-sm bg-white border border-[var(--border)] rounded-md px-3 py-1.5 text-[var(--foreground)]"
            />
            <Button size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-[var(--muted-foreground)]">
              Anyone with this link can view the proposal. Status auto-updates to &quot;Viewed&quot; when opened.
            </p>
            <Button variant="ghost" size="sm" onClick={handleRevoke} className="text-xs text-red-600 hover:text-red-700">
              Revoke Link
            </Button>
          </div>
        </Card>
      )}

      {/* Status Timeline */}
      <ProposalStatusTimeline proposal={proposalWithStatus} />

      {analytics && (
        <ProposalAnalytics
          proposalId={proposal.id}
          viewEvents={analytics.viewEvents}
          totalViews={analytics.totalViews}
          lastViewedAt={analytics.lastViewedAt}
          avgTimeSeconds={analytics.avgTimeSeconds}
        />
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <DollarSign className="w-4 h-4" />
            <span>Value</span>
          </div>
          <p className="mt-1 text-lg font-semibold font-mono-pricing text-[var(--foreground)]">{formatCurrency(proposal.value, proposal.currency)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Send className="w-4 h-4" />
            <span>Pricing</span>
          </div>
          <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
            <Badge variant={proposal.pricing_model as PricingModel}>{getPricingLabel(proposal.pricing_model)}</Badge>
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Calendar className="w-4 h-4" />
            <span>Created</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{formatDate(proposal.created_at)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Calendar className="w-4 h-4" />
            <span>Valid Until</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{proposal.valid_until ? formatDate(proposal.valid_until) : 'No deadline'}</p>
        </Card>
      </div>

      {proposal.notes && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Notes</h3>
          <p className="text-sm text-[var(--foreground)]">{proposal.notes}</p>
        </Card>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Sections</h2>
          <Link href={`/proposals/${proposal.id}/sections/new`}>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Section</Button>
          </Link>
        </div>
        <ProposalSectionList sections={proposal.proposal_sections} proposalId={proposal.id} />
      </div>

      {/* Signature Modal */}
      <SignatureModal
        proposal={proposal}
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        onSigned={handleSigned}
      />
    </div>
  );
}
