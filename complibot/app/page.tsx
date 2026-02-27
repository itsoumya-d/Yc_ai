import Link from 'next/link';

const frameworks = ['SOC 2', 'ISO 27001', 'HIPAA', 'GDPR', 'PCI DSS', 'NIST CSF'];
const features = [
  { icon: '🤖', title: 'AI-Powered Gap Analysis', desc: 'Connect your stack and CompliBot automatically maps findings to controls across every framework.' },
  { icon: '📡', title: 'Continuous Monitoring', desc: 'Real-time scanning of AWS, GitHub, Okta, and 20+ integrations. Catch drift before auditors do.' },
  { icon: '🗄️', title: 'Evidence Vault', desc: 'Auto-collect screenshots, exports, and logs. Manual uploads organized by control.' },
  { icon: '📄', title: 'Policy Generator', desc: 'AI drafts SOC 2-ready policies in minutes. Includes acknowledgment tracking.' },
  { icon: '🔒', title: 'Auditor Portal', desc: 'Shareable read-only room for your audit firm. Export a full audit package in one click.' },
  { icon: '📊', title: 'Live Compliance Score', desc: 'Single percentage across all frameworks. Executive dashboards for your board.' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#fff', color: '#0F172A', minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{ borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <nav style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-trust-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</div>
            <span style={{ fontWeight: 800, fontSize: 20 }}>CompliBot</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/login" style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 500, fontSize: 14, color: '#475569', textDecoration: 'none' }}>Sign in</Link>
            <a href="mailto:sales@complibot.io" style={{ padding: '9px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-trust-600)', color: '#fff', textDecoration: 'none' }}>Book a Demo</a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 72px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28 }}>
          {frameworks.map(fw => (
            <span key={fw} style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' }}>{fw}</span>
          ))}
        </div>
        <h1 style={{ fontWeight: 800, fontSize: 'clamp(36px, 5vw, 60px)', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.02em' }}>
          Compliance, on autopilot.<br />
          <span style={{ color: 'var(--color-trust-600)' }}>Audit-ready in weeks, not months.</span>
        </h1>
        <p style={{ fontSize: 19, color: '#475569', maxWidth: 540, margin: '0 auto 36px', lineHeight: 1.6 }}>
          CompliBot connects your cloud infrastructure, auto-collects evidence, generates policies, and keeps your compliance score green — continuously.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="mailto:sales@complibot.io" style={{ padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, background: 'var(--color-trust-600)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.30)' }}>
            Start Free Trial
          </a>
          <Link href="/dashboard" style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '2px solid #E2E8F0', color: '#0F172A', textDecoration: 'none' }}>
            View Demo
          </Link>
        </div>
        <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 14 }}>14-day free trial · No credit card · Setup in 30 minutes</p>
      </section>

      {/* Features */}
      <section style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0', padding: '72px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontWeight: 800, fontSize: 36, marginBottom: 12 }}>Everything for compliance. Nothing you don&apos;t need.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--bg-sidebar)', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontWeight: 800, fontSize: 36, color: '#fff', marginBottom: 16 }}>Ready to pass your next audit?</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Join 500+ startups that got SOC 2 certified in under 60 days with CompliBot.
        </p>
        <a href="mailto:sales@complibot.io" style={{ display: 'inline-block', padding: '15px 36px', borderRadius: 12, fontWeight: 700, fontSize: 17, background: 'var(--color-trust-600)', color: '#fff', textDecoration: 'none' }}>
          Get Audit-Ready →
        </a>
      </section>

      <footer style={{ background: '#020617', color: '#64748B', padding: '32px 24px', textAlign: 'center', fontSize: 13 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>CompliBot</span>
        <span style={{ margin: '0 12px' }}>·</span>
        Automated compliance for modern startups
        <span style={{ margin: '0 12px' }}>·</span>
        © 2025
      </footer>
    </div>
  );
}
