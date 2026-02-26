import Link from 'next/link';

const careers = [
  {
    slug: 'ux-designer',
    title: 'UX Designer',
    industry: 'Design & Tech',
    score: 84,
    salary_low: 85000,
    salary_high: 140000,
    growth: 13,
    transition_months: 10,
    remote: true,
    description: 'Design intuitive digital experiences. Your communication and empathy skills transfer directly.',
    transferable: ['Communication', 'Facilitation', 'Customer Empathy', 'Project Management'],
    gaps: ['Figma', 'User Research'],
  },
  {
    slug: 'product-manager',
    title: 'Product Manager',
    industry: 'Tech',
    score: 78,
    salary_low: 95000,
    salary_high: 165000,
    growth: 19,
    transition_months: 12,
    remote: true,
    description: 'Bridge business, tech, and users. Your leadership and analysis background is a major asset.',
    transferable: ['Project Management', 'Negotiation', 'Data Analysis', 'Communication'],
    gaps: ['SQL', 'Agile/Scrum', 'Technical Roadmapping'],
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    industry: 'Analytics',
    score: 71,
    salary_low: 70000,
    salary_high: 115000,
    growth: 25,
    transition_months: 8,
    remote: true,
    description: 'Turn data into decisions. Your analytical thinking pairs perfectly with a few technical skills.',
    transferable: ['Data Analysis', 'Financial Modeling', 'Copywriting'],
    gaps: ['SQL', 'Python', 'Tableau', 'Statistics'],
  },
  {
    slug: 'instructional-designer',
    title: 'Instructional Designer',
    industry: 'Education Tech',
    score: 68,
    salary_low: 62000,
    salary_high: 95000,
    growth: 10,
    transition_months: 6,
    remote: true,
    description: 'Design learning experiences for corporate training and edtech. Teaching backgrounds shine here.',
    transferable: ['Facilitation', 'Copywriting', 'Project Management', 'Communication'],
    gaps: ['LMS platforms', 'SCORM', 'Articulate 360'],
  },
  {
    slug: 'technical-writer',
    title: 'Technical Writer',
    industry: 'Tech',
    score: 64,
    salary_low: 65000,
    salary_high: 105000,
    growth: 7,
    transition_months: 5,
    remote: true,
    description: 'Translate complex technical concepts into clear, accessible documentation.',
    transferable: ['Copywriting', 'Communication', 'Attention to Detail'],
    gaps: ['API documentation', 'Markdown', 'Developer tools'],
  },
  {
    slug: 'customer-success-manager',
    title: 'Customer Success Manager',
    industry: 'SaaS',
    score: 61,
    salary_low: 60000,
    salary_high: 100000,
    growth: 16,
    transition_months: 4,
    remote: true,
    description: 'Help customers get value from software products. High demand in SaaS companies.',
    transferable: ['Customer Empathy', 'Communication', 'Project Management', 'Negotiation'],
    gaps: ['CRM tools', 'Churn analysis', 'B2B sales'],
  },
];

function formatSalary(n: number): string {
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
  return '$' + n;
}

export default function CareersPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Career Matches</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Based on your 66 rated skills. Scores improve as you complete the assessment.</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {['All', 'Strong Match (80+)', 'Good Match (60-79)', 'Remote Only', 'High Growth'].map(f => (
          <button
            key={f}
            style={{
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              background: f === 'All' ? 'var(--color-teal-600)' : '#fff',
              color: f === 'All' ? '#fff' : 'var(--text-secondary)',
              border: '1.5px solid ' + (f === 'All' ? 'var(--color-teal-600)' : 'var(--border-default)'),
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Career grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {careers.map(c => (
          <Link
            key={c.slug}
            href={`/careers/${c.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div style={{
              background: '#fff',
              borderRadius: 18,
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              transition: 'transform 150ms, box-shadow 150ms',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'none';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Score header */}
              <div style={{ background: c.score >= 80 ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : c.score >= 60 ? 'linear-gradient(135deg, #fff7ed, #fed7aa)' : 'linear-gradient(135deg, #f9fafb, #f3f4f6)', padding: '20px 20px 16px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.score >= 80 ? '#065f46' : c.score >= 60 ? '#9a3412' : '#4b5563', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {c.score >= 80 ? '✦ Strong Match' : c.score >= 60 ? '● Good Match' : '○ Partial Match'}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, margin: 0, color: '#111' }}>{c.title}</h3>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{c.industry}</div>
                  </div>
                  {/* Score circle */}
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: c.score >= 80 ? '#059669' : c.score >= 60 ? 'var(--color-orange-500)' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                    {c.score}%
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px 20px' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{c.description}</p>

                {/* Salary / growth */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                    💰 <strong>{formatSalary(c.salary_low)}–{formatSalary(c.salary_high)}</strong>
                  </div>
                  <div style={{ fontSize: 13, color: '#16a34a' }}>📈 +{c.growth}% growth</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>⏱ ~{c.transition_months} months</div>
                </div>

                {/* Transferable skills */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>You already have</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {c.transferable.slice(0, 3).map(s => (
                      <span key={s} style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(13,148,136,0.1)', color: 'var(--color-teal-600)', fontSize: 11, fontWeight: 600 }}>{s}</span>
                    ))}
                    {c.transferable.length > 3 && (
                      <span style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(13,148,136,0.05)', color: 'var(--text-muted)', fontSize: 11 }}>+{c.transferable.length - 3}</span>
                    )}
                  </div>
                </div>

                {/* Gap skills */}
                {c.gaps.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Gaps to close</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {c.gaps.slice(0, 3).map(s => (
                        <span key={s} style={{ padding: '3px 10px', borderRadius: 10, background: 'rgba(249,115,22,0.08)', color: 'var(--color-orange-500)', fontSize: 11, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load more */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button style={{ padding: '12px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          Load more careers
        </button>
      </div>
    </div>
  );
}
