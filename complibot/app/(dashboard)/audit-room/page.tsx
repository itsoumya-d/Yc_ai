import Link from 'next/link';

const auditPackage = {
  framework: 'SOC 2 Type II',
  period: 'Oct 1, 2024 — Sep 30, 2025',
  auditor: 'Deloitte & Touche LLP',
  score: 82,
  controls_tested: 116,
  exceptions: 8,
  last_updated: '2025-03-11',
};

const sections = [
  { title: 'System Description', desc: 'Overview of services, infrastructure, and controls', items: 1, status: 'complete' },
  { title: 'Control Objectives', desc: 'All 116 SOC 2 controls with testing evidence', items: 116, status: 'complete' },
  { title: 'Policies & Procedures', desc: '6 approved policies', items: 6, status: 'complete' },
  { title: 'Evidence Artifacts', desc: 'Screenshots, exports, and test results', items: 47, status: 'complete' },
  { title: 'Management Assertions', desc: 'Signed assertions from management team', items: 3, status: 'pending' },
  { title: 'Exceptions & Remediations', desc: '8 exceptions with remediation plans', items: 8, status: 'in_progress' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  complete: { label: '✓ Complete', color: '#059669' },
  pending: { label: '○ Pending', color: '#D97706' },
  in_progress: { label: '● In Progress', color: 'var(--color-trust-600)' },
};

export default function AuditRoomPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Audit Room</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Read-only workspace for your auditors. Share this package with your audit firm.</p>
      </div>

      {/* Audit package summary */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-trust-600), #1D4ED8)', borderRadius: 18, padding: '28px 32px', marginBottom: 28, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>AUDIT PACKAGE</div>
            <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 4 }}>{auditPackage.framework}</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginBottom: 12 }}>
              Period: {auditPackage.period}<br />
              Auditor: {auditPackage.auditor}
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{auditPackage.score}%</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Compliance Score</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{auditPackage.controls_tested}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Controls Tested</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 28, lineHeight: 1 }}>{auditPackage.exceptions}</div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Exceptions</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            <button style={{ padding: '11px 20px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: '#fff', color: 'var(--color-trust-700)', border: 'none', cursor: 'pointer' }}>
              📦 Export Full Package (.zip)
            </button>
            <button style={{ padding: '11px 20px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              🔗 Share Auditor Link
            </button>
          </div>
        </div>
      </div>

      {/* Package sections */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 17 }}>Audit Package Contents</h2>
        </div>
        <div>
          {sections.map((s, i) => {
            const sc = statusConfig[s.status];
            return (
              <div key={s.title} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: i < sections.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.desc}</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0 }}>
                  {s.items} {s.items === 1 ? 'item' : 'items'}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, color: sc.color, flexShrink: 0, minWidth: 100, textAlign: 'right' }}>
                  {sc.label}
                </div>
                <button style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  View
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Auditor access */}
      <div style={{ background: 'rgba(37,99,235,0.04)', borderRadius: 16, border: '1px solid rgba(37,99,235,0.15)', padding: '20px 24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--color-trust-700)' }}>🔒 Auditor Access</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
          Generate a read-only link for your audit firm. Auditors can view controls, evidence, and policies without edit access.
          The link expires after 90 days or when you revoke it.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--border-default)', background: '#fff', fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: 200 }}>
            https://app.complibot.io/audit/soc2-2025-a8f3d...
          </div>
          <button style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            Regenerate Link
          </button>
          <button style={{ padding: '10px 18px', borderRadius: 9, fontWeight: 600, fontSize: 13, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
