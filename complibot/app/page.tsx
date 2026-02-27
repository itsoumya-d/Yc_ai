import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes scan { from { transform:scaleX(0); } to { transform:scaleX(1); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
    .hero-h1 { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.1s; }
    .hero-sub { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.25s; }
    .hero-cta { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.4s; }
    .shimmer-text {
      background:linear-gradient(90deg,#1D4ED8 0%,#60A5FA 35%,#1D4ED8 65%,#1E3A8A 100%);
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation:shimmer 3s linear infinite;
    }
    .feature-card { transition:all 0.25s ease; }
    .feature-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(37,99,235,0.12); }
    .nav-link { transition:color 0.15s; }
    .nav-link:hover { color:#2563EB; }
    .check-row:hover { background:#EFF6FF; }
    .check-row { transition:background 0.15s; }
    .float-panel { animation:float 6s ease-in-out infinite; }
    .progress-bar { animation:scan 2s ease forwards; transform-origin:left; }
  `;

  const frameworks = ['SOC 2 Type II', 'GDPR', 'HIPAA', 'ISO 27001', 'PCI DSS', 'CCPA'];
  const controls = [
    { id: 'CC6.1', name: 'Logical Access Controls', status: 'pass', score: 98 },
    { id: 'CC7.1', name: 'System Monitoring', status: 'pass', score: 94 },
    { id: 'CC8.1', name: 'Change Management', status: 'warn', score: 71 },
    { id: 'CC9.1', name: 'Risk Assessment', status: 'fail', score: 42 },
    { id: 'A1.1', name: 'Availability Monitoring', status: 'pass', score: 100 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#F8FAFC', color: '#0F172A', minHeight: '100vh' }}>

        {/* Nav */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#1D4ED8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
              </div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>CompliBot</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {['Features', 'Frameworks', 'Pricing'].map((item) => (
                <a key={item} href="#" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#64748B', textDecoration: 'none' }}>{item}</a>
              ))}
              <Link href="/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#64748B', textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{ background: '#1D4ED8', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start free audit →
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
              {frameworks.map((f) => (
                <span key={f} style={{ fontSize: 11, fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: 100, padding: '3px 10px' }}>{f}</span>
              ))}
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
              Your AI compliance<br /><span className="shimmer-text">officer never sleeps</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              CompliBot scans your infrastructure, generates policies, collects evidence, and monitors compliance — so you can get SOC 2, GDPR, or HIPAA certified 10× faster.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/signup" style={{ background: '#1D4ED8', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Run free audit →
              </Link>
              <a href="#" style={{ color: '#64748B', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>See demo ↓</a>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: '#94A3B8' }}>Free audit · No code required · SOC 2 in 8 weeks</p>
          </div>

          {/* Compliance dashboard preview */}
          <div className="float-panel" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E2E8F0', boxShadow: '0 24px 64px rgba(29,78,216,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', background: '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>SOC 2 Type II · Progress</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Acme Tech, Inc.</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: "'Sora', sans-serif" }}>78%</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>compliant</div>
              </div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {controls.map((c) => (
                <div key={c.id} className="check-row" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.status === 'pass' ? '#22C55E' : c.status === 'warn' ? '#F59E0B' : '#DC2626', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{c.name}</span>
                      <span style={{ fontSize: 11, fontFamily: "'Sora', sans-serif", fontWeight: 700, color: c.status === 'pass' ? '#22C55E' : c.status === 'warn' ? '#F59E0B' : '#DC2626' }}>{c.score}%</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 2 }}>{c.id}</div>
                    <div style={{ marginTop: 6, height: 3, background: '#F1F5F9', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${c.score}%`, height: '100%', background: c.status === 'pass' ? '#22C55E' : c.status === 'warn' ? '#F59E0B' : '#DC2626', borderRadius: 2 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>🤖 AI generated 3 remediation recommendations · <span style={{ color: '#1D4ED8', fontWeight: 600 }}>View →</span></div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ background: '#0F172A', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: 16 }}>
                From 6 months to 6 weeks
              </h2>
              <p style={{ fontSize: 17, color: '#64748B', maxWidth: 460, margin: '0 auto' }}>Everything your compliance team needs, automated.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { icon: '🔍', title: 'Infrastructure Scanning', desc: 'Connect AWS, GCP, GitHub in 5 minutes. CompliBot scans 200+ controls automatically.', accent: '#60A5FA' },
                { icon: '📋', title: 'Gap Analysis', desc: 'AI identifies your compliance gaps and prioritizes remediation by risk level.', accent: '#34D399' },
                { icon: '📝', title: 'Policy Generation', desc: 'Generate SOC 2, GDPR, and HIPAA policies customized to your exact tech stack.', accent: '#FCD34D' },
                { icon: '📊', title: 'Evidence Collection', desc: 'Automatically collect and organize evidence from 30+ integrations.', accent: '#F472B6' },
                { icon: '👁️', title: 'Continuous Monitoring', desc: 'Real-time alerts when compliance drifts. Stay audit-ready 365 days a year.', accent: '#A78BFA' },
                { icon: '🏛️', title: 'Audit Room', desc: 'Secure portal for auditors with filtered access to evidence packages.', accent: '#67E8F9' },
              ].map((f) => (
                <div key={f.title} className="feature-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '28px', cursor: 'default' }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 700, color: '#F8FAFC', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 12 }}>
              60% cheaper than competitors
            </h2>
            <p style={{ fontSize: 16, color: '#64748B' }}>Drata starts at $50K/yr. We start at free.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Startup', price: '$299', period: '/month', desc: '1 framework, 1-50 employees', features: ['1 compliance framework', 'Infrastructure scanning', 'Policy generation', 'Evidence collection', 'Basic audit room'], cta: 'Start free trial', highlight: false },
              { name: 'Growth', price: '$665', period: '/month', desc: '2 frameworks, 50-200 employees', features: ['2 compliance frameworks', 'Advanced gap analysis', 'Continuous monitoring', 'Slack + Jira integration', 'Priority support', 'Custom policies'], cta: 'Start free trial', highlight: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'Unlimited frameworks', features: ['All frameworks', 'Unlimited users', 'SAML/SSO', 'On-premise option', 'Dedicated CSM', 'Custom integrations'], cta: 'Contact sales', highlight: false },
            ].map((plan) => (
              <div key={plan.name} style={{ background: plan.highlight ? '#1D4ED8' : '#fff', borderRadius: 16, border: plan.highlight ? '2px solid #1D4ED8' : '1px solid #E2E8F0', padding: '32px 24px', position: 'relative', boxShadow: plan.highlight ? '0 16px 48px rgba(29,78,216,0.25)' : 'none' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#1E3A8A', color: '#BFDBFE', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#64748B', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Sora', sans-serif", fontSize: plan.price === 'Custom' ? 28 : 40, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#0F172A' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>{plan.period}</span>}
                </div>
                <div style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#64748B', marginBottom: 28 }}>{plan.desc}</div>
                <div style={{ marginBottom: 28 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill={plan.highlight ? 'rgba(255,255,255,0.15)' : '#EFF6FF'} /><path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? '#fff' : '#1D4ED8'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : '#1D4ED8', color: plan.highlight ? '#1D4ED8' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#1D4ED8', padding: '80px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, lineHeight: 1.2 }}>
              Stop losing deals to missing compliance
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', marginBottom: 36 }}>70% of startups lose enterprise deals because they lack SOC 2. Get certified in 6 weeks.</p>
            <Link href="/signup" style={{ background: '#fff', color: '#1D4ED8', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              Run free compliance audit →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0F172A', padding: '32px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, background: '#1D4ED8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>
              </div>
              <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#F8FAFC' }}>CompliBot</span>
            </div>
            <div style={{ fontSize: 12, color: '#334155' }}>© 2025 CompliBot · AI Compliance Automation</div>
          </div>
        </footer>
      </div>
    </>
  );
}
