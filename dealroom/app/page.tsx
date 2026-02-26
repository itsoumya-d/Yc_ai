import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes pulse-deal { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-6px); } }
    .hero-h1 { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.1s; }
    .hero-sub { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.25s; }
    .hero-cta { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.4s; }
    .shimmer-text {
      background:linear-gradient(90deg,#EA580C 0%,#FB923C 35%,#EA580C 65%,#9A3412 100%);
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation:shimmer 3s linear infinite;
    }
    .feature-card { transition:all 0.25s ease; }
    .feature-card:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(234,88,12,0.1); }
    .nav-link { transition:color 0.15s; }
    .nav-link:hover { color:#EA580C; }
    .deal-row { transition:background 0.15s; cursor:pointer; }
    .deal-row:hover { background:#FFF7ED; }
    .float-card { animation:float 5s ease-in-out infinite; }
    .risk-dot { animation:pulse-deal 2s ease-in-out infinite; }
  `;

  const deals = [
    { company: 'Acme Corp', value: '$84K', score: 91, risk: 'low', stage: 'Proposal', days: 12 },
    { company: 'TechStart Inc', value: '$125K', score: 73, risk: 'medium', stage: 'Negotiation', days: 28 },
    { company: 'GlobalSoft Ltd', value: '$210K', score: 48, risk: 'high', stage: 'Discovery', days: 67 },
    { company: 'Nexus Systems', value: '$58K', score: 85, risk: 'low', stage: 'Demo', days: 6 },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#FAFAF9', color: '#1C1917', minHeight: '100vh' }}>

        {/* Nav */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E7E5E4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#EA580C,#F97316)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>DealRoom</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {['Features', 'Integrations', 'Pricing'].map((item) => (
                <a key={item} href="#" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#78716C', textDecoration: 'none' }}>{item}</a>
              ))}
              <Link href="/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#78716C', textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', color: '#fff', padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start free →
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ fontSize: 14 }}>⚡</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#EA580C' }}>AI-powered B2B sales intelligence</span>
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
              Know which deals<br />will close before<br /><span className="shimmer-text">your reps do</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 18, color: '#78716C', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              DealRoom scores every deal in real-time, detects at-risk opportunities before they go dark, and tells reps exactly what to do next to close.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link href="/signup" style={{ background: 'linear-gradient(135deg,#EA580C,#F97316)', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                See your pipeline →
              </Link>
              <a href="#" style={{ color: '#78716C', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>Watch demo ↓</a>
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: '#A8A29E' }}>Free 14-day trial · Connects to HubSpot & Salesforce in 5 min · No credit card</p>
          </div>

          {/* Deal pipeline preview */}
          <div className="float-card" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E5E4', boxShadow: '0 24px 64px rgba(234,88,12,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F5F5F4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: '#1C1917' }}>Pipeline Intelligence</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Hot', 'At Risk', 'On Track'].map((label, i) => (
                  <span key={label} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: i === 0 ? '#FEF2F2' : i === 1 ? '#FFFBEB' : '#F0FDF4', color: i === 0 ? '#DC2626' : i === 1 ? '#F59E0B' : '#22C55E' }}>{label}</span>
                ))}
              </div>
            </div>
            {deals.map((deal, i) => (
              <div key={deal.company} className="deal-row" style={{ padding: '14px 20px', borderBottom: i < 3 ? '1px solid #F5F5F4' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: deal.risk === 'high' ? '#FEF2F2' : deal.risk === 'medium' ? '#FFFBEB' : '#F0FDF4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 14, color: deal.risk === 'high' ? '#DC2626' : deal.risk === 'medium' ? '#F59E0B' : '#22C55E', flexShrink: 0 }}>
                    {deal.company[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{deal.company}</span>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 800, color: '#1C1917' }}>{deal.value}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div className={deal.risk === 'high' ? 'risk-dot' : undefined} style={{ width: 6, height: 6, borderRadius: '50%', background: deal.risk === 'high' ? '#DC2626' : deal.risk === 'medium' ? '#F59E0B' : '#22C55E' }} />
                        <span style={{ fontSize: 11, color: '#78716C' }}>{deal.stage} · {deal.days}d</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 800, color: deal.score >= 80 ? '#22C55E' : deal.score >= 60 ? '#F59E0B' : '#DC2626' }}>{deal.score}</span>
                        <span style={{ fontSize: 10, color: '#A8A29E' }}>score</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px 20px', background: '#FFFBEB', borderTop: '1px solid #FEF3C7' }}>
              <div style={{ fontSize: 12, color: '#92400E' }}>⚡ AI detected 2 at-risk deals · <span style={{ fontWeight: 700 }}>View recommendations →</span></div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ background: '#1C1917', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#F5F5F4', marginBottom: 16 }}>
                Win more deals with AI intelligence
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { icon: '📊', title: 'AI Deal Scoring', desc: 'Every deal scored 0-100 based on engagement signals, activity patterns, and historical win data. Know which deals need attention now.', accent: '#FB923C' },
                { icon: '🚨', title: 'Risk Detection', desc: 'Automatically flags stalled deals before they go dark. Get alerts when champion leaves, budget freezes, or competitor mentions spike.', accent: '#F472B6' },
                { icon: '⚡', title: 'Next Best Actions', desc: 'AI tells reps exactly what to do: send a case study, request a meeting, loop in an executive. No more guessing.', accent: '#34D399' },
                { icon: '✍️', title: 'Email & Agenda Generator', desc: 'Generate personalized follow-up emails and meeting agendas tailored to each deal\'s stage, industry, and pain points.', accent: '#60A5FA' },
                { icon: '📞', title: 'Call Intelligence', desc: 'Whisper transcription + sentiment analysis of every call. Detect competitor mentions, objections, and buying signals.', accent: '#A78BFA' },
                { icon: '🔄', title: 'CRM Auto-Update', desc: 'Auto-update Salesforce and HubSpot from emails, calls, and meetings. Reps spend 0 minutes on data entry.', accent: '#FCD34D' },
              ].map((f) => (
                <div key={f.title} className="feature-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '28px', cursor: 'default' }}>
                  <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#F5F5F4', marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: '#fff', borderTop: '1px solid #E7E5E4', borderBottom: '1px solid #E7E5E4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '31%', label: 'Average win rate increase' },
              { value: '2.8×', label: 'Pipeline visibility improvement' },
              { value: '84 days', label: 'Avg B2B sales cycle reduced' },
              { value: '4.1 hrs', label: 'Saved per rep per week' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 36, fontWeight: 900, letterSpacing: '-0.04em', color: '#EA580C', marginBottom: 6 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#78716C' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#1C1917', marginBottom: 12 }}>
              Half the price of Gong
            </h2>
            <p style={{ fontSize: 16, color: '#78716C' }}>Gong charges $100+/seat. We start at $49.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { name: 'Starter', price: '$49', period: '/seat/mo', desc: 'For small teams', features: ['Deal scoring', 'Risk alerts', 'Basic AI emails', 'HubSpot sync'], cta: 'Start trial', highlight: false },
              { name: 'Growth', price: '$79', period: '/seat/mo', desc: 'For scaling sales orgs', features: ['Everything Starter', 'Call transcription & AI', 'Next best actions', 'CRM auto-update', 'Salesforce sync', 'Forecast AI', 'Manager dashboards'], cta: 'Start trial', highlight: true },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large revenue teams', features: ['Everything Growth', 'Custom AI models', 'Zoom + Teams integration', 'SSO & SCIM', 'Revenue operations suite', 'Dedicated success'], cta: 'Talk to sales', highlight: false },
            ].map((plan) => (
              <div key={plan.name} style={{ background: plan.highlight ? 'linear-gradient(135deg,#EA580C,#C2410C)' : '#fff', borderRadius: 16, border: plan.highlight ? '2px solid #EA580C' : '1px solid #E7E5E4', padding: '32px 24px', position: 'relative', boxShadow: plan.highlight ? '0 16px 48px rgba(234,88,12,0.25)' : 'none' }}>
                {plan.highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#9A3412', color: '#FED7AA', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>}
                <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#78716C', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: plan.price === 'Custom' ? 28 : 40, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#1C1917' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#A8A29E' }}>{plan.period}</span>}
                </div>
                <div style={{ fontSize: 12, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#78716C', marginBottom: 28 }}>{plan.desc}</div>
                <div style={{ marginBottom: 28 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill={plan.highlight ? 'rgba(255,255,255,0.15)' : '#FFF7ED'} /><path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? '#fff' : '#EA580C'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : 'linear-gradient(135deg,#EA580C,#F97316)', color: plan.highlight ? '#EA580C' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg,#EA580C 0%,#C2410C 100%)', padding: '80px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, lineHeight: 1.15 }}>
              Stop flying blind on your pipeline
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36 }}>
              Know which deals will close, which are at risk, and what to do about both — before it's too late.
            </p>
            <Link href="/signup" style={{ background: '#fff', color: '#EA580C', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              Start free trial →
            </Link>
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>14-day trial · Connects to CRM in 5 min · No credit card</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#1C1917', padding: '32px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,#EA580C,#F97316)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#F5F5F4' }}>DealRoom</span>
            </div>
            <div style={{ fontSize: 12, color: '#44403C' }}>© 2025 DealRoom · AI Sales Intelligence · Half the price of Gong</div>
          </div>
        </footer>
      </div>
    </>
  );
}
