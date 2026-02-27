import Link from 'next/link';

const policies = [
  { id: 'p1', title: 'Information Security Policy', version: '3.1', status: 'active', last_reviewed: '2025-01-15', next_review: '2026-01-15', frameworks: ['SOC 2', 'ISO 27001'], owner: 'CISO', acknowledgments: 87, total_employees: 87, ai_generated: false },
  { id: 'p2', title: 'Access Control Policy', version: '2.4', status: 'under_review', last_reviewed: '2024-10-20', next_review: '2025-10-20', frameworks: ['SOC 2', 'ISO 27001'], owner: 'Security', acknowledgments: 82, total_employees: 87, ai_generated: false },
  { id: 'p3', title: 'Data Classification Policy', version: '1.2', status: 'active', last_reviewed: '2025-02-01', next_review: '2026-02-01', frameworks: ['GDPR', 'ISO 27001'], owner: 'Legal', acknowledgments: 87, total_employees: 87, ai_generated: true },
  { id: 'p4', title: 'Incident Response Plan', version: '2.0', status: 'active', last_reviewed: '2025-02-15', next_review: '2026-02-15', frameworks: ['SOC 2'], owner: 'Security', acknowledgments: 14, total_employees: 87, ai_generated: false },
  { id: 'p5', title: 'Acceptable Use Policy', version: '4.0', status: 'active', last_reviewed: '2025-01-10', next_review: '2026-01-10', frameworks: ['SOC 2', 'ISO 27001'], owner: 'HR', acknowledgments: 85, total_employees: 87, ai_generated: false },
  { id: 'p6', title: 'Business Continuity Plan', version: '1.0', status: 'draft', last_reviewed: null, next_review: null, frameworks: ['ISO 27001'], owner: 'Operations', acknowledgments: 0, total_employees: 87, ai_generated: true },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: 'Active', color: '#059669', bg: 'rgba(5,150,105,0.08)' },
  under_review: { label: 'Under Review', color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  draft: { label: 'Draft', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' },
  retired: { label: 'Retired', color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
};

export default function PoliciesPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Policy Library</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>All compliance policies, versions, and employee acknowledgments.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            🤖 Generate Policy
          </button>
          <button style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            + New Policy
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {policies.map(p => {
          const sc = statusConfig[p.status];
          const ackPct = Math.round((p.acknowledgments / p.total_employees) * 100);
          return (
            <div key={p.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-subtle)', padding: '18px 22px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{p.title}</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>v{p.version}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: sc.color, background: sc.bg, padding: '2px 9px', borderRadius: 8 }}>{sc.label}</span>
                    {p.ai_generated && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(124,58,237,0.08)', color: '#7C3AED', padding: '2px 7px', borderRadius: 6 }}>🤖 AI</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👤 {p.owner}</span>
                    {p.last_reviewed && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Reviewed: {new Date(p.last_reviewed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    {p.next_review && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Next: {new Date(p.next_review).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {p.frameworks.map(fw => (
                      <span key={fw} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'rgba(37,99,235,0.08)', color: 'var(--color-trust-700)', fontWeight: 600 }}>{fw}</span>
                    ))}
                  </div>
                </div>

                {/* Acknowledgment */}
                <div style={{ flexShrink: 0, minWidth: 160, textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Acknowledgments</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: ackPct === 100 ? '#059669' : ackPct < 80 ? '#DC2626' : '#D97706' }}>
                    {p.acknowledgments}/{p.total_employees}
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>({ackPct}%)</span>
                  </div>
                  <div style={{ background: 'var(--border-subtle)', borderRadius: 4, height: 5, overflow: 'hidden', marginTop: 4, marginBottom: 12 }}>
                    <div style={{ width: `${ackPct}%`, height: '100%', background: ackPct === 100 ? '#059669' : ackPct < 80 ? '#DC2626' : '#D97706', borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>Edit</button>
                    <button style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>Send for Review</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
