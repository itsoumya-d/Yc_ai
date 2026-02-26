import Link from 'next/link';

const recentCareers = [
  { title: 'UX Designer', score: 84, industry: 'Tech', gap: 2 },
  { title: 'Product Manager', score: 78, industry: 'Tech', gap: 4 },
  { title: 'Data Analyst', score: 71, industry: 'Analytics', gap: 5 },
];

const nextSteps = [
  { icon: '🎯', title: 'Complete your assessment', desc: 'Rate 34 more skills to unlock full career matches', href: '/assessment', cta: 'Continue', urgent: true },
  { icon: '📚', title: 'Start SQL Fundamentals', desc: 'Closes 2 skill gaps for Data Analyst', href: '/learning', cta: 'Start learning', urgent: false },
  { icon: '📄', title: 'Build your first resume', desc: 'AI will tailor it to UX Designer', href: '/resume', cta: 'Get started', urgent: false },
];

const recentActivity = [
  { icon: '⚡', text: 'Rated 12 skills in assessment', time: '2 hours ago' },
  { icon: '🚀', text: 'Unlocked 3 career matches', time: 'Yesterday' },
  { icon: '🏆', text: 'Earned "First Skills" badge', time: '3 days ago' },
];

export default function DashboardPage() {
  const completionPct = 46;
  const skillsRated = 66;
  const matchesFound = 12;
  const learningHours = 0;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
          Good morning, Alex 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>You&apos;re making progress. Here&apos;s where things stand.</p>
      </div>

      {/* Profile completion banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-teal-600) 0%, #0f766e 100%)', borderRadius: 16, padding: '24px 28px', marginBottom: 32, color: '#fff', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            Your profile is {completionPct}% complete
          </div>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 16 }}>Rate more skills to get better career matches</p>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
            <div style={{ width: `${completionPct}%`, height: '100%', background: '#fff', borderRadius: 8, transition: 'width 600ms ease-out' }} />
          </div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6 }}>{completionPct}% · Complete assessment to see all matches</div>
        </div>
        <Link href="/assessment" style={{ padding: '12px 24px', borderRadius: 10, background: '#fff', color: 'var(--color-teal-600)', fontWeight: 700, fontSize: 14, textDecoration: 'none', flexShrink: 0 }}>
          Continue Assessment →
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Skills Rated', value: skillsRated, total: 150, icon: '⚡', color: 'var(--color-teal-600)' },
          { label: 'Career Matches', value: matchesFound, total: null, icon: '🚀', color: 'var(--color-orange-500)' },
          { label: 'Learning Hours', value: learningHours, total: null, icon: '📚', color: '#7C3AED' },
          { label: 'Match Score', value: 84, total: 100, icon: '🎯', color: '#16a34a' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '20px 20px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, color: s.color, lineHeight: 1 }}>
              {s.value}{s.total ? <span style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-muted)' }}>/{s.total}</span> : null}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Next steps */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>Your Next Steps</h2>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {nextSteps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12, background: s.urgent ? 'rgba(249,115,22,0.06)' : 'var(--bg-page)', border: s.urgent ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent' }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <Link href={s.href} style={{ padding: '8px 14px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: s.urgent ? 'var(--color-orange-500)' : 'var(--color-teal-600)', color: '#fff', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {s.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Top career matches */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>Top Career Matches</h2>
              <Link href="/careers" style={{ fontSize: 13, color: 'var(--color-teal-600)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
            </div>
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentCareers.map((c, i) => (
                <Link key={i} href={`/careers/${c.title.toLowerCase().replace(/\s+/g, '-')}`} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderRadius: 12, textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-subtle)', transition: 'border-color 150ms' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: c.score >= 80 ? 'rgba(22,163,74,0.1)' : c.score >= 60 ? 'rgba(249,115,22,0.1)' : 'rgba(156,163,175,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 16, color: c.score >= 80 ? '#16a34a' : c.score >= 60 ? 'var(--color-orange-500)' : '#6B7280', flexShrink: 0 }}>
                    {c.score}%
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{c.industry} · {c.gap} skill {c.gap === 1 ? 'gap' : 'gaps'}</div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent activity */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>Recent Activity</h2>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 8px', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(13,148,136,0.06))', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { href: '/jobs', icon: '🔍', label: 'Browse job listings' },
                { href: '/community', icon: '💬', label: 'Ask the community' },
                { href: '/community#mentors', icon: '🤝', label: 'Find a mentor' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#fff', textDecoration: 'none', color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, border: '1px solid var(--border-subtle)' }}>
                  <span>{l.icon}</span> {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
