import Link from 'next/link';

const activePath = {
  career: 'UX Designer',
  totalHours: 300,
  completedHours: 42,
  steps: [
    { id: '1', step: 1, title: 'Figma Fundamentals', type: 'Course', provider: 'Google', hours: 20, free: true, skill: 'Figma', status: 'completed', url: '#' },
    { id: '2', step: 2, title: 'Google UX Design Certificate', type: 'Certificate', provider: 'Coursera', hours: 180, free: false, skill: 'User Research', status: 'in_progress', progress: 18, url: '#' },
    { id: '3', step: 3, title: 'Design a Portfolio Project', type: 'Project', provider: 'Self-directed', hours: 40, free: true, skill: 'Prototyping', status: 'locked', url: '#' },
    { id: '4', step: 4, title: 'Usability Testing Masterclass', type: 'Course', provider: 'Nielsen Norman', hours: 25, free: false, skill: 'Usability Testing', status: 'locked', url: '#' },
    { id: '5', step: 5, title: 'Nielsen Norman UX Certification', type: 'Certification', provider: 'NN/g', hours: 60, free: false, skill: 'UX Strategy', status: 'locked', url: '#' },
  ],
};

const recommended = [
  { title: 'Interaction Design Foundation', provider: 'IDF', price: 0, hours: 30, skills: ['UX Research', 'Interaction Design'], rating: 4.8, reviews: 12000 },
  { title: 'Adobe XD for Beginners', provider: 'YouTube', price: 0, hours: 8, skills: ['Prototyping'], rating: 4.6, reviews: 45000 },
  { title: 'User Research & Design Thinking', provider: 'edX', price: 149, hours: 48, skills: ['User Research', 'Design Thinking'], rating: 4.7, reviews: 8500 },
];

export default function LearningPage() {
  const progressPct = Math.round((activePath.completedHours / activePath.totalHours) * 100);
  const statusColors = { completed: '#16a34a', in_progress: 'var(--color-teal-600)', locked: '#9CA3AF' };
  const statusLabels = { completed: '✓ Done', in_progress: '▶ Active', locked: '🔒' };

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Learning Plan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Your personalized path to {activePath.career}. Follow in order for fastest results.</p>
      </div>

      {/* Progress card */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-teal-600), #0f766e)', borderRadius: 18, padding: '28px 32px', marginBottom: 32, color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Learning path for</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 24, marginBottom: 16 }}>{activePath.career}</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 8, width: 300, overflow: 'hidden' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: '#fff', borderRadius: 8 }} />
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
              {activePath.completedHours}h completed of {activePath.totalHours}h total ({progressPct}%)
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 40, lineHeight: 1 }}>{activePath.totalHours - activePath.completedHours}h</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>remaining</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>~{Math.round((activePath.totalHours - activePath.completedHours) / 5)} weeks at 5h/week</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Learning path steps */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>Your Path Steps</h2>
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activePath.steps.map((step, i) => {
              const isLast = i === activePath.steps.length - 1;
              const isActive = step.status === 'in_progress';
              return (
                <div key={step.id} style={{ display: 'flex', gap: 16, paddingBottom: isLast ? 0 : 20, position: 'relative' }}>
                  {!isLast && (
                    <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 'calc(100% - 20px)', background: step.status === 'completed' ? '#d1fae5' : 'var(--border-subtle)' }} />
                  )}
                  {/* Step indicator */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    background: step.status === 'completed' ? '#16a34a' : step.status === 'in_progress' ? 'var(--color-teal-600)' : 'var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: step.status === 'locked' ? '#9CA3AF' : '#fff',
                    fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15
                  }}>
                    {step.status === 'completed' ? '✓' : step.status === 'locked' ? '🔒' : step.step}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, paddingTop: 4, opacity: step.status === 'locked' ? 0.55 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{step.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColors[step.status as keyof typeof statusColors], background: step.status === 'completed' ? '#d1fae5' : step.status === 'in_progress' ? 'rgba(13,148,136,0.1)' : '#f3f4f6', padding: '2px 8px', borderRadius: 8 }}>
                        {statusLabels[step.status as keyof typeof statusLabels]}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: isActive ? 10 : 0 }}>
                      {step.type} · {step.provider} · {step.hours}h · {step.free ? '🆓 Free' : '💳 Paid'}
                    </div>
                    {isActive && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <div style={{ background: 'var(--border-subtle)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${step.progress}%`, height: '100%', background: 'var(--color-teal-600)', borderRadius: 4 }} />
                        </div>
                        <a href={step.url} style={{ display: 'inline-block', marginTop: 10, padding: '8px 16px', borderRadius: 8, background: 'var(--color-teal-600)', color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                          Continue →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16 }}>Recommended Extras</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Boost your profile faster</p>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recommended.map((c, i) => (
                <div key={i} style={{ padding: '14px', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                    {c.provider} · {c.hours}h · {c.price === 0 ? '🆓 Free' : `$${c.price}`}
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {c.skills.map(s => (
                      <span key={s} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 8, background: 'rgba(13,148,136,0.08)', color: 'var(--color-teal-600)', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly goal */}
          <div style={{ background: 'rgba(249,115,22,0.06)', borderRadius: 16, border: '1px solid rgba(249,115,22,0.15)', padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 12, color: 'var(--color-orange-500)' }}>🎯 This Week&apos;s Goal</h3>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, color: 'var(--color-orange-500)', lineHeight: 1 }}>5h</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, marginBottom: 12 }}>Google UX Design Certificate</div>
            <div style={{ background: 'rgba(249,115,22,0.1)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
              <div style={{ width: '36%', height: '100%', background: 'var(--color-orange-500)', borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>1.8h done · 3.2h to go</div>
          </div>
        </div>
      </div>
    </div>
  );
}
