import Link from 'next/link';

const gaps = [
  { id: 'cc6.1', control: 'CC6.1', title: 'Logical Access Controls', framework: 'SOC 2', severity: 'critical', category: 'Access', description: 'MFA not enforced on production systems. 3 admin accounts without MFA enabled.', assigned_to: 'John D.', due_date: '2025-03-15', days_overdue: 12, evidence_needed: ['MFA policy document', 'Screenshot of MFA configuration', 'User audit report'] },
  { id: 'a.9.4.2', control: 'A.9.4.2', title: 'Secure log-on procedures', framework: 'ISO 27001', severity: 'high', category: 'Access', description: 'Login page missing brute-force protection. No account lockout after failed attempts.', assigned_to: 'Sarah K.', due_date: '2025-03-20', days_overdue: 5, evidence_needed: ['Account lockout configuration', 'Security testing results'] },
  { id: 'a.12.3.1', control: 'A.12.3.1', title: 'Information backup', framework: 'ISO 27001', severity: 'high', category: 'Operations', description: 'Database backups are not tested regularly. Last restore test was 8 months ago.', assigned_to: 'DevOps', due_date: '2025-03-25', days_overdue: 0, evidence_needed: ['Backup restore test results', 'Backup schedule documentation'] },
  { id: 'cc7.3', control: 'CC7.3', title: 'Infrastructure Monitoring', framework: 'SOC 2', severity: 'high', category: 'Monitoring', description: 'No automated alerting for configuration drift on production infrastructure.', assigned_to: 'DevOps', due_date: '2025-04-01', days_overdue: 0, evidence_needed: ['Monitoring configuration', 'Alert policy document'] },
  { id: 'gdpr.6', control: 'Art.6', title: 'Lawfulness of Processing', framework: 'GDPR', severity: 'medium', category: 'Privacy', description: 'Data processing agreements with 2 sub-processors are expired.', assigned_to: 'Legal', due_date: '2025-04-10', days_overdue: 0, evidence_needed: ['Updated DPA documents', 'Sub-processor list'] },
  { id: 'cc1.3', control: 'CC1.3', title: 'Management Structure', framework: 'SOC 2', severity: 'medium', category: 'Governance', description: 'Organizational chart does not include reporting lines for security roles.', assigned_to: 'HR', due_date: '2025-04-15', days_overdue: 0, evidence_needed: ['Updated org chart'] },
  { id: 'gdpr.17', control: 'Art.17', title: 'Right to Erasure', framework: 'GDPR', severity: 'low', category: 'Privacy', description: 'Data deletion workflow is manual. No automated process for user data removal requests.', assigned_to: 'Engineering', due_date: '2025-05-01', days_overdue: 0, evidence_needed: ['Deletion process documentation'] },
];

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
const sorted = [...gaps].sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);

export default function GapAnalysisPage() {
  const criticalCount = gaps.filter(g => g.severity === 'critical').length;
  const highCount = gaps.filter(g => g.severity === 'high').length;
  const mediumCount = gaps.filter(g => g.severity === 'medium').length;
  const lowCount = gaps.filter(g => g.severity === 'low').length;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Gap Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Controls requiring remediation, sorted by severity and deadline.</p>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Critical', count: criticalCount, color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
          { label: 'High', count: highCount, color: '#EA580C', bg: 'rgba(234,88,12,0.06)' },
          { label: 'Medium', count: mediumCount, color: '#D97706', bg: 'rgba(217,119,6,0.06)' },
          { label: 'Low', count: lowCount, color: '#2563EB', bg: 'rgba(37,99,235,0.06)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '18px 20px', border: `1px solid ${s.color}30`, textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 36, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Gaps list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map(gap => (
          <div
            key={gap.id}
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid var(--border-subtle)',
              borderLeft: `4px solid ${gap.severity === 'critical' ? 'var(--severity-critical)' : gap.severity === 'high' ? 'var(--severity-high)' : gap.severity === 'medium' ? 'var(--severity-medium)' : 'var(--severity-low)'}`,
              padding: '18px 20px',
            }}
          >
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '2px 8px', borderRadius: 6 }}>
                    {gap.control}
                  </span>
                  <span className={`severity-${gap.severity}`} style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 8, textTransform: 'uppercase' }}>
                    {gap.severity}
                  </span>
                  <span style={{ fontSize: 11, background: 'rgba(37,99,235,0.08)', color: 'var(--color-trust-700)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                    {gap.framework}
                  </span>
                  {gap.days_overdue > 0 && (
                    <span style={{ fontSize: 11, background: 'rgba(220,38,38,0.1)', color: '#DC2626', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>
                      {gap.days_overdue}d overdue
                    </span>
                  )}
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{gap.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{gap.description}</p>

                {/* Evidence needed */}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Evidence needed</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {gap.evidence_needed.map(e => (
                      <span key={e} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'var(--bg-page)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}>{e}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 160 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Assigned: <strong style={{ color: 'var(--text-primary)' }}>{gap.assigned_to}</strong>
                </div>
                <div style={{ fontSize: 12, color: gap.days_overdue > 0 ? '#DC2626' : 'var(--text-muted)' }}>
                  Due: <strong>{new Date(gap.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
                  <Link href={`/evidence?control=${gap.id}`} style={{ padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, border: '1.5px solid var(--border-default)', background: '#fff', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    + Evidence
                  </Link>
                  <Link href={`/controls/${gap.id}`} style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--color-trust-600)', color: '#fff', textDecoration: 'none' }}>
                    Remediate →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
