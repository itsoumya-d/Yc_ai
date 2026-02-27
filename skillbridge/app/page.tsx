import Link from 'next/link';

export default function LandingPage() {
  const styles = `
    @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
    @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
    @keyframes pulse-ring { 0% { transform:scale(0.95); box-shadow:0 0 0 0 rgba(99,102,241,0.4); } 70% { transform:scale(1); box-shadow:0 0 0 10px rgba(99,102,241,0); } 100% { transform:scale(0.95); } }
    .hero-h1 { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.1s; }
    .hero-sub { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.25s; }
    .hero-cta { animation:fadeUp 0.7s ease forwards; opacity:0; animation-delay:0.4s; }
    .float-card { animation:float 5s ease-in-out infinite; }
    .shimmer-text {
      background:linear-gradient(90deg,#4F46E5 0%,#818CF8 35%,#4F46E5 65%,#312E81 100%);
      background-size:200% auto;
      -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
      animation:shimmer 3s linear infinite;
    }
    .feature-card { transition:all 0.25s ease; }
    .feature-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(79,70,229,0.12); }
    .nav-link { transition:color 0.15s; }
    .nav-link:hover { color:#4F46E5; }
    .btn-primary { transition:all 0.2s ease; }
    .btn-primary:hover { background:#4338CA; transform:translateY(-1px); box-shadow:0 8px 20px rgba(79,70,229,0.3); }
    .skill-pill { transition:all 0.2s; }
    .skill-pill:hover { background:#EEF2FF; border-color:#A5B4FC; }
  `;

  const skills = ['Data Analysis', 'Project Management', 'Python', 'Machine Learning', 'UX Design', 'Cloud Architecture', 'Financial Modeling', 'Content Strategy'];
  const careers = [
    { from: 'Manufacturing Foreman', to: 'Operations Manager', match: 87, salary: '+$28K', time: '6 months' },
    { from: 'Retail Manager', to: 'Customer Success Lead', match: 91, salary: '+$18K', time: '3 months' },
    { from: 'Coal Miner', to: 'Wind Turbine Tech', match: 76, salary: '+$15K', time: '8 months' },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#FAFAFA', color: '#0F172A', minHeight: '100vh' }}>

        {/* Nav */}
        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #E4E4E7' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #4F46E5, #818CF8)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
              </div>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>SkillBridge</span>
            </div>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {['How it Works', 'Career Paths', 'Pricing'].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#71717A', textDecoration: 'none' }}>{item}</a>
              ))}
              <Link href="/login" className="nav-link" style={{ fontSize: 14, fontWeight: 500, color: '#71717A', textDecoration: 'none' }}>Log in</Link>
              <Link href="/signup" className="btn-primary" style={{ background: '#4F46E5', color: '#fff', padding: '8px 20px', borderRadius: 9, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Start free →
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '88px 24px 72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: 100, padding: '5px 14px', marginBottom: 28 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5' }}>AI-powered career transition navigator</span>
            </div>
            <h1 className="hero-h1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.04em', marginBottom: 24 }}>
              Your skills have<br />more value than<br /><span className="shimmer-text">you realize</span>
            </h1>
            <p className="hero-sub" style={{ fontSize: 18, color: '#52525B', lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              SkillBridge analyzes your experience, identifies transferable skills, and maps you to higher-paying careers — with a personalized plan to get there.
            </p>
            <div className="hero-cta" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup" className="btn-primary" style={{ background: '#4F46E5', color: '#fff', padding: '14px 28px', borderRadius: 10, fontSize: 16, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Discover your paths →
              </Link>
              <a href="#how-it-works" style={{ color: '#71717A', fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>See how it works ↓</a>
            </div>
            <p style={{ marginTop: 20, fontSize: 13, color: '#A1A1AA' }}>Free · No credit card · 3 minute setup</p>

            {/* Skill pills */}
            <div style={{ marginTop: 40 }}>
              <p style={{ fontSize: 12, color: '#A1A1AA', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Skills we can transfer</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {skills.map((s) => (
                  <span key={s} className="skill-pill" style={{ fontSize: 12, fontWeight: 600, color: '#52525B', background: '#F4F4F5', border: '1px solid #E4E4E7', borderRadius: 100, padding: '4px 12px', cursor: 'default' }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Career match cards */}
          <div style={{ position: 'relative', height: 420 }}>
            <div className="float-card" style={{ position: 'absolute', top: 0, left: 20, width: 340, background: '#fff', borderRadius: 16, border: '1px solid #E4E4E7', padding: '20px', boxShadow: '0 20px 60px rgba(79,70,229,0.1)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Your career matches</div>
              {careers.map((c, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < 2 ? '1px solid #F4F4F5' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#A1A1AA', marginBottom: 2 }}>{c.from}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>→ {c.to}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#4F46E5' }}>{c.match}%</div>
                      <div style={{ fontSize: 10, color: '#A1A1AA' }}>match</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 11, background: '#F0FDF4', color: '#16A34A', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{c.salary}</span>
                    <span style={{ fontSize: 11, background: '#EEF2FF', color: '#4F46E5', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>{c.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 0, width: 200, background: '#4F46E5', borderRadius: 14, padding: '16px', color: '#fff', boxShadow: '0 16px 40px rgba(79,70,229,0.3)' }}>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8 }}>Learning progress</div>
              <div style={{ fontSize: 24, fontWeight: 900, fontFamily: "'Outfit', sans-serif", marginBottom: 12 }}>62%</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
                <div style={{ width: '62%', height: '100%', background: '#fff', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 8 }}>Python for Data Analysis</div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: '#fff', borderTop: '1px solid #E4E4E7', borderBottom: '1px solid #E4E4E7' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { value: '85M+', label: 'Workers at risk of automation' },
              { value: '73%', label: 'Avg salary increase after transition' },
              { value: '4.2K', label: 'Career paths mapped' },
              { value: '8 weeks', label: 'Avg time to first job offer' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#4F46E5', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: '#71717A' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 16 }}>
              From stuck to thriving in 3 steps
            </h2>
            <p style={{ fontSize: 17, color: '#71717A', maxWidth: 460, margin: '0 auto' }}>Built for workers who know they need a change but don't know where to start.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { step: '01', icon: '📋', title: 'Upload your resume', desc: 'Paste your resume or LinkedIn profile. Our AI instantly extracts 40+ transferable skills from your work history — even from jobs you wouldn\'t expect.', accent: '#4F46E5' },
              { step: '02', icon: '🗺️', title: 'Explore career paths', desc: 'Get ranked matches to 4,200+ career paths based on your skills, salary goals, and timeline. See exactly what skills you need and what you already have.', accent: '#7C3AED' },
              { step: '03', icon: '🚀', title: 'Get your learning plan', desc: 'Receive a personalized curriculum of curated courses, certifications, and projects. Connect with mentors and employers as you progress.', accent: '#0891B2' },
            ].map((step, i) => (
              <div key={step.step} style={{ background: '#fff', borderRadius: 20, border: '1px solid #E4E4E7', padding: '36px 32px', position: 'relative' }}>
                {i < 2 && (
                  <div style={{ position: 'absolute', top: 48, right: -20, zIndex: 1 }}>
                    <svg width="40" height="16" viewBox="0 0 40 16" fill="none"><path d="M0 8h36M30 2l6 6-6 6" stroke="#E4E4E7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                )}
                <div style={{ fontSize: 40, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ fontSize: 48, fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: step.accent, opacity: 0.12, letterSpacing: '-0.06em', lineHeight: 1, marginBottom: 16 }}>{step.step}</div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.03em' }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section style={{ background: '#0F172A', padding: '96px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#F8FAFC', marginBottom: 16 }}>
                Every tool for your career transition
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {[
                { icon: '✦', title: 'Skills X-Ray', desc: 'AI extracts 40+ transferable skills from your resume. See how employers actually value your experience.', accent: '#818CF8' },
                { icon: '◈', title: 'Career Match Score', desc: 'Get a 0-100 match score for 4,200+ career paths based on your exact skill profile.', accent: '#34D399' },
                { icon: '⬡', title: 'AI Resume Rewriter', desc: 'Automatically rewrite your resume for any target role, highlighting the most relevant skills.', accent: '#FCD34D' },
                { icon: '▣', title: 'Learning Roadmap', desc: 'Curated courses, certifications, and projects in the exact sequence to close your skill gap fastest.', accent: '#F472B6' },
                { icon: '◎', title: 'Job Matching', desc: 'Connect with 50,000+ employers actively hiring career changers. Filter by remote, salary, and skills.', accent: '#60A5FA' },
                { icon: '❋', title: 'Mentor Network', desc: 'Get paired with professionals who made the same career switch. Real advice from real people.', accent: '#A78BFA' },
              ].map((f) => (
                <div key={f.title} className="feature-card" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: '28px', cursor: 'default' }}>
                  <div style={{ fontSize: 24, color: f.accent, marginBottom: 16 }}>{f.icon}</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: '#F8FAFC', marginBottom: 10, letterSpacing: '-0.02em' }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: '#94A3B8', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 12 }}>
              Real career transitions
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { quote: 'I was a truck driver for 12 years worried about autonomous vehicles. SkillBridge showed me I had logistics management skills worth $65K/yr. Now I manage a fleet operations center.', name: 'Marcus T.', from: 'Truck Driver → Fleet Operations Manager', salary: '+$31K' },
              { quote: 'Lost my retail manager job to an app. Within 4 months I was working as a customer success manager at a SaaS startup. The learning plan was surprisingly doable.', name: 'Aisha K.', from: 'Retail Manager → Customer Success Lead', salary: '+$22K' },
              { quote: 'I kept applying to the same kind of jobs. SkillBridge found 47 career paths I had never considered. I\'m now a UX researcher and it feels like I was born for it.', name: 'Jorge R.', from: 'Bank Teller → UX Researcher', salary: '+$38K' },
            ].map((t) => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E4E4E7', padding: '28px' }}>
                <div style={{ fontSize: 32, color: '#C7D2FE', lineHeight: 1, marginBottom: 16 }}>"</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.75, marginBottom: 24 }}>{t.quote}</p>
                <div style={{ borderTop: '1px solid #F4F4F5', paddingTop: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: '#71717A', marginBottom: 8 }}>{t.from}</div>
                  <span style={{ fontSize: 12, fontWeight: 700, background: '#F0FDF4', color: '#16A34A', padding: '3px 10px', borderRadius: 100 }}>{t.salary}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" style={{ background: '#F4F4F5', padding: '96px 24px', borderTop: '1px solid #E4E4E7' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#0F172A', marginBottom: 12 }}>
                Invest in your career
              </h2>
              <p style={{ fontSize: 16, color: '#71717A' }}>Less than the cost of one bad month of staying put.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { name: 'Explorer', price: '$0', period: 'forever', desc: 'Discover what\'s possible', features: ['Skills assessment', '3 career path matches', 'Basic learning roadmap', 'Job board access'], cta: 'Start free', highlight: false },
                { name: 'Navigator', price: '$14.99', period: '/month', desc: 'Full transition support', features: ['Unlimited career paths', 'AI resume rewriter', 'Complete learning roadmap', 'Job matching (50K+ jobs)', 'Progress tracking', 'Email support'], cta: 'Start trial', highlight: true },
                { name: 'Pro', price: '$29.99', period: '/month', desc: 'For serious career movers', features: ['Everything in Navigator', 'Mentor matching', 'Mock interviews', 'Salary negotiation guide', 'Recruiter introductions', 'Priority support'], cta: 'Start trial', highlight: false },
              ].map((plan) => (
                <div key={plan.name} style={{ background: plan.highlight ? '#4F46E5' : '#fff', borderRadius: 16, border: plan.highlight ? '2px solid #4F46E5' : '1px solid #E4E4E7', padding: '32px 28px', position: 'relative', boxShadow: plan.highlight ? '0 16px 48px rgba(79,70,229,0.25)' : 'none' }}>
                  {plan.highlight && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: '#312E81', color: '#C7D2FE', fontSize: 11, fontWeight: 700, padding: '4px 14px', borderRadius: 100, whiteSpace: 'nowrap' }}>Most popular</div>}
                  <div style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? 'rgba(255,255,255,0.6)' : '#71717A', marginBottom: 8 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 40, fontWeight: 900, letterSpacing: '-0.04em', color: plan.highlight ? '#fff' : '#0F172A' }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.5)' : '#A1A1AA' }}>{plan.period}</span>
                  </div>
                  <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.65)' : '#71717A', marginBottom: 28 }}>{plan.desc}</div>
                  <div style={{ marginBottom: 28 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6.5" fill={plan.highlight ? 'rgba(255,255,255,0.15)' : '#EEF2FF'} /><path d="M4.5 7l2 2 3-3" stroke={plan.highlight ? '#fff' : '#4F46E5'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#374151' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? '#fff' : '#4F46E5', color: plan.highlight ? '#4F46E5' : '#fff', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', padding: '96px 24px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', marginBottom: 20, lineHeight: 1.1 }}>
              Your next career is closer than you think
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, lineHeight: 1.6 }}>
              Join 40,000+ workers who used SkillBridge to find higher-paying careers that fit their existing skills.
            </p>
            <Link href="/signup" style={{ background: '#fff', color: '#4F46E5', padding: '16px 40px', borderRadius: 12, fontSize: 18, fontWeight: 800, textDecoration: 'none', display: 'inline-block', letterSpacing: '-0.01em' }}>
              Find my career paths →
            </Link>
            <p style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Free · Takes 3 minutes · No credit card</p>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#0F172A', padding: '64px 24px 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#4F46E5,#818CF8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#F8FAFC', letterSpacing: '-0.03em' }}>SkillBridge</span>
                </div>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, maxWidth: 260 }}>AI career navigator for workers navigating automation and economic change.</p>
              </div>
              {[
                { heading: 'Product', links: ['How it Works', 'Career Paths', 'Pricing', 'For Employers'] },
                { heading: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { heading: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] },
              ].map((col) => (
                <div key={col.heading}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>{col.heading}</div>
                  {col.links.map((l) => (
                    <a key={l} href="#" className="nav-link" style={{ display: 'block', fontSize: 13, color: '#475569', textDecoration: 'none', marginBottom: 10 }}>{l}</a>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, color: '#334155' }}>© 2025 SkillBridge. All rights reserved.</div>
              <div style={{ fontSize: 13, color: '#334155' }}>Helping 40,000+ workers find their next chapter</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
