import Link from 'next/link';

const frameworks = [
  { slug: 'soc2', name: 'SOC 2 Type II', score: 82, controls: 116, failing: 8, color: '#7C3AED', icon: '🔐', deadline: '2025-09-30', description: 'Security, availability, and confidentiality for SaaS.' },
  { slug: 'iso27001', name: 'ISO 27001', score: 71, controls: 93, failing: 18, color: '#0369A1', icon: '🌐', deadline: '2025-12-15', description: 'International information security management standard.' },
  { slug: 'hipaa', name: 'HIPAA', score: 88, controls: 42, failing: 5, color: '#0F766E', icon: '🏥', deadline: null, description: 'US healthcare data privacy and security requirements.' },
  { slug: 'gdpr', name: 'GDPR', score: 64, controls: 38, failing: 10, color: '#1D4ED8', icon: '🇪🇺', deadline: '2025-11-01', description: 'EU data protection and privacy regulation.' },
  { slug: 'pci-dss', name: 'PCI DSS 4.0', score: 0, controls: 264, failing: 0, color: '#EA580C', icon: '💳', deadline: null, description: 'Payment card industry data security standard.' },
];

export default function FrameworksPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Compliance Frameworks</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Manage your compliance across all active and available frameworks.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {frameworks.map(fw => (
          <div key={fw.slug} style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ height: 4, background: fw.score > 0 ? fw.color : 'var(--border-default)' }} />
            <div style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{fw.icon}</span>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{fw.name}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{fw.description}</p>
                </div>
                {fw.score > 0 && (
                  <div style={{ fontWeight: 800, fontSize: 28, color: fw.score >= 80 ? '#059669' : fw.score >= 60 ? '#D97706' : '#DC2626', flexShrink: 0, lineHeight: 1 }}>
                    {fw.score}%
                  </div>
                )}
                {fw.score === 0 && (
                  <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'var(--border-subtle)', color: 'var(--text-muted)', fontWeight: 600 }}>Not Started</span>
                )}
              </div>

              {fw.score > 0 && (
                <>
                  <div style={{ background: 'var(--border-subtle)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{ width: `${fw.score}%`, height: '100%', background: fw.color, borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>{fw.controls} controls total</span>
                    <span style={{ color: '#DC2626', fontWeight: 600 }}>{fw.failing} failing</span>
                  </div>
                </>
              )}

              {fw.deadline && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
                  📅 Audit: {new Date(fw.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}

              {fw.score > 0 ? (
                <Link href={`/frameworks/${fw.slug}`} style={{ display: 'block', padding: '10px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-trust-100)', color: 'var(--color-trust-700)', textDecoration: 'none', textAlign: 'center' }}>
                  View Controls →
                </Link>
              ) : (
                <button style={{ width: '100%', padding: '10px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                  Start Onboarding
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
