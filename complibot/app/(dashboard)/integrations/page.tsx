const integrations = [
  { name: 'AWS', icon: '☁️', category: 'Cloud', connected: true, description: 'Scan S3, IAM, CloudTrail, GuardDuty and 40+ other services.', evidence_auto: true },
  { name: 'GitHub', icon: '🐙', category: 'Engineering', connected: true, description: 'Monitor branch protection, access, secrets scanning, Dependabot.', evidence_auto: true },
  { name: 'Okta', icon: '🔑', category: 'Identity', connected: true, description: 'MFA enforcement, user access reviews, admin role tracking.', evidence_auto: true },
  { name: 'Google Cloud', icon: '🌤️', category: 'Cloud', connected: false, description: 'GCP security posture, IAM bindings, Cloud Audit Logs.', evidence_auto: true },
  { name: 'Azure', icon: '🔷', category: 'Cloud', connected: false, description: 'Azure Defender, Entra ID, activity logs.', evidence_auto: true },
  { name: 'Datadog', icon: '📊', category: 'Monitoring', connected: false, description: 'Log management, anomaly detection, uptime monitoring.', evidence_auto: true },
  { name: 'Slack', icon: '💬', category: 'Communication', connected: false, description: 'Send compliance alerts and task notifications to Slack channels.', evidence_auto: false },
  { name: 'Jira', icon: '🔷', category: 'Engineering', connected: false, description: 'Sync compliance tasks as Jira tickets. Two-way status updates.', evidence_auto: false },
  { name: 'Google Workspace', icon: '📧', category: 'Identity', connected: false, description: 'User provisioning, MFA status, admin accounts audit.', evidence_auto: true },
  { name: 'Snowflake', icon: '❄️', category: 'Data', connected: false, description: 'Data access logs, row-level security, masking policies.', evidence_auto: true },
  { name: 'Stripe', icon: '💳', category: 'Payments', connected: false, description: 'PCI DSS evidence collection, API key management.', evidence_auto: true },
  { name: 'Heroku', icon: '🟣', category: 'Cloud', connected: false, description: 'Dyno configuration, add-ons, deployment logs.', evidence_auto: false },
];

const categories = ['All', 'Cloud', 'Identity', 'Engineering', 'Monitoring', 'Data', 'Communication', 'Payments'];

export default function IntegrationsPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Integrations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Connect your tech stack for automated evidence collection and continuous monitoring.</p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: c === 'All' ? 600 : 400, border: '1.5px solid ' + (c === 'All' ? 'var(--color-trust-600)' : 'var(--border-default)'), background: c === 'All' ? 'var(--color-trust-600)' : '#fff', color: c === 'All' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      {/* Connected section */}
      <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
        Connected ({integrations.filter(i => i.connected).length})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14, marginBottom: 32 }}>
        {integrations.filter(i => i.connected).map(integ => (
          <div key={integ.name} style={{ background: '#fff', borderRadius: 14, border: '2px solid rgba(5,150,105,0.2)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{integ.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{integ.name}</div>
                <div style={{ fontSize: 11, color: '#059669', fontWeight: 600, background: 'rgba(5,150,105,0.08)', display: 'inline-block', padding: '2px 8px', borderRadius: 6, marginTop: 2 }}>✓ Connected</div>
              </div>
              {integ.evidence_auto && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', background: 'rgba(124,58,237,0.08)', padding: '2px 7px', borderRadius: 6 }}>AUTO</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{integ.description}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px', borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--color-trust-100)', color: 'var(--color-trust-700)', border: 'none', cursor: 'pointer' }}>
                Configure
              </button>
              <button style={{ padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: '#DC2626' }}>
                Disconnect
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Available section */}
      <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
        Available ({integrations.filter(i => !i.connected).length})
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {integrations.filter(i => !i.connected).map(integ => (
          <div key={integ.name} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-subtle)', padding: '18px 20px' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ fontSize: 28, opacity: 0.7 }}>{integ.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{integ.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{integ.category}</div>
              </div>
              {integ.evidence_auto && (
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '2px 7px', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>AUTO</span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>{integ.description}</p>
            <button style={{ width: '100%', padding: '9px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
