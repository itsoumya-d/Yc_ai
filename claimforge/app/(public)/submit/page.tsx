'use client';

import { useState } from 'react';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Step = 'intro' | 'accused' | 'details' | 'evidence' | 'contact' | 'confirmation';

interface FormData {
  // Accused
  accusedOrganization: string;
  accusedIndividual: string;
  industry: string;
  // Fraud details
  fraudType: string;
  description: string;
  estimatedAmount: string;
  timePeriod: string;
  // Evidence
  hasDocuments: boolean;
  documentDescription: string;
  // Contact (all optional)
  isAnonymous: boolean;
  submitterName: string;
  submitterEmail: string;
  submitterPhone: string;
  submitterRelationship: string;
}

const INDUSTRIES = [
  'Healthcare / Medical', 'Defense Contracting', 'Government Services',
  'Construction / Engineering', 'Financial Services', 'Technology / IT',
  'Education', 'Research / Grant', 'Other',
];

const FRAUD_TYPES = [
  'False billing / Inflated invoices', 'Duplicate billing',
  'Phantom employees or services', 'Quality substitution',
  'Kickbacks or bribes', 'Grant fraud / Misuse of funds',
  'Medicare / Medicaid fraud', 'Procurement fraud',
  'Time and attendance fraud', 'Other',
];

const RELATIONSHIPS = [
  'Current employee', 'Former employee', 'Contractor / Vendor',
  'Customer / Client', 'Competitor', 'Regulatory insider',
  'Anonymous', 'Other',
];

const STEPS: Step[] = ['intro', 'accused', 'details', 'evidence', 'contact', 'confirmation'];

const STEP_LABELS: Partial<Record<Step, string>> = {
  accused: 'Who is involved',
  details: 'What happened',
  evidence: 'Evidence',
  contact: 'Your information',
};

