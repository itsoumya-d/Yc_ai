'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/layout/page-header';
import type { Claim } from '@/types/database';
import {
  ArrowLeft,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileText,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  Wifi,
  Scale,
} from 'lucide-react';
import {
  submitClaimToCarrier,
  getCarrierClaimStatus,
  type CarrierConnection,
  type CarrierSubmission,
} from '@/lib/actions/carriers';

// ── Status Config ───────────────────────────────────────────────────────────

const CARRIER_STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType; description: string }> = {
  pending: { label: 'Pending', color: 'bg-bg-surface-raised text-text-tertiary', Icon: Clock, description: 'Claim has not been submitted to carrier yet.' },
  submitted: { label: 'Submitted', color: 'bg-primary-muted text-primary-light', Icon: Send, description: 'Claim has been submitted to the carrier and is awaiting acknowledgment.' },
  acknowledged: { label: 'Acknowledged', color: 'bg-info-muted text-info', Icon: CheckCircle2, description: 'Carrier has acknowledged receipt of the claim.' },
  under_review: { label: 'Under Review', color: 'bg-warning-muted text-warning', Icon: AlertCircle, description: 'Carrier is actively reviewing the claim details and documentation.' },
  approved: { label: 'Approved', color: 'bg-verified-green-muted text-verified-green', Icon: CheckCircle2, description: 'Claim has been approved by the carrier.' },
  denied: { label: 'Denied', color: 'bg-fraud-red-muted text-fraud-red', Icon: XCircle, description: 'Claim has been denied by the carrier. You may file an appeal.' },
  appealed: { label: 'Appealed', color: 'bg-accent-muted text-accent', Icon: Scale, description: 'An appeal has been submitted to the carrier for reconsideration.' },
};

// ── Types ───────────────────────────────────────────────────────────────────

type SubmissionWithCarrier = CarrierSubmission & { carrier_name: string };

interface CarrierClaimClientProps {
  claim: Claim | null;
  claimError?: string;
  carrierStatus: { submission: CarrierSubmission; connection: CarrierConnection } | null;
  communications: SubmissionWithCarrier[];
  availableCarriers: CarrierConnection[];
}

// ── Component ───────────────────────────────────────────────────────────────

