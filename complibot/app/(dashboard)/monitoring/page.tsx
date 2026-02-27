const integrations = [
  {
    name: 'AWS', icon: '☁️', connected: true, last_scan: '10 min ago', findings: 3, critical: 1,
    checks: [
      { name: 'S3 Public Access Blocks', status: 'pass' },
      { name: 'CloudTrail Logging', status: 'pass' },
      { name: 'Root Account MFA', status: 'fail' },
      { name: 'VPC Flow Logs', status: 'pass' },
      { name: 'GuardDuty Enabled', status: 'partial' },
    ],
  },
  {
    name: 'GitHub', icon: '🐙', connected: true, last_scan: '2 hours ago', findings: 1, critical: 0,
    checks: [
      { name: 'Branch Protection on main', status: 'pass' },
      { name: 'Required Reviews (≥2)', status: 'partial' },
      { name: 'Secrets Scanning', status: 'pass' },
      { name: 'Dependabot Alerts', status: 'pass' },
    ],
  },
  {
    name: 'Okta', icon: '🔑', connected: true, last_scan: '30 min ago', findings: 2, critical: 1,
    checks: [
      { name: 'MFA Policy Enforced', status: 'fail' },
      { name: 'Password Policy Strength', status: 'pass' },
      { name: 'Inactive User Review', status: 'partial' },
      { name: 'Admin Role Assignments', status: 'pass' },
    ],
  },
  {
    name: 'GCP', icon: '🌤️', connected: false, last_scan: null, findings: 0, critical: 0,
    checks: [],
  },
  {
    name: 'Jira', icon: '🔷', connected: false, last_scan: null, findings: 0, critical: 0,
    checks: [],
  },
  {
    name: 'Datadog', icon: '📊', connected: false, last_scan: null, findings: 0, critical: 0,
    checks: [],
  },
];

const statusColors = { pass: '#059669', fail: '#DC2626', partial: '#D97706' };
const statusBg = { pass: 'rgba(5,150,105,0.08)', fail: 'rgba(220,38,38,0.06)', partial: 'rgba(217,119,6,0.08)' };

export default function MonitoringPage() {
  const connected = integrations.filter(i => i.connected);
  const totalFindings = connected.reduce((a, i) => a + i.findings, 0);
  const criticalFindings = connected.reduce((a, i) => a + i.critical, 0);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Infrastructure Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Continuous compliance scanning across your tech stack.</p>
        </div>
        <button style={{ padding: '10px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Scan All Now
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Connected Integrations', value: connected.length, color: 'var(--color-trust-600)' },
          { label: 'Total Findings', value: totalFindings, color: '#D97706' },
          { label: 'Critical Issues', value: criticalFindings, color: '#DC2626' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 36, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Integrations grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {integrations.map(integ => (
          <div key={integ.name} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden', opacity: integ.connected ? 1 : 0.7 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 26 }}>{integ.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{integ.name}</div>
                {integ.connected && integ.last_scan && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last scan: {integ.last_scan}</div>
                )}
              </div>
              <div style={{ flexShrink: 0 }}>
                {integ.connected ? (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '3px 10px', borderRadius: 8 }}>Connected</span>
                ) : (
                  <button style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>Connect</button>
                )}
              </div>
            </div>

            {integ.connected && integ.checks.length > 0 && (
              <div style={{ padding: '10px 14px 14px' }}>
                {integ.findings > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {integ.critical > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', background: 'rgba(220,38,38,0.08)', padding: '3px 9px', borderRadius: 8 }}>{integ.critical} critical</span>
                    )}
                    {integ.findings - integ.critical > 0 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#D97706', background: 'rgba(217,119,6,0.08)', padding: '3px 9px', borderRadius: 8 }}>{integ.findings - integ.critical} other</span>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {integ.checks.map(check => (
                    <div key={check.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, background: statusBg[check.status as keyof typeof statusBg] || 'var(--bg-page)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[check.status as keyof typeof statusColors] || '#9CA3AF', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{check.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[check.status as keyof typeof statusColors] || '#9CA3AF', textTransform: 'capitalize' }}>{check.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!integ.connected && (
              <div style={{ padding: '16px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Connect to enable automated evidence collection and compliance scanning.</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
