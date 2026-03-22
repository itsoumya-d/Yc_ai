'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, Bell } from 'lucide-react';

const ALERT_TYPES = [
  { id: 'claim_submitted', label: 'New claim submitted', desc: 'When a new claim is filed' },
  { id: 'claim_approved', label: 'Claim approved', desc: 'When a claim is approved' },
  { id: 'claim_denied', label: 'Claim denied / disputed', desc: 'When a claim is denied' },
  { id: 'document_missing', label: 'Missing documents', desc: 'When required docs are absent' },
  { id: 'deadline', label: 'Deadline reminders', desc: '48h before filing deadlines' },
  { id: 'settlement', label: 'Settlement updates', desc: 'When settlement terms change' },
];

const DELIVERY_METHODS = ['Email', 'In-app', 'SMS', 'Slack'];
const DIGEST_FREQUENCIES = ['Real-time', 'Hourly digest', 'Daily digest', 'Weekly summary'];

export default function OnboardingStep4Page() {
  const router = useRouter();
  const [enabledAlerts, setEnabledAlerts] = useState<Set<string>>(
    new Set(['claim_submitted', 'deadline'])
  );
  const [deliveryMethods, setDeliveryMethods] = useState<Set<string>>(new Set(['Email', 'In-app']));
  const [digestFrequency, setDigestFrequency] = useState('Real-time');
  const [loading, setLoading] = useState(false);

  function toggleAlert(id: string) {
    setEnabledAlerts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleDelivery(method: string) {
    setDeliveryMethods(prev => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });
  }

  async function handleNext() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    router.push('/onboarding/step-5');
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 4 of 5</p>
      <h1 className="legal-heading text-lg text-text-primary">Notification preferences</h1>
      <p className="mt-1 text-sm text-text-secondary mb-6">Choose how and when ClaimForge alerts you</p>

      <div className="space-y-5">
        {/* Alert types */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Alert Types
          </label>
          <div className="space-y-2">
            {ALERT_TYPES.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-bg-surface-raised"
              >
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">{alert.label}</p>
                    <p className="text-xs text-text-tertiary">{alert.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    enabledAlerts.has(alert.id) ? 'bg-primary' : 'bg-border-default'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                      enabledAlerts.has(alert.id) ? 'left-[22px]' : 'left-[2px]'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery methods */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Delivery Channels
          </label>
          <div className="flex flex-wrap gap-2">
            {DELIVERY_METHODS.map(m => (
              <button
                key={m}
                onClick={() => toggleDelivery(m)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  deliveryMethods.has(m)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-default text-text-secondary hover:border-primary/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Digest frequency */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Alert Frequency
          </label>
          <div className="grid grid-cols-2 gap-2">
            {DIGEST_FREQUENCIES.map(f => (
              <button
                key={f}
                onClick={() => setDigestFrequency(f)}
                className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                  digestFrequency === f
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-default text-text-secondary hover:border-primary/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => router.push('/onboarding/step-3')}
            className="flex items-center gap-1 px-4 py-2.5 border border-border-default rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-surface-hover transition-colors"
          >
            <ChevronLeft size={15} /> Back
          </button>
          <button
            onClick={handleNext}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-text-on-color text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue'}
            {!loading && <ArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
