'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';
import {
  Settings,
  User,
  Building2,
  Shield,
  Bell,
  Key,
  Database,
  FileText,
  Palette,
  Wifi,
} from 'lucide-react';

const settingsNav = [
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'organization', icon: Building2, label: 'Organization' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'api', icon: Key, label: 'API Keys' },
  { id: 'carriers', icon: Wifi, label: 'Carriers', href: '/settings/carriers' },
  { id: 'data', icon: Database, label: 'Data & Storage' },
  { id: 'compliance', icon: FileText, label: 'Compliance' },
  { id: 'appearance', icon: Palette, label: 'Appearance' },
];

export default function SettingsPage() {
  const t = useTranslations('settings');
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <div className="flex h-full flex-col">
      <PageHeader title={t('title')} subtitle={t('description')} />

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Nav */}
        <div className="w-52 shrink-0 border-r border-border-default p-3">
          <nav className="space-y-0.5">
            {settingsNav.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if ('href' in item && item.href) {
                    router.push(item.href);
                  } else {
                    setActiveSection(item.id);
                  }
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  activeSection === item.id
                    ? 'bg-primary-muted text-primary-light'
                    : 'text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === 'profile' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="legal-heading text-base text-text-primary">Profile Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Full Name</label>
                  <input type="text" defaultValue="Sarah Chen" className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Email</label>
                  <input type="email" defaultValue="sarah.chen@claimforge.io" className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Role</label>
                  <div className="h-9 rounded-lg border border-border-default bg-bg-surface px-3 flex items-center text-sm text-text-tertiary">Administrator</div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Title</label>
                  <input type="text" defaultValue="Lead Investigator" className="h-9 w-full rounded-lg border border-border-default bg-bg-surface-raised px-3 text-sm text-text-primary focus:border-primary focus:outline-none" />
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="legal-heading text-base text-text-primary">Security Settings</h2>

              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Two-Factor Authentication</h3>
                <p className="text-xs text-text-secondary">Add an extra layer of security to your account with 2FA.</p>
                <button className="rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary-light transition-colors hover:bg-primary-muted">
                  Enable 2FA
                </button>
              </div>

              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Session Management</h3>
                <p className="text-xs text-text-secondary">Manage active sessions and force logout from other devices.</p>
                <div className="rounded-lg border border-border-muted p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-primary">Current Session</div>
                      <div className="text-[10px] text-text-tertiary">macOS - Chrome 122 - Last active now</div>
                    </div>
                    <span className="rounded-full bg-verified-green-muted px-2 py-0.5 text-[10px] font-medium text-verified-green">Active</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Audit Log</h3>
                <p className="text-xs text-text-secondary">All actions are logged for compliance and security review.</p>
                <div className="space-y-2">
                  {[
                    { action: 'Logged in', time: '2 hours ago' },
                    { action: 'Viewed case CF-2024-001', time: '2 hours ago' },
                    { action: 'Uploaded 3 documents', time: '3 hours ago' },
                    { action: 'Generated report', time: '5 hours ago' },
                    { action: 'Ran fraud analysis', time: '1 day ago' },
                  ].map((entry, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border-muted px-3 py-2">
                      <span className="text-xs text-text-secondary">{entry.action}</span>
                      <span className="text-[10px] text-text-tertiary">{entry.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="max-w-2xl space-y-6">
              <h2 className="legal-heading text-base text-text-primary">API Keys</h2>

              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">OpenAI API Key</h3>
                <p className="text-xs text-text-secondary">Used for document analysis, entity extraction, and fraud pattern detection.</p>
                <div className="flex items-center gap-2">
                  <input type="password" defaultValue="sk-proj-xxxxxxxxxxxx" className="h-9 flex-1 rounded-lg border border-border-default bg-bg-surface-raised px-3 font-mono text-sm text-text-primary focus:border-primary focus:outline-none" />
                  <button className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised">Show</button>
                  <button className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised">Test</button>
                </div>
              </div>

              <div className="rounded-xl border border-border-default bg-bg-surface p-5 space-y-4">
                <h3 className="text-sm font-medium text-text-primary">Google Cloud Vision</h3>
                <p className="text-xs text-text-secondary">Used for OCR processing of scanned documents and images.</p>
                <div className="flex items-center gap-2">
                  <input type="password" defaultValue="AIzaSyxxxxxxxxxx" className="h-9 flex-1 rounded-lg border border-border-default bg-bg-surface-raised px-3 font-mono text-sm text-text-primary focus:border-primary focus:outline-none" />
                  <button className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised">Show</button>
                  <button className="rounded-lg border border-border-default px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-bg-surface-raised">Test</button>
                </div>
              </div>

              <div className="rounded-lg border border-accent bg-accent-muted p-4">
                <div className="flex items-start gap-2">
                  <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <div>
                    <div className="text-xs font-medium text-text-primary">Security Notice</div>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      API keys are encrypted at rest and never logged. Keys are only accessible to organization administrators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection !== 'profile' && activeSection !== 'security' && activeSection !== 'api' && (
            <div className="max-w-2xl">
              <h2 className="legal-heading text-base text-text-primary">
                {settingsNav.find((s) => s.id === activeSection)?.label}
              </h2>
              <p className="mt-2 text-sm text-text-secondary">
                Settings for {settingsNav.find((s) => s.id === activeSection)?.label?.toLowerCase()} configuration.
                Connect backend to populate.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
