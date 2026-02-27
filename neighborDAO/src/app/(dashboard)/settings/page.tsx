'use client';

import { useState } from 'react';
import { Save, Bell, Shield, Globe, Users, Percent, Clock } from 'lucide-react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <h2 className="font-semibold text-text-primary">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {hint && <p className="text-xs text-text-tertiary mt-0.5">{hint}</p>}
      </div>
      <div className="w-56 shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-border'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    daoName: 'Maple Grove DAO',
    description: 'A democratic governance platform for the Maple Grove community',
    quorum: 30,
    passingThreshold: 51,
    votingDuration: 7,
    allowPublicProposals: true,
    requireApproval: false,
    emailNotifications: true,
    proposalAlerts: true,
    votingReminders: true,
    resultsNotifications: true,
    isPublic: true,
    joinRequiresApproval: false,
  });

  const update = (k: string, v: any) => setSettings((s) => ({ ...s, [k]: v }));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your DAO configuration</p>
      </div>

      <Section title="DAO Information">
        <Field label="DAO Name" hint="The public name of your community">
          <input type="text" value={settings.daoName} onChange={(e) => update('daoName', e.target.value)} className="input w-full" />
        </Field>
        <Field label="Description" hint="Short description for onboarding">
          <textarea rows={3} value={settings.description} onChange={(e) => update('description', e.target.value)} className="input w-full resize-none" />
        </Field>
        <Field label="Public DAO" hint="Allow anyone to view proposals">
          <Toggle checked={settings.isPublic} onChange={(v) => update('isPublic', v)} />
        </Field>
        <Field label="Open Membership" hint="Anyone can join without approval">
          <Toggle checked={!settings.joinRequiresApproval} onChange={(v) => update('joinRequiresApproval', !v)} />
        </Field>
      </Section>

      <Section title="Governance Rules">
        <Field label="Quorum Required" hint="Minimum % of members who must vote">
          <div className="flex items-center gap-2">
            <input type="range" min={10} max={100} step={5} value={settings.quorum} onChange={(e) => update('quorum', +e.target.value)} className="flex-1" />
            <span className="text-sm font-semibold text-text-primary w-10 text-right">{settings.quorum}%</span>
          </div>
        </Field>
        <Field label="Passing Threshold" hint="% of votes needed to pass">
          <div className="flex items-center gap-2">
            <input type="range" min={50} max={100} step={1} value={settings.passingThreshold} onChange={(e) => update('passingThreshold', +e.target.value)} className="flex-1" />
            <span className="text-sm font-semibold text-text-primary w-10 text-right">{settings.passingThreshold}%</span>
          </div>
        </Field>
        <Field label="Voting Duration" hint="Default days proposals are open">
          <select value={settings.votingDuration} onChange={(e) => update('votingDuration', +e.target.value)} className="input w-full">
            {[1, 3, 5, 7, 14, 30].map((d) => (
              <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>
            ))}
          </select>
        </Field>
        <Field label="Public Proposals" hint="Allow all members to create proposals">
          <Toggle checked={settings.allowPublicProposals} onChange={(v) => update('allowPublicProposals', v)} />
        </Field>
        <Field label="Admin Approval" hint="Require admin approval before voting">
          <Toggle checked={settings.requireApproval} onChange={(v) => update('requireApproval', v)} />
        </Field>
      </Section>

      <Section title="Notifications">
        <Field label="Email Notifications" hint="Receive updates via email">
          <Toggle checked={settings.emailNotifications} onChange={(v) => update('emailNotifications', v)} />
        </Field>
        <Field label="New Proposal Alerts" hint="Alert when new proposals are created">
          <Toggle checked={settings.proposalAlerts} onChange={(v) => update('proposalAlerts', v)} />
        </Field>
        <Field label="Voting Reminders" hint="Reminder before votes close">
          <Toggle checked={settings.votingReminders} onChange={(v) => update('votingReminders', v)} />
        </Field>
        <Field label="Results Notifications" hint="Alert when voting results are finalized">
          <Toggle checked={settings.resultsNotifications} onChange={(v) => update('resultsNotifications', v)} />
        </Field>
      </Section>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition ${
            saved ? 'bg-green-600' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          <Save className="h-4 w-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
