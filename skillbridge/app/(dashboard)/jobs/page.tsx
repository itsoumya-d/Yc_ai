import Link from 'next/link';

const jobs = [
  {
    id: '1',
    title: 'UX Designer',
    company: 'Stripe',
    location: 'Remote',
    remote_type: 'remote',
    salary_min: 110000,
    salary_max: 140000,
    posted_days_ago: 1,
    description: 'Design elegant experiences across Stripe's developer tools. You\'ll work on complex B2B products with a world-class team.',
    required_skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    transferability: 76,
    matching: ['Communication', 'Customer Empathy', 'Project Management', 'Facilitation'],
    gaps: ['Figma', 'Prototyping'],
    career_id: 'ux-designer',
  },
  {
    id: '2',
    title: 'Junior UX Researcher',
    company: 'Airbnb',
    location: 'San Francisco, CA',
    remote_type: 'hybrid',
    salary_min: 85000,
    salary_max: 110000,
    posted_days_ago: 3,
    description: 'Conduct user interviews and usability studies to inform product direction. Strong communication skills essential.',
    required_skills: ['User Research', 'Data Analysis', 'Communication', 'Presentation'],
    transferability: 88,
    matching: ['Communication', 'Customer Empathy', 'Data Analysis', 'Research', 'Facilitation'],
    gaps: ['User Research methods'],
    career_id: 'ux-designer',
  },
  {
    id: '3',
    title: 'Product Designer',
    company: 'Figma',
    location: 'Remote',
    remote_type: 'remote',
    salary_min: 130000,
    salary_max: 165000,
    posted_days_ago: 5,
    description: 'Shape the future of design tooling. Work closely with engineers and PMs to ship features used by millions.',
    required_skills: ['Figma', 'UX Design', 'Design Systems', 'Interaction Design', 'Prototyping'],
    transferability: 58,
    matching: ['Communication', 'Customer Empathy', 'Project Management'],
    gaps: ['Figma', 'Design Systems', 'Interaction Design', 'Prototyping'],
    career_id: 'ux-designer',
  },
  {
    id: '4',
    title: 'Content Designer',
    company: 'Notion',
    location: 'Remote',
    remote_type: 'remote',
    salary_min: 90000,
    salary_max: 120000,
    posted_days_ago: 2,
    description: 'Write the words that make Notion feel effortless. Partner with design and engineering on UI copy, onboarding, and docs.',
    required_skills: ['Copywriting', 'UX Writing', 'Communication', 'Attention to Detail'],
    transferability: 92,
    matching: ['Copywriting', 'Communication', 'Customer Empathy', 'Critical Thinking'],
    gaps: ['UX Writing'],
    career_id: 'ux-designer',
  },
  {
    id: '5',
    title: 'Associate PM',
    company: 'HubSpot',
    location: 'Boston, MA (Hybrid)',
    remote_type: 'hybrid',
    salary_min: 95000,
    salary_max: 120000,
    posted_days_ago: 7,
    description: 'Define product requirements, run sprints, and ship features for HubSpot\'s CRM platform.',
    required_skills: ['Project Management', 'SQL', 'Communication', 'Agile', 'Data Analysis'],
    transferability: 71,
    matching: ['Project Management', 'Communication', 'Data Analysis', 'Negotiation'],
    gaps: ['SQL', 'Agile/Scrum'],
    career_id: 'product-manager',
  },
];

function scoreColor(score: number) {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return 'var(--color-orange-500)';
  return '#9CA3AF';
}

export default function JobsPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Job Board</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Jobs scored by how well your current skills transfer. Higher = you can apply now.</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Filter by:</span>
        {['All Careers', 'UX Designer', 'Product Manager', 'Data Analyst', 'Remote Only'].map(f => (
          <button key={f} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1.5px solid ' + (f === 'All Careers' ? 'var(--color-teal-600)' : 'var(--border-default)'), background: f === 'All Careers' ? 'var(--color-teal-600)' : '#fff', color: f === 'All Careers' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>{f}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {jobs.map(job => (
          <div key={job.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 20, padding: '20px 24px', flexWrap: 'wrap' }}>
              {/* Job info */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, margin: 0 }}>{job.title}</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 8, background: job.remote_type === 'remote' ? 'rgba(13,148,136,0.1)' : 'rgba(124,58,237,0.08)', color: job.remote_type === 'remote' ? 'var(--color-teal-600)' : '#7C3AED' }}>
                    {job.remote_type === 'remote' ? '🌐 Remote' : '🏢 Hybrid'}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                  {job.company} · {job.location}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
                  ${Math.round(job.salary_min / 1000)}K–${Math.round(job.salary_max / 1000)}K · Posted {job.posted_days_ago === 1 ? 'today' : `${job.posted_days_ago}d ago`}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, maxWidth: 500 }}>{job.description}</p>

                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Required Skills</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {job.required_skills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 8, background: job.matching.includes(s) ? 'rgba(22,163,74,0.08)' : 'rgba(249,115,22,0.08)', color: job.matching.includes(s) ? '#16a34a' : 'var(--color-orange-500)', fontWeight: 600 }}>
                        {job.matching.includes(s) ? '✓ ' : '○ '}{s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transferability score */}
              <div style={{ flexShrink: 0, textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: scoreColor(job.transferability), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, margin: '0 auto 8px', boxShadow: `0 4px 16px ${scoreColor(job.transferability)}40` }}>
                  {job.transferability}%
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(job.transferability) }}>
                  {job.transferability >= 80 ? 'Apply now!' : job.transferability >= 60 ? 'Good fit' : 'Almost there'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Transferability</div>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href={job.career_id ? '#' : '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '9px 16px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-teal-600)', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Apply →
                  </a>
                  <Link href={`/resume?target=${encodeURIComponent(job.title)}`} style={{ display: 'block', padding: '9px 14px', borderRadius: 9, fontWeight: 600, fontSize: 12, border: '1.5px solid var(--border-default)', color: 'var(--text-secondary)', textDecoration: 'none', background: '#fff', whiteSpace: 'nowrap' }}>
                    Tailor resume
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 28 }}>
        <button style={{ padding: '12px 32px', borderRadius: 12, fontWeight: 600, fontSize: 15, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer', color: 'var(--text-secondary)' }}>Load more jobs</button>
      </div>
    </div>
  );
}
