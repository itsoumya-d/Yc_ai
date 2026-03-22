'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CheckCircle2, Users } from 'lucide-react';

const ROLES = [
  { id: 'adjuster', label: 'Claims Adjuster', desc: 'Review and process claims' },
  { id: 'manager', label: 'Claims Manager', desc: 'Oversee team and approvals' },
  { id: 'analyst', label: 'Fraud Analyst', desc: 'Detect and investigate fraud' },
  { id: 'attorney', label: 'Legal Counsel', desc: 'Handle disputes and litigation' },
];

const TEAM_SIZES = ['Just me', '2–5', '6–20', '21–50', '50+'];

export default function OnboardingStep5Page() {
  const router = useRouter();
  const [teamSize, setTeamSize] = useState('2–5');
  const [inviteEmails, setInviteEmails] = useState('');
  const [defaultRole, setDefaultRole] = useState('adjuster');
  const [requireApproval, setRequireApproval] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/onboarding/complete');
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface p-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">Step 5 of 5 — Final step!</p>
      <h1 className="legal-heading text-lg text-text-primary">Team setup</h1>
      <p className="mt-1 text-sm text-text-secondary mb-6">Configure access and invite your team</p>

      <div className="space-y-5">
        {/* Team size */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Team Size
          </label>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map(size => (
              <button
                key={size}
                onClick={() => setTeamSize(size)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  teamSize === size
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-default text-text-secondary hover:border-primary/40'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Default role */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Default Invitee Role
          </label>
          <div className="space-y-2">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => setDefaultRole(role.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  defaultRole === role.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border-default hover:border-primary/30'
                }`}
              >
                <Users
                  className={`h-4 w-4 flex-shrink-0 ${
                    defaultRole === role.id ? 'text-primary' : 'text-text-tertiary'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${defaultRole === role.id ? 'text-primary' : 'text-text-primary'}`}>
                    {role.label}
                  </p>
                  <p className="text-xs text-text-tertiary">{role.desc}</p>
                </div>
                {defaultRole === role.id && (
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Invite emails */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Invite Team Members <span className="font-normal normal-case text-text-tertiary">(optional)</span>
          </label>
          <textarea
            value={inviteEmails}
            onChange={e => setInviteEmails(e.target.value)}
            placeholder="Enter email addresses separated by commas&#10;e.g. john@firm.com, sarah@firm.com"
            rows={3}
            className="w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none resize-none"
          />
        </div>

        {/* Require approval toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-border-default bg-bg-surface-raised">
          <div>
            <p className="text-sm font-medium text-text-primary">Require manager approval</p>
            <p className="text-xs text-text-tertiary">New claims need manager sign-off before processing</p>
          </div>
          <button
            onClick={() => setRequireApproval(!requireApproval)}
            className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
              requireApproval ? 'bg-primary' : 'bg-border-default'
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                requireApproval ? 'left-[22px]' : 'left-[2px]'
              }`}
            />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={() => router.push('/onboarding/step-4')}
            className="flex items-center gap-1 px-4 py-2.5 border border-border-default rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-surface-hover transition-colors"
          >
            <ChevronLeft size={15} /> Back
          </button>
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-text-on-color text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Launching…' : 'Launch ClaimForge'}
          </button>
        </div>
      </div>
    </div>
  );
}
