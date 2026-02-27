const badges = [
  { id: '1', icon: '⚡', title: 'First Skills', desc: 'Rated your first 10 skills', earned: true, earned_at: '3 days ago', xp: 50 },
  { id: '2', icon: '🎯', title: 'Career Seeker', desc: 'Viewed 5 career matches', earned: true, earned_at: '2 days ago', xp: 75 },
  { id: '3', icon: '📚', title: 'Lifelong Learner', desc: 'Started your first course', earned: true, earned_at: 'Yesterday', xp: 100 },
  { id: '4', icon: '🔥', title: '7-Day Streak', desc: 'Logged in 7 days in a row', earned: false, earned_at: null, xp: 150 },
  { id: '5', icon: '💼', title: 'Job Ready', desc: 'Applied to 3 jobs', earned: false, earned_at: null, xp: 200 },
  { id: '6', icon: '📄', title: 'Resume Master', desc: 'Generated an AI resume', earned: false, earned_at: null, xp: 125 },
  { id: '7', icon: '🤝', title: 'Community Member', desc: 'Made your first post', earned: false, earned_at: null, xp: 75 },
  { id: '8', icon: '🏆', title: 'Career Changer', desc: 'Applied to your target role', earned: false, earned_at: null, xp: 500 },
];

const milestones = [
  { date: '3 days ago', icon: '🎉', title: 'Joined SkillBridge', detail: 'Started your career transition journey' },
  { date: '3 days ago', icon: '⚡', title: 'Rated 66 skills', detail: 'Assessment 46% complete' },
  { date: '2 days ago', icon: '🚀', title: 'Discovered career matches', detail: 'Top match: UX Designer (84%)' },
  { date: 'Yesterday', icon: '📚', title: 'Started Google UX Certificate', detail: 'Coursera · 18% complete' },
  { date: 'Yesterday', icon: '🏅', title: 'Earned 3 badges', detail: 'First Skills, Career Seeker, Lifelong Learner' },
];

export default function ProgressPage() {
  const earnedBadges = badges.filter(b => b.earned);
  const totalXp = earnedBadges.reduce((a, b) => a + b.xp, 0);
  const level = Math.floor(totalXp / 200) + 1;
  const levelXp = totalXp % 200;
  const levelMax = 200;

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Your Progress</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Every step forward counts. Here&apos;s what you&apos;ve accomplished.</p>
      </div>

      {/* XP / Level card */}
      <div style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', borderRadius: 18, padding: '28px 32px', marginBottom: 32, color: '#fff', display: 'flex', gap: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>Current Level</div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 56, lineHeight: 1 }}>Lv.{level}</div>
          <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Career Explorer</div>
        </div>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, opacity: 0.85, marginBottom: 6 }}>
            <span>{totalXp} XP total</span>
            <span>{levelXp}/{levelMax} to Level {level + 1}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, height: 12, overflow: 'hidden' }}>
            <div style={{ width: `${(levelXp / levelMax) * 100}%`, height: '100%', background: '#fff', borderRadius: 8, transition: 'width 800ms ease-out' }} />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
            {[
              { label: 'Badges earned', value: earnedBadges.length },
              { label: 'Skills rated', value: 66 },
              { label: 'Days active', value: 3 },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Badges */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Badges</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
            {badges.map(badge => (
              <div key={badge.id} style={{ background: badge.earned ? '#fff' : '#f9fafb', borderRadius: 16, padding: '20px 16px', border: '1px solid var(--border-subtle)', textAlign: 'center', opacity: badge.earned ? 1 : 0.5, position: 'relative', overflow: 'hidden' }}>
                {badge.earned && (
                  <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, background: 'rgba(22,163,74,0.1)', color: '#16a34a', padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>EARNED</div>
                )}
                <div style={{ fontSize: badge.earned ? 40 : 34, marginBottom: 8, filter: badge.earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{badge.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 6 }}>{badge.desc}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED' }}>+{badge.xp} XP</div>
                {badge.earned && badge.earned_at && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{badge.earned_at}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, marginBottom: 20 }}>Journey Timeline</h2>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '20px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {milestones.map((m, i) => {
                const isLast = i === milestones.length - 1;
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: isLast ? 0 : 18, position: 'relative' }}>
                    {!isLast && (
                      <div style={{ position: 'absolute', left: 19, top: 38, width: 2, height: 'calc(100% - 16px)', background: 'var(--border-subtle)' }} />
                    )}
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(13,148,136,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                      {m.icon}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{m.detail}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{m.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next milestone */}
          <div style={{ marginTop: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 16, border: '1px solid rgba(249,115,22,0.15)', padding: '18px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 10, color: 'var(--color-orange-500)' }}>🔥 Next Milestone</h3>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Complete your assessment</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Rate 84 more skills to unlock all career matches and earn the <strong>Skills Master</strong> badge.
            </p>
            <a href="/assessment" style={{ display: 'inline-block', padding: '9px 20px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-orange-500)', color: '#fff', textDecoration: 'none' }}>
              Continue assessment →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
