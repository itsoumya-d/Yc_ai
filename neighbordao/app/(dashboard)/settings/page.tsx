'use client';

import { useState } from 'react';
import { Save, Camera, Plus, X } from 'lucide-react';

type Tab = 'profile' | 'notifications' | 'privacy' | 'admin';

const NOTIFICATION_PREFS = [
  { key: 'new_posts',     label: 'New posts' },
  { key: 'safety_alerts', label: 'Safety alerts' },
  { key: 'events',        label: 'Event invites' },
  { key: 'orders',        label: 'Group order updates' },
  { key: 'voting',        label: 'Voting deadlines' },
  { key: 'resources',     label: 'Resource bookings' },
  { key: 'digest',        label: 'Weekly digest' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} onClick={onChange}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200"
      style={{ background: checked ? '#16A34A' : '#D6D3D1' }}
    >
      <span className="inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: `translateX(${checked ? '1.1rem' : '0.1rem'})` }} />
    </button>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState('Sarah Mitchell');
  const [displayName, setDisplayName] = useState('Sarah M.');
  const [bio, setBio] = useState('Love gardening and community events. Happy to share tips and tools.');
  const [skills, setSkills] = useState(['Gardening', 'Cooking', 'Event Planning']);
  const [newSkill, setNewSkill] = useState('');
  const [saved, setSaved] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState<Record<string, { app: boolean; email: boolean; sms: boolean }>>({
    new_posts:     { app: true,  email: true,  sms: false },
    safety_alerts: { app: true,  email: true,  sms: true  },
    events:        { app: true,  email: false, sms: false },
    orders:        { app: true,  email: true,  sms: false },
    voting:        { app: true,  email: false, sms: false },
    resources:     { app: true,  email: false, sms: false },
    digest:        { app: true,  email: true,  sms: false },
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'neighbors', showOnMap: true, showInDirectory: true, allowDm: true,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addSkill() {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
    }
    setNewSkill('');
  }

  const TABS: Array<{ key: Tab; label: string }> = [
    { key: 'profile', label: 'Profile' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'privacy', label: 'Privacy' },
    { key: 'admin', label: 'Admin' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-[#16A34A] text-[#16A34A]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PROFILE */}
      {tab === 'profile' && (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#16A34A] text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
                SM
              </div>
              <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white border shadow-sm hover:bg-[var(--bg-subtle)]" style={{ borderColor: 'var(--border)' }}>
                <Camera className="h-3.5 w-3.5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Profile photo</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>JPG, PNG up to 5MB</div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: 'var(--border)' }}>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Display Name</label>
              <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>This is what neighbors see (e.g. "Sarah M.")</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Bio</label>
              <textarea rows={3} value={bio} onChange={e => setBio(e.target.value)}
                className="w-full resize-none rounded-lg border px-3 py-2.5 text-base outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20"
                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 rounded-full bg-[#F0FDF4] pl-3 pr-2 py-1 text-sm font-medium text-[#15803D]">
                    {s}
                    <button onClick={() => setSkills(p => p.filter(sk => sk !== s))} className="hover:text-[#DC2626]">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                  placeholder="Add a skill..."
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[#16A34A]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
                <button onClick={addSkill} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-[var(--bg-subtle)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleSave}
            className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#15803D] active:scale-[0.97]">
            <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {tab === 'notifications' && (
        <div className="rounded-2xl border bg-white overflow-hidden shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-page)' }}>
            <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              <div className="col-span-1">Notification</div>
              <div className="text-center">In-App</div>
              <div className="text-center">Email</div>
              <div className="text-center">SMS</div>
            </div>
          </div>
          <div className="divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
            {NOTIFICATION_PREFS.map(pref => {
              const p = notifPrefs[pref.key] ?? { app: false, email: false, sms: false };
              return (
                <div key={pref.key} className="grid grid-cols-4 items-center px-4 py-3.5">
                  <span className="col-span-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{pref.label}</span>
                  <div className="flex justify-center">
                    <Toggle checked={p.app} onChange={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: { ...p, app: !p.app } }))} />
                  </div>
                  <div className="flex justify-center">
                    <Toggle checked={p.email} onChange={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: { ...p, email: !p.email } }))} />
                  </div>
                  <div className="flex justify-center">
                    <Toggle checked={p.sms} onChange={() => setNotifPrefs(prev => ({ ...prev, [pref.key]: { ...p, sms: !p.sms } }))} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRIVACY */}
      {tab === 'privacy' && (
        <div className="rounded-2xl border bg-white p-5 space-y-5" style={{ borderColor: 'var(--border)' }}>
          <div>
            <label className="mb-2 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profile Visibility</label>
            <div className="space-y-2">
              {[['neighbors', 'Neighbors only (recommended)'], ['public', 'Public'], ['private', 'Only me']].map(([val, lbl]) => (
                <label key={val} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all"
                  style={{ borderColor: privacy.profileVisibility === val ? '#16A34A' : 'var(--border)', background: privacy.profileVisibility === val ? '#F0FDF4' : undefined }}>
                  <input type="radio" name="visibility" value={val} checked={privacy.profileVisibility === val}
                    onChange={() => setPrivacy(p => ({ ...p, profileVisibility: val }))}
                    className="h-4 w-4 accent-[#16A34A]" />
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{lbl}</span>
                </label>
              ))}
            </div>
          </div>
          {[
            { key: 'showOnMap', label: 'Show my pin on neighborhood map' },
            { key: 'showInDirectory', label: 'Show me in the neighbor directory' },
            { key: 'allowDm', label: 'Allow direct messages from neighbors' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
              <Toggle checked={(privacy as Record<string, boolean>)[key]} onChange={() => setPrivacy(p => ({ ...p, [key]: !(p as Record<string, boolean>)[key] }))} />
            </div>
          ))}
          <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#15803D]">
            <Save className="h-4 w-4" /> {saved ? 'Saved!' : 'Save Privacy Settings'}
          </button>
        </div>
      )}

      {/* ADMIN */}
      {tab === 'admin' && (
        <div className="rounded-2xl border bg-white p-5 space-y-4" style={{ borderColor: 'var(--border)' }}>
          <div className="rounded-xl border border-[#CA8A04] bg-[#FEF9C3] p-3 text-sm" style={{ color: '#A16207' }}>
            You are an admin of Oak Hills Community. Admin features are visible only to you.
          </div>
          {[
            { label: 'Edit neighborhood name and description', btn: 'Edit' },
            { label: 'Manage member roles and permissions', btn: 'Manage' },
            { label: 'Export community data (CSV)', btn: 'Export' },
            { label: 'Archive neighborhood', btn: 'Archive', danger: true },
          ].map(({ label, btn, danger }) => (
            <div key={label} className="flex items-center justify-between py-2">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
              <button className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${danger ? 'border-[#FECACA] text-[#DC2626] hover:bg-[#FEF2F2]' : 'hover:bg-[var(--bg-subtle)]'}`}
                style={!danger ? { borderColor: 'var(--border)', color: 'var(--text-secondary)' } : undefined}>
                {btn}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
