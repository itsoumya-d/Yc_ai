import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes float { 0%,100% { transform:translateY(0) rotate(-1deg); } 50% { transform:translateY(-8px) rotate(-1deg); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    .hero-h1 { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.1s; }
    .hero-sub { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.25s; }
    .hero-cta { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.4s; }
    .shimmer-text {
      background:linear-gradient(90deg,#16A34A 0%,#4ADE80 35%,#16A34A 65%,#14532D 100%);
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation:shimmer 3s linear infinite;
    }
    .feature-card { transition:all 0.25s ease; }
    .feature-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(22,163,74,0.12); }
    .nav-link { transition:color 0.15s; }
    .nav-link:hover { color:#16A34A; }
    .btn-primary { transition:all 0.2s ease; background:#16A34A; }
    .btn-primary:hover { background:#15803D; transform:translateY(-1px); box-shadow:0 8px 20px rgba(22,163,74,0.3); }
    .feed-card { transition:all 0.2s; }
    .feed-card:hover { border-color:#86EFAC; }
    .float-panel { animation:float 6s ease-in-out infinite; }
  `;

  const feedItems = [
    { type: 'group-buy', icon: '🛒', title: 'Group Buy: Solar Panels', desc: '12 households joined · Save 34% off retail · Closes in 3 days', votes: null, badge: 'GROUP BUY', badgeColor: '#16A34A' },
    { type: 'vote', icon: '🗳️', title: 'Vote: New Community Garden', desc: 'Should we convert the empty lot on Oak St into a community garden?', votes: '67%', badge: 'OPEN VOTE', badgeColor: '#2563EB' },
    { type: 'share', icon: '🔧', title: 'Shared: Lawn Aerator', desc: 'Available this weekend · 3 slots left · Book via app', votes: null, badge: 'RESOURCE', badgeColor: '#CA8A04' },
    { type: 'alert', icon: '⚠️', title: 'Safety Alert: Package Theft', desc: 'AI summarized: 3 reports of porch theft on Maple St this week', votes: null, badge: 'AI ALERT', badgeColor: '#DC2626' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#FAFAF9', color: '#1C1917', minHeight: '100vh' }}>

        {/* Nav */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,249,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E7E5E4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: '#16A34A', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏘️</div>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>NeighborDAO</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {['Features', 'How it Works', 'Pricing'].map((item) => (
                <a key={item} href="#" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#78716C', textDecoration: 'none' }}>{item}</a>
              ))}
              <Link href="/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#78716C', textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ color: '#fff', padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Join your neighborhood →
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
              <span style={{ fontSize: 14 }}>🌱</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#16A34A' }}>AI-powered neighborhood coordination</span>
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
              Your neighborhood,<br /><span className="shimmer-text">actually organized</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 18, color: '#78716C', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Group buying power. Shared resources. Democratic decisions. AI-mediated disputes. Everything your neighborhood needs in one place — not scattered across 5 Facebook groups.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-primary" style={{ color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start your neighborhood →
              </Link>
              <a href="#" style={{ color: '#78716C', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>See a demo ↓</a>
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: '#A8A29E' }}>Free for households · HOA plans available</p>
          </div>

          {/* Community feed preview */}
          <div className="float-panel" style={{ background: '#fff', borderRadius: 20, border: '1px solid #E7E5E4', overflow: 'hidden', boxShadow: '0 24px 64px rgba(22,163,74,0.1)' }}>
            <div style={{ background: '#16A34A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Maplewood Heights</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Community Feed</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 100, padding: '4px 12px', fontSize: 12, color: '#fff', fontWeight: 600 }}>247 households</div>
            </div>
            <div style={{ maxHeight: 340, overflow: 'hidden' }}>
              {feedItems.map((item, i) => (
                <div key={item.title} className="feed-card" style={{ padding: '16px 20px', borderBottom: i < 3 ? '1px solid #F5F5F4' : 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', items: 'flex-start', gap: 12 }}>
                    <div style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{item.title}</div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${item.badgeColor}15`, color: item.badgeColor, whiteSpace: 'nowrap', marginLeft: 8 }}>{item.badge}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#78716C', lineHeight: 1.5 }}>{item.desc}</div>
                      {item.votes && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ height: 6, background: '#F0FDF4', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ width: item.votes, height: '100%', background: '#16A34A', borderRadius: 3 }} />
                          </div>
                          <div style={{ fontSize: 11, color: '#16A34A', marginTop: 4, fontWeight: 600 }}>{item.votes} in favor</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: '#fff', borderTop: '1px solid #E7E5E4', borderBottom: '1px solid #E7E5E4' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '34%', label: 'Avg savings on group purchases' },
              { value: '8,200+', label: 'Active neighborhoods' },
              { value: '2.4M', label: 'Households coordinating' },
              { value: '91%', label: 'Disputes resolved by AI' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#16A34A', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#78716C' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#1C1917', marginBottom: 16 }}>
              Everything your neighborhood needs
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              { icon: '🛒', title: 'Group Purchasing', desc: 'Pool orders for solar panels, internet, food delivery, and services. Split costs automatically and save 20-40% off retail.', accent: '#16A34A', bg: '#F0FDF4' },
              { icon: '🗳️', title: 'Democratic Voting', desc: 'Ranked-choice voting for community decisions. Budget proposals, policy votes, leadership elections — all transparent.', accent: '#2563EB', bg: '#EFF6FF' },
              { icon: '🔧', title: 'Resource Sharing', desc: 'Schedule shared tools, parking spots, and equipment with a built-in booking calendar and damage deposit system.', accent: '#CA8A04', bg: '#FEFCE8' },
              { icon: '🤝', title: 'AI Dispute Mediator', desc: 'Property line, noise, parking disputes resolved by AI trained on community guidelines before they escalate.', accent: '#7C3AED', bg: '#F5F3FF' },
              { icon: '💰', title: 'Neighborhood Treasury', desc: 'Transparent community fund with expense tracking, budget voting, and automatic split for shared infrastructure costs.', accent: '#0891B2', bg: '#F0F9FF' },
              { icon: '📣', title: 'Community Feed', desc: 'AI-summarized neighborhood news, safety alerts, events, and announcements. Replace 5 Facebook groups with one smart feed.', accent: '#DC2626', bg: '#FEF2F2' },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid #E7E5E4', padding: '28px', cursor: 'default' }}>
                <div style={{ width: 48, height: 48, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 17, fontWeight: 800, color: '#1C1917', marginBottom: 10, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#78716C', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ background: '#F0FDF4', padding: '96px 24px', borderTop: '1px solid #BBF7D0' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#1C1917', marginBottom: 12 }}>Simple, fair pricing</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
              {[
                { name: 'Household', price: '$0', period: 'forever', features: ['Community feed access', 'Events & RSVP', 'Directory listing', 'Basic voting'], cta: 'Join free', highlight: false },
                { name: 'Pro Household', price: '$4.99', period: '/month', features: ['Everything free', 'Group purchasing', 'Resource booking', 'AI dispute mediation', 'Community treasury access'], cta: 'Start trial', highlight: true },
                { name: 'HOA / Community', price: '$199', period: '/month', features: ['Everything Pro', 'HOA management tools', 'Official records', 'Compliance tracking', 'Unlimited households', 'Priority support'], cta: 'Contact us', highlight: false },
              ].map((plan) => (
                <div key={plan.name} style={{ background: plan.highlight ? '#16A34A' : '#fff', borderRadius: 16, border: plan.highlight ? '2px solid #16A34A' : '1px solid #E7E5E4', padding: '32px 24px', boxShadow: plan.highlight ? '0 16px 48px rgba(22,163,74,0.25)' : 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#78716C', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 28 }}>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#1C1917' }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#A8A29E' }}>{plan.period}</span>
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill={plan.highlight ? 'rgba(255,255,255,0.15)' : '#F0FDF4'} /><path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? '#fff' : '#16A34A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : '#16A34A', color: plan.highlight ? '#16A34A' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#16A34A', padding: '80px 24px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🏘️</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, lineHeight: 1.15 }}>
              Ready to organize your neighborhood?
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36 }}>
              Join 8,200+ neighborhoods already saving money and time together.
            </p>
            <Link href="/signup" style={{ background: '#fff', color: '#16A34A', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block' }}>
              Start your neighborhood →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#1C1917', padding: '48px 24px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>🏘️</span>
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 16, color: '#F5F5F4' }}>NeighborDAO</span>
            </div>
            <div style={{ fontSize: 13, color: '#57534E' }}>© 2025 NeighborDAO · Connecting 2.4M households</div>
          </div>
        </footer>
      </div>
    </>
  );
}
