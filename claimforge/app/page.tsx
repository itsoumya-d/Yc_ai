import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fraud-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(220,38,38,0); }
    }
    @keyframes scan-line {
      from { transform: translateY(-100%); }
      to { transform: translateY(400%); }
    }
    @keyframes shimmer-gold {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .hero-h1 { animation: fadeUp 0.7s ease forwards; opacity: 0; animation-delay: 0.1s; }
    .hero-p { animation: fadeUp 0.7s ease forwards; opacity: 0; animation-delay: 0.25s; }
    .hero-cta { animation: fadeUp 0.7s ease forwards; opacity: 0; animation-delay: 0.4s; }
    .fraud-dot { animation: fraud-pulse 2s ease-in-out infinite; }
    .scan-line-anim { animation: scan-line 3s linear infinite; }
    .gold-text {
      background: linear-gradient(90deg, #B45309 0%, #F59E0B 35%, #B45309 65%, #92400E 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer-gold 3s linear infinite;
    }
    .feature-card { transition: all 0.25s ease; }
    .feature-card:hover { transform: translateY(-3px); border-color: rgba(180,83,9,0.4) !important; }
    .nav-link { transition: color 0.15s; }
    .nav-link:hover { color: #F59E0B !important; }
    .stat-item:hover .stat-value { color: #F59E0B; }
    .stat-value { transition: color 0.2s; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0C0A09', color: '#E7E5E4', minHeight: '100vh' }}>

        {/* Nav */}
        <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <div className="fraud-dot" style={{ width: 32, height: 32, background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                </div>
              </div>
              <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 19, fontWeight: 700, color: '#F5F5F4', letterSpacing: '-0.02em' }}>ClaimForge</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {['Features', 'How it Works', 'Pricing', 'Security'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} className="nav-link" style={{ fontSize: 14, color: '#A8A29E', textDecoration: 'none', fontWeight: 500 }}>{item}</a>
              ))}
              <Link href="/login" className="nav-link" style={{ fontSize: 14, color: '#A8A29E', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
              <Link href="/signup" style={{ background: '#1E40AF', color: '#fff', padding: '8px 18px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Free Trial
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
              <div style={{ width: 6, height: 6, background: '#DC2626', borderRadius: '50%' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FCA5A5' }}>False Claims Act Intelligence Platform</span>
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Detect Fraud.<br />
              Build Evidence.<br />
              <span className="gold-text">Recover Millions.</span>
            </h1>
            <p className="hero-p" style={{ fontSize: 17, color: '#A8A29E', lineHeight: 1.75, marginBottom: 36, maxWidth: 440 }}>
              AI-powered investigation platform for False Claims Act cases. Analyze documents, map entity networks, and detect 8 fraud patterns with statistical confidence scoring.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/signup" style={{ background: '#1E40AF', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start Free Trial →
              </Link>
              <Link href="/login" style={{ background: 'rgba(255,255,255,0.05)', color: '#D6D3D1', padding: '14px 24px', borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: 'none', display: 'inline-block', border: '1px solid rgba(255,255,255,0.1)' }}>
                View Demo
              </Link>
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: '#78716C' }}>No credit card required · SOC 2 Type II compliant</p>
          </div>

          {/* Case dashboard preview */}
          <div style={{ background: '#1C1917', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative' }}>
            {/* Scan line effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
              <div className="scan-line-anim" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'linear-gradient(to bottom, transparent, rgba(30,64,175,0.04), transparent)', pointerEvents: 'none' }} />
            </div>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, background: '#DC2626', borderRadius: '50%' }} />
                <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 12, color: '#D6D3D1', fontWeight: 600 }}>CF-2024-001 · Medicare Overbilling</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#60A5FA', background: 'rgba(30,64,175,0.15)', padding: '2px 8px', borderRadius: 4 }}>Investigation</span>
              </div>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {[{ label: 'Est. Fraud', value: '$1.2M', color: '#DC2626' }, { label: 'Documents', value: '234' }, { label: 'Patterns', value: '8' }].map((s) => (
                <div key={s.label} style={{ background: '#292524', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#78716C', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color || '#F5F5F4', fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: 10, color: '#78716C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fraud Patterns Detected</div>
              {[
                { type: 'Upcoding', confidence: 'CRITICAL', amount: '$560K', pct: 90 },
                { type: 'Overbilling', confidence: 'HIGH', amount: '$340K', pct: 68 },
                { type: 'Duplicate Billing', confidence: 'HIGH', amount: '$180K', pct: 45 },
              ].map((p) => (
                <div key={p.type} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 12, color: '#D6D3D1' }}>{p.type}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: p.confidence === 'CRITICAL' ? 'rgba(220,38,38,0.15)' : 'rgba(234,88,12,0.15)', color: p.confidence === 'CRITICAL' ? '#FCA5A5' : '#FDBA74' }}>{p.confidence}</span>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#DC2626' }}>{p.amount}</span>
                  </div>
                  <div style={{ height: 4, background: '#292524', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: p.confidence === 'CRITICAL' ? '#DC2626' : '#EA580C', width: `${p.pct}%`, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
            {[
              { value: '$847M', label: 'Fraud detected to date' },
              { value: '8', label: 'Fraud pattern types' },
              { value: '99.2%', label: 'OCR accuracy rate' },
              { value: 'SOC 2', label: 'Type II compliant' },
            ].map((s) => (
              <div key={s.label} className="stat-item" style={{ textAlign: 'center', padding: '24px', cursor: 'default' }}>
                <div className="stat-value" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 700, color: '#F5F5F4', letterSpacing: '-0.03em', marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#78716C' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: 'rgba(30,64,175,0.15)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: 100, padding: '4px 16px', fontSize: 12, fontWeight: 600, color: '#60A5FA', marginBottom: 20 }}>
              Investigation Intelligence
            </div>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F4', marginBottom: 16 }}>
              Every tool an investigator needs
            </h2>
            <p style={{ fontSize: 16, color: '#A8A29E', maxWidth: 480, margin: '0 auto' }}>
              Built for False Claims Act investigators, qui tam attorneys, and government audit teams.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '⬡',
                accent: 'rgba(30,64,175,0.15)',
                iconColor: '#60A5FA',
                borderColor: 'rgba(30,64,175,0.2)',
                title: 'AI Document Analysis',
                desc: 'Ingest invoices, contracts, and payment records with OCR. GPT-4o extracts entities, amounts, dates, and relationships automatically from any document type.',
              },
              {
                icon: '◈',
                accent: 'rgba(220,38,38,0.1)',
                iconColor: '#FCA5A5',
                borderColor: 'rgba(220,38,38,0.2)',
                title: 'Fraud Pattern Detection',
                desc: 'Automatically detect 8 fraud types: overbilling, upcoding, duplicate billing, phantom vendors, unbundling, quality substitution, round-number billing, and time anomalies.',
              },
              {
                icon: '✦',
                accent: 'rgba(180,83,9,0.12)',
                iconColor: '#F59E0B',
                borderColor: 'rgba(180,83,9,0.2)',
                title: 'Entity Network Mapping',
                desc: 'Visualize connections between people, organizations, payments, and contracts in an interactive network graph. Uncover hidden shell company relationships and payment flows.',
              },
              {
                icon: '▣',
                accent: 'rgba(5,150,105,0.1)',
                iconColor: '#34D399',
                borderColor: 'rgba(5,150,105,0.2)',
                title: "Benford's Law Analysis",
                desc: 'Apply statistical digit-frequency analysis to detect doctored numbers in submitted claims. Visualize deviations with chi-square significance testing.',
              },
              {
                icon: '◎',
                accent: 'rgba(124,58,237,0.12)',
                iconColor: '#A78BFA',
                borderColor: 'rgba(124,58,237,0.2)',
                title: 'Evidence Timeline Builder',
                desc: 'Construct chronological evidence chains linking documents, payments, and communications. Export court-ready evidence packages with citation tracking.',
              },
              {
                icon: '❋',
                accent: 'rgba(8,145,178,0.12)',
                iconColor: '#67E8F9',
                borderColor: 'rgba(8,145,178,0.2)',
                title: 'Attorney-Client Security',
                desc: 'End-to-end encryption, per-case access controls, comprehensive audit trails, and role-based permissions for multi-org investigative teams.',
              },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ background: '#1C1917', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)', padding: '28px', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, background: f.accent, border: `1px solid ${f.borderColor}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: f.iconColor, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, fontWeight: 700, color: '#F5F5F4', marginBottom: 10, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ background: '#1C1917', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F4', marginBottom: 16 }}>
                From documents to court-ready evidence
              </h2>
              <p style={{ fontSize: 16, color: '#78716C', maxWidth: 480, margin: '0 auto' }}>
                A structured investigation workflow built for legal precision.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { step: '01', title: 'Upload Documents', desc: 'Upload invoices, contracts, and records. OCR processes everything automatically.', accent: '#1E40AF' },
                { step: '02', title: 'AI Analysis', desc: 'GPT-4o extracts entities, detects patterns, and scores fraud confidence.', accent: '#B45309' },
                { step: '03', title: 'Build Evidence Chain', desc: 'Link documents, payments, and communications into a timeline.', accent: '#7C3AED' },
                { step: '04', title: 'Export Report', desc: 'Generate a court-ready evidence package with full citation tracking.', accent: '#065F46' },
              ].map((step, i) => (
                <div key={step.step} style={{ position: 'relative' }}>
                  {i < 3 && (
                    <div style={{ position: 'absolute', top: 20, right: -8, zIndex: 1 }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 8h8M9 5l3 3-3 3" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div style={{ background: '#292524', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: step.accent, opacity: 0.3, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 12 }}>{step.step}</div>
                    <div style={{ width: 32, height: 3, background: step.accent, borderRadius: 2, marginBottom: 16 }} />
                    <h3 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 14, fontWeight: 700, color: '#F5F5F4', marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ fontSize: 12, color: '#78716C', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ maxWidth: 1000, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F4', marginBottom: 12 }}>
              Straightforward pricing
            </h2>
            <p style={{ fontSize: 16, color: '#78716C' }}>Scale with your caseload. Pause anytime.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                name: 'Investigator',
                price: '$0',
                period: 'forever',
                desc: 'For solo investigators getting started',
                features: ['3 active cases', '50 documents/month', 'AI pattern detection', 'PDF export', '1 user'],
                cta: 'Get started free',
                highlight: false,
              },
              {
                name: 'Team',
                price: '$199',
                period: '/month',
                desc: 'For investigative teams & law firms',
                features: ['Unlimited cases', 'Unlimited documents', 'Full AI analysis suite', 'Entity network mapping', "Benford's Law analysis", 'Evidence packages', 'Up to 10 users'],
                cta: 'Start trial',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: '',
                desc: 'For government agencies & large firms',
                features: ['Everything in Team', 'Unlimited users', 'On-premise deployment', 'FedRAMP compliance', 'Custom integrations', 'Dedicated CSM'],
                cta: 'Contact us',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} style={{ background: plan.highlight ? '#1E3A8A' : '#1C1917', borderRadius: 16, border: plan.highlight ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(255,255,255,0.07)', padding: '32px 28px', position: 'relative' }}>
                {plan.highlight && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#1E40AF', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 14px', borderRadius: 100, whiteSpace: 'nowrap', border: '1px solid rgba(96,165,250,0.3)' }}>
                    Most popular
                  </div>
                )}
                <div style={{ fontSize: 12, fontWeight: 700, color: plan.highlight ? '#93C5FD' : '#78716C', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: plan.price === 'Custom' ? 28 : 40, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#F5F5F4', fontFamily: "'JetBrains Mono', monospace" }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#78716C' }}>{plan.period}</span>}
                </div>
                <div style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#78716C', marginBottom: 28 }}>{plan.desc}</div>
                <div style={{ marginBottom: 28 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6.5" fill={plan.highlight ? 'rgba(255,255,255,0.1)' : 'rgba(30,64,175,0.15)'} />
                        <path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? '#fff' : '#60A5FA'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.85)' : '#A8A29E' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : '#1E40AF', color: plan.highlight ? '#1E3A8A' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'rgba(30,64,175,0.08)', borderTop: '1px solid rgba(30,64,175,0.2)', borderBottom: '1px solid rgba(30,64,175,0.2)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, letterSpacing: '-0.03em', color: '#F5F5F4', marginBottom: 20, lineHeight: 1.2 }}>
              Stop leaving fraud undetected
            </h2>
            <p style={{ fontSize: 17, color: '#A8A29E', marginBottom: 36, lineHeight: 1.6 }}>
              Every day without ClaimForge is another day of potential fraud going undetected. Start your investigation today.
            </p>
            <Link href="/signup" style={{ background: '#1E40AF', color: '#fff', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              Start Free Trial →
            </Link>
            <p style={{ marginTop: 16, fontSize: 12, color: '#57534E' }}>No credit card · SOC 2 compliant · Cancel anytime</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 24, height: 24, background: 'rgba(30,64,175,0.2)', border: '1px solid rgba(30,64,175,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                    </svg>
                  </div>
                  <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: 16, color: '#E7E5E4' }}>ClaimForge</span>
                </div>
                <p style={{ fontSize: 13, color: '#57534E', lineHeight: 1.7, maxWidth: 260 }}>
                  AI-powered False Claims Act investigation platform for investigators, attorneys, and government agencies.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Security', 'API'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Legal', links: ['Privacy', 'Terms', 'SOC 2', 'HIPAA'] },
              ].map((col) => (
                <div key={col.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#57534E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{col.heading}</div>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="nav-link" style={{ display: 'block', fontSize: 13, color: '#78716C', textDecoration: 'none', marginBottom: 10 }}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#44403C' }}>© 2025 ClaimForge. All rights reserved.</div>
              <div style={{ fontSize: 12, color: '#44403C' }}>SOC 2 Type II · HIPAA Ready · FedRAMP In Progress</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
