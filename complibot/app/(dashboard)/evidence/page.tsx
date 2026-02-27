'use client';

import { useState } from 'react';

const evidence = [
  { id: '1', name: 'MFA Policy v2.pdf', control: 'CC6.1', framework: 'SOC 2', uploaded_by: 'John D.', uploaded_at: '2025-03-01', freshness: 'fresh', auto: false, size: '142 KB', type: 'pdf' },
  { id: '2', name: 'AWS Security Config Export.json', control: 'CC7.1', framework: 'SOC 2', uploaded_by: 'CompliBot', uploaded_at: '2025-03-10', freshness: 'fresh', auto: true, size: '38 KB', type: 'json' },
  { id: '3', name: 'User Access Review Q1.xlsx', control: 'CC6.3', framework: 'SOC 2', uploaded_by: 'Sarah K.', uploaded_at: '2024-12-15', freshness: 'stale', auto: false, size: '215 KB', type: 'xlsx' },
  { id: '4', name: 'Penetration Test Report 2024.pdf', control: 'CC7.1', framework: 'SOC 2', uploaded_by: 'Security', uploaded_at: '2024-09-20', freshness: 'expired', auto: false, size: '2.1 MB', type: 'pdf' },
  { id: '5', name: 'GitHub Access Log Export.csv', control: 'A.9.4.1', framework: 'ISO 27001', uploaded_by: 'CompliBot', uploaded_at: '2025-03-08', freshness: 'fresh', auto: true, size: '67 KB', type: 'csv' },
  { id: '6', name: 'Backup Restore Test Results.pdf', control: 'A.12.3.1', framework: 'ISO 27001', uploaded_by: 'DevOps', uploaded_at: '2024-07-10', freshness: 'expired', auto: false, size: '890 KB', type: 'pdf' },
  { id: '7', name: 'Okta MFA Report.pdf', control: 'CC6.1', framework: 'SOC 2', uploaded_by: 'CompliBot', uploaded_at: '2025-03-11', freshness: 'fresh', auto: true, size: '52 KB', type: 'pdf' },
];

const freshnessConfig = {
  fresh: { label: 'Fresh', color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)' },
  stale: { label: 'Stale', color: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.2)' },
  expired: { label: 'Expired', color: '#DC2626', bg: 'rgba(220,38,38,0.06)', border: 'rgba(220,38,38,0.2)' },
};

const typeIcons: Record<string, string> = { pdf: '📄', json: '{ }', xlsx: '📊', csv: '📋' };

export default function EvidencePage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = evidence.filter(e => {
    if (filter === 'Auto-collected') return e.auto;
    if (filter === 'Manual') return !e.auto;
    if (filter === 'Expired') return e.freshness === 'expired';
    if (filter === 'Stale') return e.freshness === 'stale';
    return true;
  }).filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.control.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Evidence Vault</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Documents, exports, and screenshots supporting your controls.</p>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          + Upload Evidence
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Fresh', count: evidence.filter(e => e.freshness === 'fresh').length, ...freshnessConfig.fresh },
          { label: 'Stale (>90 days)', count: evidence.filter(e => e.freshness === 'stale').length, ...freshnessConfig.stale },
          { label: 'Expired (>180 days)', count: evidence.filter(e => e.freshness === 'expired').length, ...freshnessConfig.expired },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: '16px 20px', border: `1px solid ${s.border}`, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 32, color: s.color }}>{s.count}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>evidence items</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search evidence…"
          style={{ padding: '9px 14px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, outline: 'none', background: '#fff', minWidth: 220 }}
        />
        {['All', 'Auto-collected', 'Manual', 'Expired', 'Stale'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, border: '1.5px solid ' + (filter === f ? 'var(--color-trust-600)' : 'var(--border-default)'), background: filter === f ? 'var(--color-trust-600)' : '#fff', color: filter === f ? '#fff' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Evidence table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 100px 120px 80px 80px', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <span>File</span>
          <span>Control</span>
          <span>Framework</span>
          <span>Source</span>
          <span>Uploaded</span>
          <span>Freshness</span>
          <span></span>
        </div>
        {filtered.map((ev, i) => {
          const fc = freshnessConfig[ev.freshness as keyof typeof freshnessConfig];
          return (
            <div key={ev.id} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 120px 100px 120px 80px 80px', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcons[ev.type] ?? '📁'}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ev.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.size} · {ev.uploaded_by}</div>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{ev.control}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ev.framework}</span>
              <span style={{ fontSize: 12 }}>
                {ev.auto ? (
                  <span style={{ color: 'var(--color-shield-600)', fontWeight: 600, fontSize: 11 }}>🤖 Auto</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>👤 Manual</span>
                )}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(ev.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: fc.color, background: fc.bg, border: `1px solid ${fc.border}`, padding: '3px 8px', borderRadius: 8, display: 'inline-block' }}>
                {fc.label}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '5px 10px', borderRadius: 6, fontSize: 12, border: '1px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>View</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
