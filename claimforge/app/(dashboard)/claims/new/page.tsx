'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { createClaim } from '@/lib/actions/claims';
import type { ClaimType } from '@/types/database';
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  Camera,
  Upload,
  CheckCircle2,
  Car,
  Home,
  Heart,
  Shield,
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';

type Step = 'type' | 'details' | 'documents' | 'review';

const CLAIM_TYPES = [
  { id: 'auto', label: 'Auto', icon: Car, description: 'Vehicle damage, collision, theft' },
  { id: 'property', label: 'Property', icon: Home, description: 'Home, renters, commercial property' },
  { id: 'health', label: 'Health', icon: Heart, description: 'Medical bills, treatments, procedures' },
  { id: 'liability', label: 'Liability', icon: Shield, description: 'Personal injury, property damage claims against you' },
];

interface FormData {
  claimType: string;
  incidentDate: string;
  incidentLocation: string;
  description: string;
  estimatedAmount: string;
  policyNumber: string;
  witnesses: string;
  photos: File[];
}

const STEPS: Step[] = ['type', 'details', 'documents', 'review'];
const STEP_LABELS: Record<Step, string> = {
  type: 'Claim Type',
  details: 'Incident Details',
  documents: 'Documents',
  review: 'Review & Submit',
};

export default function NewClaimPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('type');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<FormData>({
    claimType: '',
    incidentDate: '',
    incidentLocation: '',
    description: '',
    estimatedAmount: '',
    policyNumber: '',
    witnesses: '',
    photos: [],
  });

  const triggerShake = () => {
    const el = shakeRef.current;
    if (!el) return;
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'shake 0.5s ease';
  };

  const currentIndex = STEPS.indexOf(currentStep);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  function updateField(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function canProceed() {
    if (currentStep === 'type') return !!form.claimType;
    if (currentStep === 'details') return !!form.incidentDate && !!form.description && !!form.estimatedAmount;
    return true;
  }

  function next() {
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1]!);
  }

  function back() {
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) setCurrentStep(STEPS[idx - 1]!);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data, error } = await createClaim({
        claim_type: form.claimType as ClaimType,
        incident_date: form.incidentDate,
        incident_location: form.incidentLocation || undefined,
        description: form.description,
        estimated_amount: parseFloat(form.estimatedAmount) || 0,
        policy_number: form.policyNumber || undefined,
        witnesses: form.witnesses || undefined,
      });

      if (error) {
        const msg = String(error);
        setSubmitError(msg);
        triggerShake();
        toast({ title: 'Failed to create claim', description: msg, variant: 'destructive' });
        setSubmitting(false);
        return;
      }

      router.push('/claims');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Please try again.';
      setSubmitError(msg);
      triggerShake();
      toast({ title: 'Unexpected error', description: msg, variant: 'destructive' });
      setSubmitting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Submit New Claim" subtitle="Guided claim submission" />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      i < currentIndex
                        ? 'bg-verified-green text-white'
                        : i === currentIndex
                        ? 'bg-primary text-text-on-color'
                        : 'bg-bg-surface-raised text-text-tertiary border border-border-default'
                    }`}>
                      {i < currentIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className="mt-1 text-[10px] text-text-tertiary">{STEP_LABELS[step]}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-2 flex-1 h-0.5 mb-5 ${i < currentIndex ? 'bg-verified-green' : 'bg-border-default'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="rounded-xl border border-border-default bg-bg-surface p-6">

            {/* Step 1: Type */}
            {currentStep === 'type' && (
              <div>
                <h2 className="legal-heading text-base text-text-primary mb-1">What type of claim?</h2>
                <p className="text-sm text-text-secondary mb-5">Select the insurance category for your claim.</p>
                <div className="grid grid-cols-2 gap-3">
                  {CLAIM_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateField('claimType', t.id)}
                      className={`flex flex-col items-center gap-3 rounded-xl border-2 p-5 transition-all ${
                        form.claimType === t.id
                          ? 'border-primary bg-primary-muted'
                          : 'border-border-default hover:border-border-emphasis'
                      }`}
                    >
                      <t.icon className={`h-8 w-8 ${form.claimType === t.id ? 'text-primary-light' : 'text-text-tertiary'}`} />
                      <div>
                        <div className="font-semibold text-sm text-text-primary">{t.label}</div>
                        <div className="text-xs text-text-tertiary mt-0.5">{t.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 'details' && (
              <div className="space-y-5">
                <h2 className="legal-heading text-base text-text-primary mb-1">Incident details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Date of Incident *</label>
                    <input
                      type="date"
                      value={form.incidentDate}
                      onChange={(e) => updateField('incidentDate', e.target.value)}
                      className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-text-secondary">Policy Number</label>
                    <input
                      type="text"
                      value={form.policyNumber}
                      onChange={(e) => updateField('policyNumber', e.target.value)}
                      placeholder="e.g., POL-2023-XXXXX"
                      className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Location of Incident</label>
                  <input
                    type="text"
                    value={form.incidentLocation}
                    onChange={(e) => updateField('incidentLocation', e.target.value)}
                    placeholder="Address or description of location"
                    className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Description of Incident *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe what happened in detail..."
                    rows={4}
                    className="w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Estimated Claim Amount ($) *</label>
                  <input
                    type="number"
                    value={form.estimatedAmount}
                    onChange={(e) => updateField('estimatedAmount', e.target.value)}
                    placeholder="0.00"
                    className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Witnesses (optional)</label>
                  <textarea
                    value={form.witnesses}
                    onChange={(e) => updateField('witnesses', e.target.value)}
                    placeholder="Names and contact info of any witnesses"
                    rows={2}
                    className="w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {currentStep === 'documents' && (
              <div>
                <h2 className="legal-heading text-base text-text-primary mb-1">Supporting documents</h2>
                <p className="text-sm text-text-secondary mb-5">Upload photos, receipts, police reports, or medical records to support your claim. AI will extract data automatically.</p>

                <div className="rounded-xl border-2 border-dashed border-border-default p-8 text-center hover:border-border-emphasis transition-colors cursor-pointer">
                  <Upload className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
                  <p className="text-sm text-text-secondary">Drag & drop files here, or click to browse</p>
                  <p className="text-xs text-text-tertiary mt-1">PDF, JPG, PNG, DOCX — max 50MB each</p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {[
                    { icon: Camera, label: 'Photo of damage', desc: 'Camera roll or take a photo' },
                    { icon: FileText, label: 'Police report', desc: 'PDF or scanned document' },
                    { icon: FileText, label: 'Receipts / invoices', desc: 'Repair estimates, bills' },
                    { icon: FileText, label: 'Medical records', desc: 'If injury is involved' },
                  ].map((doc) => (
                    <div key={doc.label} className="flex items-center gap-3 rounded-lg border border-border-muted p-3">
                      <doc.icon className="h-4 w-4 text-text-tertiary shrink-0" />
                      <div>
                        <div className="text-xs font-medium text-text-secondary">{doc.label}</div>
                        <div className="text-[10px] text-text-tertiary">{doc.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-xs text-text-tertiary">
                  You can also upload documents after submission from the claim detail page.
                </p>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 'review' && (
              <div>
                <h2 className="legal-heading text-base text-text-primary mb-1">Review your claim</h2>
                <p className="text-sm text-text-secondary mb-5">Please verify all details before submitting.</p>

                <div className="space-y-4">
                  <div className="rounded-lg border border-border-default divide-y divide-border-muted">
                    {[
                      { label: 'Claim Type', value: CLAIM_TYPES.find((t) => t.id === form.claimType)?.label ?? '-' },
                      { label: 'Incident Date', value: form.incidentDate || '-' },
                      { label: 'Policy Number', value: form.policyNumber || 'Not provided' },
                      { label: 'Location', value: form.incidentLocation || 'Not provided' },
                      { label: 'Estimated Amount', value: form.estimatedAmount ? `$${parseFloat(form.estimatedAmount).toLocaleString()}` : '-' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between px-4 py-3">
                        <span className="text-xs text-text-tertiary">{row.label}</span>
                        <span className="text-sm font-medium text-text-primary">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border-default p-4">
                    <p className="text-[10px] text-text-tertiary mb-1">Description</p>
                    <p className="text-sm text-text-secondary">{form.description || '-'}</p>
                  </div>

                  <div className="rounded-lg bg-primary-muted border border-primary/20 p-4 text-xs text-text-secondary">
                    By submitting, you certify that all information provided is true and accurate to the best of your knowledge.
                    False claims may result in policy cancellation and legal action.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          {submitError && (
            <div
              ref={shakeRef}
              className="mt-4 rounded-lg border px-4 py-3 text-sm"
              style={{ backgroundColor: 'rgba(var(--destructive-rgb,239,68,68),0.1)', borderColor: 'rgba(var(--destructive-rgb,239,68,68),0.2)', color: 'var(--destructive, #dc2626)', animationDuration: '0.5s' }}
            >
              {submitError}
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            {currentIndex > 0 ? (
              <button
                onClick={back}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-surface-raised transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentIndex < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={!canProceed()}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-40"
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-text-on-color transition-colors hover:bg-primary-hover disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>Submit Claim<CheckCircle2 className="h-4 w-4" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
