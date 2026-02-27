import Link from 'next/link';

const frameworks = [
  { name: 'SOC 2 Type II', slug: 'soc2', score: 82, controls: 116, passing: 95, failing: 8, color: '#7C3AED', deadline: '2025-09-30' },
  { name: 'ISO 27001', slug: 'iso27001', score: 71, controls: 93, passing: 66, failing: 18, color: '#0369A1', deadline: '2025-12-15' },
  { name: 'HIPAA', slug: 'hipaa', score: 88, controls: 42, passing: 37, failing: 5, color: '#0F766E', deadline: null },
];

const criticalGaps = [
  { id: 'cc6.1', control: 'CC6.1', title: 'Logical Access Controls', framework: 'SOC 2', severity: 'critical', days_overdue: 12 },
  { id: 'a.9.4.2', control: 'A.9.4.2', title: 'Secure log-on procedures', framework: 'ISO 27001', severity: 'high', days_overdue: 5 },
  { id: 'a.12.3.1', control: 'A.12.3.1', title: 'Information backup', framework: 'ISO 27001', severity: 'high', days_overdue: 0 },
];

const upcomingDeadlines = [
  { title: 'Annual Security Training', due: '15 days', owner: 'HR Team', framework: 'SOC 2' },
  { title: 'Penetration Test Report', due: '23 days', owner: 'Security', framework: 'SOC 2' },
  { title: 'Risk Assessment Review', due: '31 days', owner: 'CISO', framework: 'ISO 27001' },
];

const recentActivity = [
  { icon: '✅', text: 'Evidence uploaded for CC7.2 — Malware Protection', time: '30 min ago', severity: null },
  { icon: '🔴', text: 'New gap detected: MFA not enforced on staging', time: '2 hours ago', severity: 'critical' },
  { icon: '📄', text: 'Access Control Policy v3 approved', time: '4 hours ago', severity: null },
  { icon: '⚙️', text: 'AWS integration scan completed — 3 findings', time: 'Yesterday', severity: 'high' },
];

function ScoreRing({ score, size = 80, color }: { score: number; size?: number; color: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 800ms ease-out' }}
      />
    </svg>
  );
}

export default function DashboardPage() {
  const overallScore = Math.round(frameworks.reduce((a, f) => a + f.score, 0) / frameworks.length);

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontWeight: 800, fontSize: 26, marginBottom: 4 }}>Compliance Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          {criticalGaps.filter(g => g.severity === 'critical').length} critical issues require immediate attention
        </p>
      </div>

      {/* Critical gaps banner */}
      {criticalGaps.some(g => g.severity === 'critical') && (
        <div style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', borderLeft: '4px solid var(--severity-critical)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <span style={{ fontWeight: 700, color: 'var(--severity-critical)', fontSize: 14 }}>🔴 Critical Action Required</span>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)', marginLeft: 12 }}>
              {criticalGaps.filter(g => g.severity === 'critical').length} critical control{criticalGaps.filter(g => g.severity === 'critical').length > 1 ? 's' : ''} failing — SOC 2 audit is in {Math.ceil((new Date('2025-09-30').getTime() - Date.now()) / 86400000)} days
            </span>
          </div>
          <Link href="/gap-analysis" style={{ padding: '8px 16px', borderRadius: 8, fontWeight: 600, fontSize: 13, background: 'var(--severity-critical)', color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
            View Gaps →
          </Link>
        </div>
      )}

      {/* Overall score + frameworks */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, marginBottom: 24 }}>
        {/* Overall score */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 12 }}>
            <ScoreRing score={overallScore} size={90} color={overallScore >= 80 ? '#059669' : overallScore >= 60 ? '#D97706' : '#DC2626'} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 22, color: overallScore >= 80 ? '#059669' : '#D97706' }}>{overallScore}%</span>
            </div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Overall Score</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Across 3 frameworks</div>
        </div>

        {/* Framework cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {frameworks.map(fw => (
            <Link key={fw.slug} href={`/frameworks/${fw.slug}`} style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border-subtle)', padding: '20px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'box-shadow 150ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{fw.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{fw.controls} controls</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 22, color: fw.score >= 80 ? '#059669' : fw.score >= 60 ? '#D97706' : '#DC2626' }}>
                  {fw.score}%
                </div>
              </div>
              <div style={{ background: 'var(--border-subtle)', borderRadius: 4, height: 6, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ width: `${fw.score}%`, height: '100%', background: fw.color, borderRadius: 4, transition: 'width 600ms ease-out' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>✓ {fw.passing} passing</span>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>✗ {fw.failing} failing</span>
              </div>
              {fw.deadline && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Audit: {new Date(fw.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Critical gaps */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontWeight: 700, fontSize: 16 }}>Critical Gaps</h2>
            <Link href="/gap-analysis" style={{ fontSize: 13, color: 'var(--color-trust-600)', textDecoration: 'none', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {criticalGaps.map(gap => (
              <div key={gap.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px', borderRadius: 10, background: gap.severity === 'critical' ? 'rgba(220,38,38,0.04)' : 'var(--bg-page)', borderLeft: `3px solid ${gap.severity === 'critical' ? 'var(--severity-critical)' : 'var(--severity-high)'}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{gap.control}</span>
                    <span className={`severity-${gap.severity}`} style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 6, textTransform: 'uppercase' }}>{gap.severity}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{gap.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{gap.framework}</div>
                </div>
                {gap.days_overdue > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', textAlign: 'right', flexShrink: 0 }}>
                    {gap.days_overdue}d<br />
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>overdue</span>
                  </div>
                )}
                <Link href={`/controls/${gap.id}`} style={{ padding: '7px 14px', borderRadius: 8, fontWeight: 600, fontSize: 12, background: 'var(--color-trust-600)', color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
                  Fix →
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Upcoming deadlines */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Upcoming Deadlines</h2>
            </div>
            <div style={{ padding: '8px 12px' }}>
              {upcomingDeadlines.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '11px 6px', borderBottom: i < upcomingDeadlines.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--color-trust-100)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-trust-700)', lineHeight: 1 }}>{d.due.split(' ')[0]}</div>
                    <div style={{ fontSize: 9, color: 'var(--color-trust-600)', fontWeight: 600 }}>days</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.owner} · {d.framework}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontWeight: 700, fontSize: 16 }}>Recent Activity</h2>
            </div>
            <div style={{ padding: '4px 12px 8px' }}>
              {recentActivity.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 6px', borderBottom: i < recentActivity.length - 1 ? '1px solid var(--border-subtle)' : 'none', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
