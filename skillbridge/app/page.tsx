import Link from 'next/link';

const features = [
  { icon: '🎯', title: 'Skills Assessment', desc: 'Swipe through 100+ skills to map your hidden strengths and transferable abilities.' },
  { icon: '🤖', title: 'AI Career Matching', desc: 'Our AI scores your profile against 500+ careers, surfacing best-fit paths you'd never consider.' },
  { icon: '📚', title: 'Curated Learning', desc: 'Get a step-by-step learning path — courses, certifications, projects — ordered by impact.' },
  { icon: '📄', title: 'ATS-Optimized Resume', desc: 'AI rewrites your resume for your target role, beating applicant tracking systems.' },
  { icon: '💼', title: 'Job Transferability', desc: 'See exactly how hireable you are for any job today, and what to do to close the gap.' },
  { icon: '🤝', title: 'Community & Mentors', desc: 'Connect with people who made your exact transition. Learn from their story.' },
];

const stories = [
  {
    name: 'Marcus T.',
    from: 'High School Teacher',
    to: 'UX Researcher',
    months: 11,
    quote: 'SkillBridge showed me that facilitation, lesson design, and deep listening were exactly what UX needed. I never would have connected those dots.',
    avatar: 'MT',
    salary: '+$42K',
  },
  {
    name: 'Priya K.',
    from: 'Nurse Practitioner',
    to: 'Health Tech PM',
    months: 14,
    quote: 'The gap analysis was brutally honest — I needed SQL and product thinking. The learning path took me there in under a year.',
    avatar: 'PK',
    salary: '+$38K',
  },
  {
    name: 'James O.',
    from: 'Military Logistics',
    to: 'Supply Chain Analyst',
    months: 7,
    quote: 'I didn\'t realize how much I already knew. The AI spotted 78% match immediately. Seven months later, I had the job.',
    avatar: 'JO',
    salary: '+$29K',
  },
];

const stats = [
  { value: '94%', label: 'land roles within 18 months' },
  { value: '500+', label: 'career paths mapped' },
  { value: '$34K', label: 'average salary increase' },
  { value: '12K+', label: 'successful transitions' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Nav */}
      <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,251,245,0.92)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <nav style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" style={{ padding: '8px 18px', borderRadius: 8, fontWeight: 500, fontSize: 14, color: 'var(--text-secondary)', textDecoration: 'none' }}>Log in</Link>
            <Link href="/signup" style={{ padding: '9px 20px', borderRadius: 9, fontWeight: 600, fontSize: 14, background: 'var(--color-teal-600)', color: '#fff', textDecoration: 'none' }}>Get Started Free</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center', position: 'relative' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: 0, left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(13,148,136,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 60, right: '8%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(249,115,22,0.10), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(13,148,136,0.1)', color: 'var(--color-teal-600)', borderRadius: 20, padding: '5px 14px', fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            🚀 Over 12,000 successful transitions
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'clamp(36px, 6vw, 68px)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Your skills are worth<br />
            <span style={{ background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>more than you think.</span>
          </h1>
          <p style={{ fontSize: 20, color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6 }}>
            SkillBridge maps your hidden strengths, finds your perfect career pivot, and gives you a week-by-week plan to get there.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, background: 'linear-gradient(135deg, var(--color-teal-600), #0f766e)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 24px rgba(13,148,136,0.30)' }}>
              Discover Your Path — Free
            </Link>
            <Link href="#stories" style={{ padding: '14px 28px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '2px solid var(--border-default)', color: 'var(--text-primary)', textDecoration: 'none', background: '#fff' }}>
              See Success Stories
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>No credit card required · Takes 8 minutes</p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, color: 'var(--color-teal-600)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, marginBottom: 16 }}>From where you are to where you want to be</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>Three steps. One clear path. No career counselor needed.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {[
            { step: '01', title: 'Map Your Skills', desc: 'Rate 100+ skills in under 8 minutes using our swipeable assessment. We discover strengths you forgot you had.', accent: 'var(--color-teal-600)' },
            { step: '02', title: 'Get Your Matches', desc: 'Our AI cross-references your profile against 500+ careers and surfaces the top 5 with detailed gap analysis.', accent: 'var(--color-orange-500)' },
            { step: '03', title: 'Execute Your Plan', desc: 'Follow a week-by-week learning plan. Track progress, earn badges, and apply to jobs with a tailored resume.', accent: 'var(--color-teal-600)' },
          ].map(item => (
            <div key={item.step} style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -10, fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: 96, color: 'rgba(0,0,0,0.04)', lineHeight: 1, userSelect: 'none' }}>{item.step}</div>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: item.accent + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 22 }}>
                {item.step === '01' ? '🎯' : item.step === '02' ? '🤖' : '🚀'}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 15 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#fff', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '80px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, marginBottom: 16 }}>Everything you need to make the leap</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} style={{ padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)', background: 'var(--bg-page)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section id="stories" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, marginBottom: 16 }}>Real people. Real transitions.</h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)' }}>Every story started with someone who thought it was too late or too hard.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
          {stories.map(s => (
            <div key={s.name} style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid var(--border-subtle)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-heading)', flexShrink: 0 }}>
                  {s.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{s.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.from} → {s.to}</div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: '#16a34a' }}>{s.salary}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.months}mo</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>&ldquo;{s.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, var(--color-teal-600) 0%, #0f766e 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, color: '#fff', marginBottom: 16 }}>Your next career is 8 minutes away.</h2>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>Start free. No resume required. Just tell us where you are today.</p>
        <Link href="/signup" style={{ display: 'inline-block', padding: '16px 40px', borderRadius: 14, fontWeight: 700, fontSize: 18, background: '#fff', color: 'var(--color-teal-600)', textDecoration: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
          Start Your Assessment →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', color: '#999', padding: '40px 24px', textAlign: 'center', fontSize: 14 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 16 }}>SkillBridge</div>
        <p style={{ marginBottom: 16 }}>Bridge your skills to a new career. AI-powered guidance.</p>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Privacy', 'Terms', 'Contact', 'Blog', 'Careers'].map(l => (
            <a key={l} href="#" style={{ color: '#999', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 13 }}>© 2025 SkillBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}
