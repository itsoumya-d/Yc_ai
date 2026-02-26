'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    full_name: 'Alex Johnson',
    current_role: 'Senior Training Facilitator',
    location: 'Chicago, IL',
    target_career: 'UX Designer',
    years_experience: '8',
    bio: 'Facilitator transitioning into UX. Passionate about designing inclusive learning experiences.',
    linkedin: 'linkedin.com/in/alexjohnson',
  });
  const [notifications, setNotifications] = useState({
    new_match: true,
    learning_reminder: true,
    community_reply: false,
    weekly_digest: true,
    job_alerts: true,
    badge_earned: true,
  });

  function handleSave() {
    setSaving(true);
    setTimeout(() => { setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2500); }, 1200);
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Settings</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-subtle)', marginBottom: 32 }}>
        {[
          { key: 'profile', label: '👤 Profile' },
          { key: 'notifications', label: '🔔 Notifications' },
          { key: 'privacy', label: '🔒 Privacy' },
          { key: 'account', label: '⚙️ Account' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{ padding: '12px 20px', fontSize: 14, fontWeight: tab === t.key ? 700 : 400, color: tab === t.key ? 'var(--color-teal-600)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t.key ? '2px solid var(--color-teal-600)' : '2px solid transparent' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Avatar */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, flexShrink: 0 }}>
              AJ
            </div>
            <div>
              <button style={{ padding: '9px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', marginRight: 8 }}>Upload photo</button>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>JPG, PNG or GIF · Max 5MB</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Full Name', key: 'full_name', type: 'text' },
              { label: 'Current Role', key: 'current_role', type: 'text' },
              { label: 'Location', key: 'location', type: 'text' },
              { label: 'Years of Experience', key: 'years_experience', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                />
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Target Career</label>
            <select
              value={form.target_career}
              onChange={e => setForm(p => ({ ...p, target_career: e.target.value }))}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', background: '#fff' }}
            >
              {['UX Designer', 'Product Manager', 'Data Analyst', 'Content Designer', 'UX Researcher'].map(r => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', background: '#fff' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>LinkedIn URL</label>
            <input type="text" value={form.linkedin} onChange={e => setForm(p => ({ ...p, linkedin: e.target.value }))} style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: '11px 28px', borderRadius: 10, fontWeight: 700, fontSize: 15, background: saving ? '#9CA3AF' : 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {tab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { key: 'new_match', label: 'New career match found', desc: 'When AI finds a new compatible career for your profile' },
            { key: 'learning_reminder', label: 'Daily learning reminder', desc: 'Gentle nudge to keep your learning streak going' },
            { key: 'community_reply', label: 'Community replies', desc: 'When someone replies to your post or mentions you' },
            { key: 'weekly_digest', label: 'Weekly progress digest', desc: 'Summary of your progress every Monday morning' },
            { key: 'job_alerts', label: 'New job matches', desc: 'Jobs added to the board that match your target career' },
            { key: 'badge_earned', label: 'Badge earned', desc: 'Celebrate when you unlock a new achievement' },
          ].map((n, i, arr) => (
            <div key={n.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{n.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{n.desc}</div>
              </div>
              <button
                onClick={() => setNotifications(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: notifications[n.key as keyof typeof notifications] ? 'var(--color-teal-600)' : '#D1D5DB', transition: 'background 200ms', position: 'relative', flexShrink: 0 }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: notifications[n.key as keyof typeof notifications] ? 25 : 3, transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Privacy tab */}
      {tab === 'privacy' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Profile Visibility</h3>
            </div>
            <div style={{ padding: '12px 8px' }}>
              {[
                { value: 'community', label: 'SkillBridge community', desc: 'Visible to all logged-in members' },
                { value: 'mentors', label: 'Mentors only', desc: 'Only mentors can see your profile' },
                { value: 'private', label: 'Private', desc: 'Only you can see your profile' },
              ].map(opt => (
                <label key={opt.value} style={{ display: 'flex', gap: 14, padding: '12px 12px', borderRadius: 10, cursor: 'pointer', alignItems: 'flex-start' }}>
                  <input type="radio" name="visibility" defaultChecked={opt.value === 'community'} style={{ marginTop: 3 }} />
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Show my career goal to mentors', checked: true },
              { label: 'Allow community to see my skill progress', checked: false },
              { label: 'Include my profile in success stories', checked: true },
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{p.label}</span>
                <input type="checkbox" defaultChecked={p.checked} style={{ width: 18, height: 18 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account tab */}
      {tab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-subtle)', padding: '20px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Change Password</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                <div key={l}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>{l}</label>
                  <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 13px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-page)' }} />
                </div>
              ))}
              <button style={{ padding: '11px 24px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: 'pointer', width: 'fit-content' }}>Update Password</button>
            </div>
          </div>
          <div style={{ background: '#FFF1F2', borderRadius: 14, border: '1px solid #FECDD3', padding: '20px 24px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#DC2626' }}>Delete Account</h3>
            <p style={{ fontSize: 14, color: '#9F1239', marginBottom: 16 }}>This permanently deletes your profile, skills, and career history. This action cannot be undone.</p>
            <button style={{ padding: '9px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: '#DC2626', color: '#fff', border: 'none', cursor: 'pointer' }}>Delete my account</button>
          </div>
        </div>
      )}
    </div>
  );
}