export function CarrierClaimClient({
  claim,
  claimError,
  carrierStatus,
  communications,
  availableCarriers,
}: CarrierClaimClientProps) {
  const [isPending, startTransition] = useTransition();
  const [comms, setComms] = useState(communications);
  const [currentStatus, setCurrentStatus] = useState(carrierStatus);
  const [selectedCarrier, setSelectedCarrier] = useState(carrierStatus?.connection.id ?? '');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealReason, setAppealReason] = useState('');
  const [expandedComm, setExpandedComm] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  if (claimError || !claim) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Carrier Communication" subtitle="Claim not found">
          <Link
            href="/claims"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </PageHeader>
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-xl border border-fraud-red/20 bg-fraud-red-muted p-6 text-center">
            <p className="text-sm text-fraud-red">{claimError ?? 'Claim not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const latestStatus = currentStatus?.submission.status ?? 'pending';
  const statusCfg = CARRIER_STATUS_CONFIG[latestStatus] ?? CARRIER_STATUS_CONFIG['pending']!;
  const StatusIcon = statusCfg.Icon;

  async function handleSubmitToCarrier() {
    if (!selectedCarrier) {
      setSubmitError('Select a carrier connection');
      return;
    }
    setSubmitError('');
    startTransition(async () => {
      const result = await submitClaimToCarrier(claim!.id, selectedCarrier, 'initial');
      if (result.error) {
        setSubmitError(result.error);
      } else if (result.data) {
        setComms((prev) => [
          { ...result.data!, carrier_name: availableCarriers.find((c) => c.id === selectedCarrier)?.carrier_name ?? 'Carrier' },
          ...prev,
        ]);
        setShowSubmitConfirm(false);
        // Refresh status
        const statusRes = await getCarrierClaimStatus(claim!.id);
        if (statusRes.data) setCurrentStatus(statusRes.data);
      }
    });
  }

  async function handleAppealSubmit() {
    if (!selectedCarrier || !appealReason.trim()) return;
    setSubmitError('');
    startTransition(async () => {
      const result = await submitClaimToCarrier(claim!.id, selectedCarrier, 'appeal');
      if (result.error) {
        setSubmitError(result.error);
      } else if (result.data) {
        setComms((prev) => [
          { ...result.data!, carrier_name: availableCarriers.find((c) => c.id === selectedCarrier)?.carrier_name ?? 'Carrier' },
          ...prev,
        ]);
        setShowAppealForm(false);
        setAppealReason('');
        const statusRes = await getCarrierClaimStatus(claim!.id);
        if (statusRes.data) setCurrentStatus(statusRes.data);
      }
    });
  }

  async function handleRefreshStatus() {
    setRefreshing(true);
    const statusRes = await getCarrierClaimStatus(claim!.id);
    if (statusRes.data) setCurrentStatus(statusRes.data);
    setRefreshing(false);
  }

  function downloadAcordXml(comm: SubmissionWithCarrier) {
    if (!comm.acord_xml) return;
    const blob = new Blob([comm.acord_xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `acord-${comm.submission_type}-${comm.carrier_claim_number ?? comm.id}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title={`Carrier: ${claim.claim_number}`}
        subtitle={`${claim.claim_type.charAt(0).toUpperCase() + claim.claim_type.slice(1)} Claim - ${claim.claimant}`}
      >
        <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', statusCfg.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </span>
        <button
          onClick={handleRefreshStatus}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised disabled:opacity-50"
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          Refresh
        </button>
        <Link
          href={`/claims/${claim.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Claim
        </Link>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          {/* Carrier Status Card */}
          <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="legal-heading text-sm text-text-primary">Carrier Claim Status</h3>
                <p className="mt-1 text-xs text-text-secondary">{statusCfg.description}</p>
              </div>
              <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', statusCfg.color)}>
                <StatusIcon className="h-6 w-6" />
              </div>
            </div>

            {currentStatus?.submission && (
              <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border-muted pt-4">
                <div>
                  <div className="text-[10px] text-text-tertiary">Carrier</div>
                  <div className="text-sm text-text-primary">{currentStatus.connection.carrier_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Carrier Claim #</div>
                  <div className="font-mono text-sm text-text-primary">
                    {currentStatus.submission.carrier_claim_number ?? 'Not assigned'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-tertiary">Last Updated</div>
                  <div className="text-sm text-text-primary">
                    {currentStatus.submission.responded_at
                      ? new Date(currentStatus.submission.responded_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })
                      : currentStatus.submission.submitted_at
                        ? new Date(currentStatus.submission.submitted_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })
                        : 'N/A'}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex items-center gap-2 border-t border-border-muted pt-4">
              {latestStatus === 'pending' && (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
                >
                  <Send className="h-4 w-4" />
                  Submit to Carrier
                </button>
              )}
              {latestStatus === 'denied' && (
                <button
                  onClick={() => setShowAppealForm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-accent/90"
                >
                  <Scale className="h-4 w-4" />
                  File Appeal
                </button>
              )}
              {!currentStatus && availableCarriers.length > 0 && (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
                >
                  <Send className="h-4 w-4" />
                  Submit to Carrier
                </button>
              )}
              {!currentStatus && availableCarriers.length === 0 && (
                <Link
                  href="/settings/carriers"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-light transition-colors hover:bg-primary-muted"
                >
                  <Wifi className="h-4 w-4" />
                  Connect a Carrier First
                </Link>
              )}
            </div>
          </div>

          {/* Submit Confirmation */}
          <AnimatePresence>
            {showSubmitConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-primary/30 bg-primary-muted p-5 space-y-4">
                  <h3 className="text-sm font-medium text-text-primary">Submit Claim to Carrier</h3>
                  <p className="text-xs text-text-secondary">
                    This will generate an ACORD-formatted XML submission and send it to the selected carrier. Ensure all claim details and documents are complete before submitting.
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Select Carrier</label>
                    <select
                      value={selectedCarrier}
                      onChange={(e) => setSelectedCarrier(e.target.value)}
                      className="h-9 w-full max-w-xs rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    >
                      <option value="">Choose carrier...</option>
                      {availableCarriers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.carrier_name} ({c.carrier_code})
                        </option>
                      ))}
                    </select>
                  </div>
                  {submitError && (
                    <div className="rounded-lg border border-fraud-red/20 bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
                      {submitError}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubmitToCarrier}
                      disabled={isPending || !selectedCarrier}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Confirm & Submit
                    </button>
                    <button
                      onClick={() => { setShowSubmitConfirm(false); setSubmitError(''); }}
                      className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Appeal Form */}
          <AnimatePresence>
            {showAppealForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-accent/30 bg-accent-muted p-5 space-y-4">
                  <h3 className="text-sm font-medium text-text-primary">File Carrier Appeal</h3>
                  <p className="text-xs text-text-secondary">
                    Submit an appeal to the carrier for reconsideration of the denial. Include any additional supporting evidence or reasoning.
                  </p>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Appeal Reason</label>
                    <textarea
                      value={appealReason}
                      onChange={(e) => setAppealReason(e.target.value)}
                      placeholder="Describe the grounds for appeal, referencing specific policy terms, additional evidence, or factual corrections..."
                      rows={4}
                      className="w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none"
                    />
                  </div>
                  {submitError && (
                    <div className="rounded-lg border border-fraud-red/20 bg-fraud-red-muted px-3 py-2 text-xs text-fraud-red">
                      {submitError}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAppealSubmit}
                      disabled={isPending || !appealReason.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-accent/90 disabled:opacity-50"
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
                      Submit Appeal
                    </button>
                    <button
                      onClick={() => { setShowAppealForm(false); setSubmitError(''); setAppealReason(''); }}
                      className="rounded-lg border border-border-default px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-surface-raised"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Communication Timeline */}
          <div>
            <h3 className="legal-heading text-sm text-text-primary mb-4">Communication Timeline</h3>
            {comms.length === 0 ? (
              <div className="rounded-xl border border-border-default bg-bg-surface p-8 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
                <p className="text-sm text-text-tertiary">No carrier communications yet</p>
                <p className="text-xs text-text-tertiary mt-1">
                  Submit this claim to a carrier to begin the communication timeline.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {comms.map((comm, idx) => {
                  const commStatus = CARRIER_STATUS_CONFIG[comm.status] ?? CARRIER_STATUS_CONFIG['pending']!;
                  const CommIcon = commStatus.Icon;
                  const isExpanded = expandedComm === comm.id;
                  const isLast = idx === comms.length - 1;

                  const submissionLabel: Record<string, string> = {
                    initial: 'Initial Submission',
                    supplement: 'Supplemental Submission',
                    appeal: 'Appeal Submission',
                    status_inquiry: 'Status Inquiry',
                  };

                  return (
                    <div key={comm.id} className="flex gap-4 pb-4">
                      {/* Timeline dot + line */}
                      <div className="flex flex-col items-center">
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', commStatus.color)}>
                          <CommIcon className="h-3.5 w-3.5" />
                        </div>
                        {!isLast && <div className="flex-1 w-px bg-border-muted my-1" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {submissionLabel[comm.submission_type] ?? comm.submission_type}
                            </span>
                            <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium', commStatus.color)}>
                              {commStatus.label}
                            </span>
                          </div>
                          <span className="text-xs text-text-tertiary">
                            {new Date(comm.created_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-text-secondary">
                          {comm.carrier_name} &middot; Claim #{comm.carrier_claim_number ?? 'Pending'}
                        </p>

                        {comm.submitted_at && (
                          <p className="text-[10px] text-text-tertiary mt-0.5">
                            Submitted: {new Date(comm.submitted_at).toLocaleString()}
                          </p>
                        )}
                        {comm.responded_at && (
                          <p className="text-[10px] text-text-tertiary">
                            Response: {new Date(comm.responded_at).toLocaleString()}
                          </p>
                        )}

                        {/* Expand/collapse details */}
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => setExpandedComm(isExpanded ? null : comm.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-primary-light hover:underline"
                          >
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            {isExpanded ? 'Hide details' : 'View details'}
                          </button>
                          {comm.acord_xml && (
                            <button
                              onClick={() => downloadAcordXml(comm)}
                              className="inline-flex items-center gap-1 text-[10px] text-text-tertiary hover:text-text-secondary"
                            >
                              <Download className="h-3 w-3" />
                              Download ACORD XML
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-3 space-y-3">
                                {/* Carrier Response */}
                                {comm.carrier_response && (
                                  <div className="rounded-lg border border-border-muted bg-bg-surface-raised p-3">
                                    <div className="text-[10px] font-medium text-text-tertiary mb-1">Carrier Response</div>
                                    <pre className="text-[10px] text-text-secondary overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                                      {comm.carrier_response.length > 2000
                                        ? comm.carrier_response.slice(0, 2000) + '...'
                                        : comm.carrier_response}
                                    </pre>
                                  </div>
                                )}

                                {/* Response Details */}
                                {comm.response_details && Object.keys(comm.response_details).length > 0 && (
                                  <div className="rounded-lg border border-border-muted bg-bg-surface-raised p-3">
                                    <div className="text-[10px] font-medium text-text-tertiary mb-1">Response Details</div>
                                    <div className="space-y-1">
                                      {Object.entries(comm.response_details).map(([key, val]) => (
                                        <div key={key} className="flex items-start gap-2 text-[10px]">
                                          <span className="text-text-tertiary font-mono shrink-0">{key}:</span>
                                          <span className="text-text-secondary">
                                            {typeof val === 'string' ? val : JSON.stringify(val)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* ACORD XML Preview */}
                                {comm.acord_xml && (
                                  <div className="rounded-lg border border-border-muted bg-bg-surface-raised p-3">
                                    <div className="text-[10px] font-medium text-text-tertiary mb-1">ACORD XML Submission</div>
                                    <pre className="text-[10px] text-text-secondary overflow-auto max-h-40 whitespace-pre-wrap font-mono">
                                      {comm.acord_xml.slice(0, 1500)}{comm.acord_xml.length > 1500 ? '\n... (truncated)' : ''}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
