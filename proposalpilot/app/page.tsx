import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    @keyframes float-card {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-8px) rotate(-2deg); }
    }
    @keyframes float-card2 {
      0%, 100% { transform: translateY(0) rotate(1.5deg); }
      50% { transform: translateY(-6px) rotate(1.5deg); }
    }
    .hero-heading {
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.1s;
      opacity: 0;
    }
    .hero-sub {
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.25s;
      opacity: 0;
    }
    .hero-cta {
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.4s;
      opacity: 0;
    }
    .hero-badge {
      animation: fadeUp 0.7s ease forwards;
      animation-delay: 0.55s;
      opacity: 0;
    }
    .card-float-1 {
      animation: float-card 5s ease-in-out infinite;
      animation-delay: 0s;
    }
    .card-float-2 {
      animation: float-card2 6s ease-in-out infinite;
      animation-delay: 1s;
    }
    .shimmer-text {
      background: linear-gradient(90deg, #2563eb 0%, #60a5fa 30%, #2563eb 60%, #1d4ed8 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: shimmer 3s linear infinite;
    }
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(37,99,235,0.12);
    }
    .feature-card {
      transition: all 0.25s ease;
    }
    .btn-primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 8px 20px rgba(37,99,235,0.35);
    }
    .btn-primary {
      transition: all 0.2s ease;
    }
    .btn-outline:hover {
      background: #eff6ff;
      border-color: #2563eb;
      color: #2563eb;
    }
    .btn-outline {
      transition: all 0.2s ease;
    }
    .stat-card:hover {
      border-color: #bfdbfe;
      background: #eff6ff;
    }
    .stat-card {
      transition: all 0.2s ease;
    }
    .pricing-card:hover {
      transform: translateY(-2px);
    }
    .pricing-card {
      transition: all 0.25s ease;
    }
    .step-line {
      background: linear-gradient(to bottom, #2563eb, #bfdbfe);
    }
    .dot-pulse {
      animation: pulse-dot 2s ease-in-out infinite;
    }
    .nav-link:hover { color: #2563eb; }
    .nav-link { transition: color 0.15s; }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#f8fafc', color: '#0f172a', minHeight: '100vh' }}>

        {/* Nav */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(248,250,252,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: '#2563eb', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#0f172a' }}>ProposalPilot</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <a href="#features" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Features</a>
              <a href="#how-it-works" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Pricing</a>
              <Link href="/login" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }} className="nav-link">Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                Start free
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '4px 14px', marginBottom: 24 }}>
              <span className="dot-pulse" style={{ width: 7, height: 7, background: '#2563eb', borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#2563eb' }}>2,400+ agencies winning with ProposalPilot</span>
            </div>
            <h1 className="hero-heading" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 24 }}>
              Close deals faster with{' '}
              <span className="shimmer-text">AI-crafted proposals</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 18, color: '#475569', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              Stop spending hours writing proposals from scratch. ProposalPilot generates professional, personalized proposals in minutes — so you can focus on what you do best.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-primary" style={{ background: '#2563eb', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start for free →
              </Link>
              <Link href="/login" className="btn-outline" style={{ background: '#fff', color: '#374151', padding: '14px 24px', borderRadius: 10, fontSize: 16, fontWeight: 600, textDecoration: 'none', display: 'inline-block', border: '1.5px solid #e2e8f0' }}>
                Sign in
              </Link>
            </div>
            <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>No credit card required · Free plan forever</p>
          </div>

          {/* Proposal preview mockup */}
          <div style={{ position: 'relative', height: 460 }}>
            {/* Background card */}
            <div className="card-float-2" style={{ position: 'absolute', top: 40, right: 0, width: 340, background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 10, height: 10, background: '#22c55e', borderRadius: '50%' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#22c55e' }}>Proposal Won — $24,000</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>E-commerce Redesign</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>TechCorp Inc. · Q1 2025</div>
              <div style={{ marginTop: 12, height: 6, background: '#eff6ff', borderRadius: 3 }}>
                <div style={{ width: '100%', height: '100%', background: '#2563eb', borderRadius: 3 }} />
              </div>
            </div>
            {/* Main card */}
            <div className="card-float-1" style={{ position: 'absolute', top: 20, left: 0, width: 360, background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 24px 64px rgba(37,99,235,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>AI-Generated Proposal</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Brand Strategy Package</div>
                </div>
                <div style={{ background: '#eff6ff', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, color: '#2563eb' }}>Draft</div>
              </div>
              {['Executive Summary', 'Scope of Work', 'Timeline & Milestones', 'Investment', 'Next Steps'].map((section, i) => (
                <div key={section} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 6, height: 6, background: i === 0 ? '#2563eb' : '#cbd5e1', borderRadius: '50%' }} />
                  <span style={{ fontSize: 13, color: i === 0 ? '#0f172a' : '#94a3b8', fontWeight: i === 0 ? 600 : 400 }}>{section}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#22c55e', fontWeight: 600 }}>✓ AI done</span>}
                </div>
              ))}
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button style={{ flex: 1, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Send Proposal</button>
                <button style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 8, padding: '10px 14px', fontSize: 13, cursor: 'pointer' }}>Preview</button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section style={{ background: '#fff', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '3.2×', label: 'Higher win rate' },
              { value: '85%', label: 'Faster to write' },
              { value: '$2.1M', label: 'Proposals sent this month' },
              { value: '4.9/5', label: 'Customer rating' },
            ].map((s) => (
              <div key={s.label} className="stat-card" style={{ textAlign: 'center', padding: '20px 16px', borderRadius: 12, border: '1px solid #e2e8f0', cursor: 'default' }}>
                <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#2563eb', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '4px 16px', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>
              Everything you need
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', marginBottom: 16 }}>
              A complete proposal OS for modern agencies
            </h2>
            <p style={{ fontSize: 17, color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
              From first draft to signed deal — every step of the proposal process in one place.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {[
              {
                icon: '✦',
                color: '#eff6ff',
                iconColor: '#2563eb',
                title: 'AI Section Generation',
                desc: 'Describe your project in a sentence. Our AI writes compelling executive summaries, scope of work, methodology, and more — in your brand voice.',
              },
              {
                icon: '⬡',
                color: '#f0fdf4',
                iconColor: '#16a34a',
                title: 'Smart Content Library',
                desc: 'Save case studies, team bios, pricing tables, and reusable blocks. Drag them into any proposal with one click.',
              },
              {
                icon: '◈',
                color: '#fef9c3',
                iconColor: '#ca8a04',
                title: 'Live Proposal Tracking',
                desc: 'Know the instant your client opens your proposal. See time spent per section, so you know exactly where to follow up.',
              },
              {
                icon: '▣',
                color: '#fdf4ff',
                iconColor: '#9333ea',
                title: 'Client CRM',
                desc: 'Manage contacts, companies, and proposal history in one timeline. Never lose context on a deal again.',
              },
              {
                icon: '◎',
                color: '#fff1f2',
                iconColor: '#e11d48',
                title: 'Win/Loss Analytics',
                desc: 'Understand your pipeline: win rates by industry, proposal value, turnaround time, and what makes your best proposals win.',
              },
              {
                icon: '❋',
                color: '#f0f9ff',
                iconColor: '#0284c7',
                title: 'Professional PDF Export',
                desc: 'Export pixel-perfect branded proposals as PDFs. Custom cover pages, table of contents, and your logo throughout.',
              },
            ].map((f) => (
              <div key={f.title} className="feature-card" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px', cursor: 'default' }}>
                <div style={{ width: 44, height: 44, background: f.color, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: f.iconColor, marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 10, letterSpacing: '-0.02em' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ background: '#0f172a', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ display: 'inline-block', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 100, padding: '4px 16px', fontSize: 13, fontWeight: 600, color: '#60a5fa', marginBottom: 16 }}>
                How it works
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#f1f5f9', marginBottom: 16 }}>
                From brief to sent in 10 minutes
              </h2>
              <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 480, margin: '0 auto' }}>
                Three steps stand between you and a proposal that wins business.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
              {[
                {
                  step: '01',
                  title: 'Describe your project',
                  desc: 'Enter the client name, project type, budget range, and a few bullet points about what you\'re delivering. Takes under 2 minutes.',
                  accent: '#2563eb',
                },
                {
                  step: '02',
                  title: 'AI writes the draft',
                  desc: 'ProposalPilot generates a complete, professional proposal — sections, pricing table, timeline, and terms — ready to edit.',
                  accent: '#7c3aed',
                },
                {
                  step: '03',
                  title: 'Send & track',
                  desc: 'Review, customize, and send with one click. Get real-time notifications when your client opens and reads your proposal.',
                  accent: '#0891b2',
                },
              ].map((step, i) => (
                <div key={step.step} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 28px', position: 'relative' }}>
                  <div style={{ fontSize: 48, fontWeight: 900, color: step.accent, opacity: 0.25, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 16 }}>{step.step}</div>
                  {i < 2 && (
                    <div style={{ position: 'absolute', top: '42px', right: '-20px', zIndex: 1 }}>
                      <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
                        <path d="M0 8h36M30 2l6 6-6 6" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div style={{ width: 40, height: 4, background: step.accent, borderRadius: 2, marginBottom: 20 }} />
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', marginBottom: 12 }}>
              Agencies that close more deals
            </h2>
            <p style={{ fontSize: 16, color: '#64748b' }}>Real results from real teams using ProposalPilot every day.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                quote: 'Our win rate jumped from 28% to 51% in the first quarter of using ProposalPilot. The AI actually writes better proposals than our senior strategist.',
                name: 'Marcus Chen',
                role: 'Founder, Apex Digital',
                avatar: 'MC',
                accent: '#2563eb',
              },
              {
                quote: 'I used to spend 6 hours per proposal. Now it\'s 45 minutes. ProposalPilot paid for itself in the first week.',
                name: 'Priya Sharma',
                role: 'Freelance Brand Consultant',
                avatar: 'PS',
                accent: '#7c3aed',
              },
              {
                quote: 'The tracking feature alone is worth it. Knowing my client opened the proposal 3 times before the call completely changed how I prepared.',
                name: 'James Okafor',
                role: 'Partner, CreativeHive Agency',
                avatar: 'JO',
                accent: '#0891b2',
              },
            ].map((t) => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 32, color: t.accent, lineHeight: 1, marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 24 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, background: t.accent, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'inline-block', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, padding: '4px 16px', fontSize: 13, fontWeight: 600, color: '#2563eb', marginBottom: 16 }}>
                Simple pricing
              </div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', marginBottom: 12 }}>
                Start free, scale as you grow
              </h2>
              <p style={{ fontSize: 16, color: '#64748b' }}>No surprises. Cancel anytime.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {[
                {
                  name: 'Free',
                  price: '$0',
                  period: 'forever',
                  description: 'For freelancers getting started',
                  features: ['5 proposals/month', 'AI generation (basic)', 'PDF export', 'Email tracking', '1 user'],
                  cta: 'Get started',
                  highlight: false,
                },
                {
                  name: 'Pro',
                  price: '$29',
                  period: '/month',
                  description: 'For growing agencies',
                  features: ['Unlimited proposals', 'AI generation (advanced)', 'Custom branding', 'Live read receipts', 'Content library', 'Win/loss analytics', 'Up to 5 users'],
                  cta: 'Start free trial',
                  highlight: true,
                },
                {
                  name: 'Agency',
                  price: '$79',
                  period: '/month',
                  description: 'For teams & studios',
                  features: ['Everything in Pro', 'Unlimited users', 'Priority AI queue', 'Client portal access', 'CRM integrations', 'Custom domain', 'Dedicated support'],
                  cta: 'Contact sales',
                  highlight: false,
                },
              ].map((plan) => (
                <div key={plan.name} className="pricing-card" style={{ background: plan.highlight ? '#2563eb' : '#fff', borderRadius: 16, border: plan.highlight ? '2px solid #2563eb' : '1px solid #e2e8f0', padding: '32px 28px', boxShadow: plan.highlight ? '0 16px 48px rgba(37,99,235,0.3)' : 'none', position: 'relative' }}>
                  {plan.highlight && (
                    <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#1d4ed8', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                      Most popular
                    </div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                    <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#0f172a' }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#94a3b8' }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748b', marginBottom: 28 }}>{plan.description}</div>
                  <div style={{ marginBottom: 28 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill={plan.highlight ? 'rgba(255,255,255,0.15)' : '#eff6ff'} />
                          <path d="M5 8l2 2 4-4" stroke={plan.highlight ? '#fff' : '#2563eb'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : '#2563eb', color: plan.highlight ? '#2563eb' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: '#2563eb', padding: '96px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 24 }}>🚀</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, lineHeight: 1.15 }}>
              Your next proposal could be your best-ever
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, lineHeight: 1.6 }}>
              Join 2,400+ agencies and consultants who use ProposalPilot to win more business, faster.
            </p>
            <Link href="/signup" style={{ background: '#fff', color: '#2563eb', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.01em' }}>
              Start free today →
            </Link>
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Free plan · No credit card · 5 proposals immediately</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0f172a', padding: '64px 24px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, background: '#2563eb', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#f1f5f9', letterSpacing: '-0.03em' }}>ProposalPilot</span>
                </div>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, maxWidth: 280 }}>
                  AI-powered proposal software for agencies, consultants, and freelancers who want to win more business.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Security'] },
              ].map((col) => (
                <div key={col.heading}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{col.heading}</div>
                  {col.links.map((l) => (
                    <a key={l} href="#" style={{ display: 'block', fontSize: 14, color: '#64748b', textDecoration: 'none', marginBottom: 10 }} className="nav-link">{l}</a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#475569' }}>© 2025 ProposalPilot. All rights reserved.</div>
              <div style={{ fontSize: 13, color: '#475569' }}>Made for agencies that want to close</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