function ProgressBar({ step }: { step: Step }) {
  const idx = STEPS.indexOf(step);
  const progressSteps = STEPS.filter((s) => STEP_LABELS[s]);
  const currentIdx = progressSteps.indexOf(step);
  if (currentIdx < 0) return null;
  return (
    <div className="flex items-center gap-2 mb-8">
      {progressSteps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            i < currentIdx ? 'bg-[#1a1f2e] text-white' :
            i === currentIdx ? 'bg-[#c41e3a] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {i < currentIdx ? '✓' : i + 1}
          </div>
          <span className={`text-xs ${i === currentIdx ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
            {STEP_LABELS[s]}
          </span>
          {i < progressSteps.length - 1 && <div className={`h-px w-6 ${i < currentIdx ? 'bg-[#1a1f2e]' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

export default function WhistleblowerPortal() {
  const [step, setStep] = useState<Step>('intro');
  const [form, setForm] = useState<FormData>({
    accusedOrganization: '', accusedIndividual: '', industry: '',
    fraudType: '', description: '', estimatedAmount: '', timePeriod: '',
    hasDocuments: false, documentDescription: '',
    isAnonymous: true, submitterName: '', submitterEmail: '',
    submitterPhone: '', submitterRelationship: '',
  });
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const update = (key: keyof FormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  function validate(currentStep: Step): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (currentStep === 'accused') {
      if (!form.accusedOrganization.trim()) newErrors.accusedOrganization = 'Organization name is required';
      if (!form.industry) newErrors.industry = 'Please select an industry';
    }
    if (currentStep === 'details') {
      if (!form.fraudType) newErrors.fraudType = 'Please select a fraud type';
      if (!form.description.trim() || form.description.length < 50)
        newErrors.description = 'Description must be at least 50 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  }

  function back() {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }

  async function submit() {
    if (!validate('contact')) return;
    setSubmitting(true);

    try {
      const supabase = createClient();

      // Generate reference number client-side (matching server function)
      const ref = 'CF-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      const { error } = await supabase.from('whistleblower_submissions').insert({
        reference_number: ref,
        accused_organization: form.accusedOrganization,
        accused_individual: form.accusedIndividual || null,
        industry: form.industry,
        fraud_type: form.fraudType,
        description: form.description,
        estimated_amount: form.estimatedAmount ? parseFloat(form.estimatedAmount.replace(/,/g, '')) : null,
        time_period: form.timePeriod || null,
        has_documents: form.hasDocuments,
        document_description: form.hasDocuments ? form.documentDescription : null,
        is_anonymous: form.isAnonymous,
        submitter_name: form.isAnonymous ? null : form.submitterName || null,
        submitter_email: form.isAnonymous ? null : form.submitterEmail || null,
        submitter_phone: form.isAnonymous ? null : form.submitterPhone || null,
        submitter_relationship: form.submitterRelationship || null,
      });

      if (error) throw error;
      setReferenceNumber(ref);
      setStep('confirmation');
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-[#c41e3a] focus:ring-1 focus:ring-[#c41e3a] transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errorClass = 'text-xs text-red-600 mt-1';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a1f2e]">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900">ClaimForge Whistleblower Portal</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="h-3 w-3" />
            Encrypted & Secure
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-10">
        {/* Intro Step */}
        {step === 'intro' && (
          <div>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a1f2e]">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Report Fraud Anonymously</h1>
              <p className="mt-2 text-gray-600">
                Help fight government fraud, waste, and abuse. Your identity is protected.
              </p>
            </div>

            <div className="grid gap-4 mb-8">
              {[
                { icon: Lock, title: 'Complete Anonymity', desc: 'You never need to provide your name or contact details. All submissions are encrypted.' },
                { icon: Shield, title: 'Legal Protections', desc: 'The False Claims Act protects whistleblowers from retaliation and provides financial rewards.' },
                { icon: Eye, title: 'Secure Processing', desc: 'Reports are reviewed by experienced investigators. All data is handled with strict confidentiality.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>Important:</strong> This portal is for reporting fraud against the federal government. For emergencies or imminent harm, contact law enforcement immediately.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('accused')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c41e3a] px-6 py-4 text-base font-semibold text-white hover:bg-[#a8192f] transition-colors"
            >
              Submit a Report
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Accused Step */}
        {step === 'accused' && (
          <div>
            <ProgressBar step={step} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Who is involved?</h2>
            <p className="text-sm text-gray-500 mb-6">Identify the organization or individual suspected of fraud.</p>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Organization or company name *</label>
                <input className={inputClass} placeholder="e.g. Apex Health Systems, Inc." value={form.accusedOrganization} onChange={(e) => update('accusedOrganization', e.target.value)} />
                {errors.accusedOrganization && <p className={errorClass}>{errors.accusedOrganization}</p>}
              </div>

              <div>
                <label className={labelClass}>Individual involved (optional)</label>
                <input className={inputClass} placeholder="e.g. John Smith, CFO" value={form.accusedIndividual} onChange={(e) => update('accusedIndividual', e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>Industry *</label>
                <select className={inputClass} value={form.industry} onChange={(e) => update('industry', e.target.value)}>
                  <option value="">Select an industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.industry && <p className={errorClass}>{errors.industry}</p>}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={back} className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={next} className="flex-1 rounded-xl bg-[#1a1f2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a2f3e] transition-colors">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Details Step */}
        {step === 'details' && (
          <div>
            <ProgressBar step={step} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Describe the fraud</h2>
            <p className="text-sm text-gray-500 mb-6">Be as specific as possible. More detail helps investigators act faster.</p>

            <div className="space-y-5">
              <div>
                <label className={labelClass}>Type of fraud *</label>
                <select className={inputClass} value={form.fraudType} onChange={(e) => update('fraudType', e.target.value)}>
                  <option value="">Select fraud type</option>
                  {FRAUD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.fraudType && <p className={errorClass}>{errors.fraudType}</p>}
              </div>

              <div>
                <label className={labelClass}>Describe what happened *</label>
                <textarea
                  className={inputClass + ' h-36 resize-none'}
                  placeholder="Describe the fraudulent activity in as much detail as possible. Include specific dates, amounts, names, and how you know about this fraud."
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  {errors.description
                    ? <p className={errorClass}>{errors.description}</p>
                    : <span />
                  }
                  <span className={`text-xs ${form.description.length < 50 ? 'text-gray-400' : 'text-green-600'}`}>
                    {form.description.length} chars (min 50)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Estimated amount (optional)</label>
                  <input className={inputClass} placeholder="e.g. 2,500,000" value={form.estimatedAmount} onChange={(e) => update('estimatedAmount', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Time period (optional)</label>
                  <input className={inputClass} placeholder="e.g. Jan 2022 – Present" value={form.timePeriod} onChange={(e) => update('timePeriod', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={back} className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={next} className="flex-1 rounded-xl bg-[#1a1f2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a2f3e]">Continue</button>
            </div>
          </div>
        )}

        {/* Evidence Step */}
        {step === 'evidence' && (
          <div>
            <ProgressBar step={step} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Do you have evidence?</h2>
            <p className="text-sm text-gray-500 mb-6">Evidence significantly strengthens your report. Describe what you have.</p>

            <div className="space-y-5">
              <div className="flex gap-4">
                {[true, false].map((val) => (
                  <button
                    key={String(val)}
                    onClick={() => update('hasDocuments', val)}
                    className={`flex-1 rounded-xl border-2 p-4 text-left transition-colors ${
                      form.hasDocuments === val ? 'border-[#c41e3a] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-sm">{val ? 'Yes, I have evidence' : 'No documents yet'}</div>
                    <div className="text-xs text-gray-500 mt-1">{val ? 'Invoices, emails, records, etc.' : "That's okay — proceed anyway"}</div>
                  </button>
                ))}
              </div>

              {form.hasDocuments && (
                <div>
                  <label className={labelClass}>Describe your evidence</label>
                  <textarea
                    className={inputClass + ' h-24 resize-none'}
                    placeholder="e.g. I have copies of invoices showing duplicate billing, email threads discussing the scheme, and internal memos."
                    value={form.documentDescription}
                    onChange={(e) => update('documentDescription', e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    An investigator will contact you (if you provide contact details) about secure document submission.
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs text-blue-800">
                  <strong>Document submission:</strong> After submitting this report, an investigator will reach out with a secure upload link if you provided contact information. Do not email documents directly.
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={back} className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button onClick={next} className="flex-1 rounded-xl bg-[#1a1f2e] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2a2f3e]">Continue</button>
            </div>
          </div>
        )}

        {/* Contact Step */}
        {step === 'contact' && (
          <div>
            <ProgressBar step={step} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your information</h2>
            <p className="text-sm text-gray-500 mb-6">All fields are completely optional. Providing contact details allows investigators to follow up.</p>

            <div className="flex gap-3 mb-6">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  onClick={() => update('isAnonymous', val)}
                  className={`flex-1 rounded-xl border-2 p-3 transition-colors ${
                    form.isAnonymous === val ? 'border-[#c41e3a] bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{val ? '🔒 Stay anonymous' : '📧 Provide contact info'}</div>
                </button>
              ))}
            </div>

            {!form.isAnonymous && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input className={inputClass} placeholder="Your full name" value={form.submitterName} onChange={(e) => update('submitterName', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Email address</label>
                  <input className={inputClass} type="email" placeholder="you@example.com" value={form.submitterEmail} onChange={(e) => update('submitterEmail', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Phone (optional)</label>
                  <input className={inputClass} placeholder="+1 (555) 000-0000" value={form.submitterPhone} onChange={(e) => update('submitterPhone', e.target.value)} />
                </div>
              </div>
            )}

            <div className="mt-5">
              <label className={labelClass}>Your relationship to the accused (optional)</label>
              <select className={inputClass} value={form.submitterRelationship} onChange={(e) => update('submitterRelationship', e.target.value)}>
                <option value="">Select (optional)</option>
                {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={back} className="flex-1 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
              <button
                onClick={submit}
                disabled={submitting}
                className="flex-2 flex-1 rounded-xl bg-[#c41e3a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#a8192f] disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirmation' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h2>
            <p className="text-gray-600 mb-8">
              Thank you for coming forward. Your report has been securely received and will be reviewed by our investigators.
            </p>

            <div className="rounded-xl border-2 border-gray-900 bg-white p-6 mb-8">
              <div className="text-sm text-gray-500 mb-1">Your reference number</div>
              <div className="font-mono text-xl font-bold text-gray-900 tracking-wider">{referenceNumber}</div>
              <div className="text-xs text-gray-400 mt-2">Save this number to track your report status</div>
            </div>

            <div className="text-sm text-gray-500 space-y-2">
              <p>What happens next:</p>
              <ul className="space-y-1 text-left">
                <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span>Report encrypted and assigned to review queue</li>
                <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span>Investigator review within 5 business days</li>
                {!form.isAnonymous && form.submitterEmail && (
                  <li className="flex gap-2"><span className="text-green-600 font-bold">✓</span>Follow-up via {form.submitterEmail} if more information needed</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
