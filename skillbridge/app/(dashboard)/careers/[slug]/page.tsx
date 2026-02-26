import Link from 'next/link';

const careerData: Record<string, {
  title: string; industry: string; score: number;
  salary_low: number; salary_high: number; growth: number;
  transition_months: number; description: string;
  transferable: { skill: string; level: string }[];
  gaps: { skill: string; priority: 'high' | 'medium' | 'low'; course?: string }[];
  learning_path: { step: number; title: string; type: string; hours: number; free: boolean; skill: string }[];
  top_companies: string[];
  day_in_life: string[];
}> = {
  'ux-designer': {
    title: 'UX Designer',
    industry: 'Design & Tech',
    score: 84,
    salary_low: 85000,
    salary_high: 140000,
    growth: 13,
    transition_months: 10,
    description: 'UX Designers create digital products that are intuitive and delightful. They conduct user research, design wireframes and prototypes, and collaborate with engineers to ship experiences people love.',
    transferable: [
      { skill: 'Communication', level: 'Expert' },
      { skill: 'Facilitation', level: 'Strong' },
      { skill: 'Customer Empathy', level: 'Strong' },
      { skill: 'Project Management', level: 'Solid' },
      { skill: 'Public Speaking', level: 'Solid' },
    ],
    gaps: [
      { skill: 'Figma', priority: 'high', course: 'Figma for Beginners (Google)' },
      { skill: 'User Research Methods', priority: 'high', course: 'UX Research & Strategy (Coursera)' },
      { skill: 'Prototyping', priority: 'medium' },
      { skill: 'Usability Testing', priority: 'medium' },
      { skill: 'Design Systems', priority: 'low' },
    ],
    learning_path: [
      { step: 1, title: 'Figma Fundamentals', type: 'Course', hours: 20, free: true, skill: 'Figma' },
      { step: 2, title: 'Google UX Design Certificate', type: 'Certificate', hours: 180, free: false, skill: 'User Research' },
      { step: 3, title: 'Design a Portfolio Project', type: 'Project', hours: 40, free: true, skill: 'Prototyping' },
      { step: 4, title: 'Nielsen Norman UX Certification', type: 'Certification', hours: 60, free: false, skill: 'UX Strategy' },
    ],
    top_companies: ['Google', 'Apple', 'Figma', 'Adobe', 'Shopify', 'Airbnb', 'Stripe'],
    day_in_life: [
      'Run user interviews or usability tests (2–3 per week)',
      'Design wireframes and prototypes in Figma',
      'Review designs with engineers and product managers',
      'Analyze user feedback and iterate on designs',
      'Present design decisions with supporting data',
    ],
  },
};

const fallback = careerData['ux-designer'];

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const career = careerData[slug] ?? fallback;
  const priorityColor = { high: '#EF4444', medium: '#F97316', low: '#6B7280' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 32px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 20 }}>
        <Link href="/careers" style={{ fontSize: 13, color: 'var(--color-teal-600)', textDecoration: 'none', fontWeight: 500 }}>← Career Matches</Link>
      </div>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', borderRadius: 20, padding: '32px 32px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Strong Match</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 36, margin: '0 0 8px', color: '#111' }}>{career.title}</h1>
          <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{career.industry} · ~{career.transition_months} month transition</div>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, maxWidth: 500 }}>{career.description}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, boxShadow: '0 4px 20px rgba(5,150,105,0.35)' }}>
            {career.score}%
          </div>
          <div style={{ fontSize: 13, color: '#065f46', marginTop: 6, fontWeight: 600 }}>Match Score</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Salary Range', value: `$${Math.round(career.salary_low / 1000)}K–$${Math.round(career.salary_high / 1000)}K` },
          { label: 'Job Growth', value: `+${career.growth}%` },
          { label: 'Avg. Transition', value: `${career.transition_months} months` },
          { label: 'Remote Jobs', value: 'Available' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, color: 'var(--color-teal-600)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Transferable skills */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>✅ Skills You Already Have</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {career.transferable.map(s => (
              <div key={s.skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{s.skill}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-teal-600)', background: 'rgba(13,148,136,0.1)', padding: '3px 10px', borderRadius: 10 }}>{s.level}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gap skills */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🎯 Skills to Develop</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {career.gaps.map(g => (
              <div key={g.skill}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: g.course ? 4 : 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{g.skill}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: priorityColor[g.priority], textTransform: 'uppercase' }}>{g.priority}</span>
                </div>
                {g.course && <div style={{ fontSize: 12, color: 'var(--color-teal-600)', paddingLeft: 0 }}>→ {g.course}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning path */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>📚 Your Learning Path</h2>
          <Link href="/learning" style={{ fontSize: 13, color: 'var(--color-teal-600)', textDecoration: 'none', fontWeight: 600 }}>Start learning →</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {career.learning_path.map((step, i) => (
            <div key={step.step} style={{ display: 'flex', gap: 16, paddingBottom: i < career.learning_path.length - 1 ? 20 : 0, position: 'relative' }}>
              {/* Timeline line */}
              {i < career.learning_path.length - 1 && (
                <div style={{ position: 'absolute', left: 18, top: 36, width: 2, height: 'calc(100% - 10px)', background: 'var(--border-subtle)' }} />
              )}
              {/* Step number */}
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--color-teal-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, flexShrink: 0, zIndex: 1 }}>
                {step.step}
              </div>
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{step.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {step.type} · {step.hours}h · {step.free ? '🆓 Free' : '💳 Paid'} · Covers: {step.skill}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day in the life */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>☀️ Day in the Life</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {career.day_in_life.map((item, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--color-teal-600)', flexShrink: 0, marginTop: 1 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 16 }}>🏢 Top Companies Hiring</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {career.top_companies.map(c => (
              <span key={c} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border-default)', fontSize: 13, fontWeight: 500 }}>{c}</span>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Ready to start?</h3>
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              <Link href="/learning" style={{ display: 'block', padding: '11px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: 'var(--color-teal-600)', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>
                Start Learning Plan
              </Link>
              <Link href="/jobs" style={{ display: 'block', padding: '11px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: '1.5px solid var(--border-default)', color: 'var(--text-primary)', textDecoration: 'none', textAlign: 'center', background: '#fff' }}>
                Browse {career.title} Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
