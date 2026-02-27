import Link from 'next/link';

const posts = [
  {
    id: '1',
    category: 'success-story',
    title: 'From 8th grade teacher to Lead UX at Duolingo — here\'s exactly what I did',
    author: { name: 'Marcus T.', avatar: 'MT', role: 'Lead UX Designer @ Duolingo' },
    target_career: 'UX Designer',
    upvotes: 284,
    replies: 47,
    time: '3 days ago',
    preview: 'After 9 years teaching, I decided I wanted to design learning experiences rather than deliver them. The skills that carried me: facilitation, empathy, and knowing how adults learn differently...',
  },
  {
    id: '2',
    category: 'question',
    title: 'Is a bootcamp worth it if I already have the Google UX Certificate?',
    author: { name: 'Sarah K.', avatar: 'SK', role: 'Former Marketing Manager' },
    target_career: 'UX Designer',
    upvotes: 52,
    replies: 28,
    time: '1 day ago',
    preview: 'I\'m 6 weeks into the Google cert and loving it. My employer won\'t pay for more. Should I spend $10K on a bootcamp or build my portfolio instead?',
  },
  {
    id: '3',
    category: 'resource',
    title: 'Free UX portfolio template + 50 case study prompts that got me 3 interviews',
    author: { name: 'James O.', avatar: 'JO', role: 'UX Designer @ IBM' },
    target_career: 'UX Designer',
    upvotes: 419,
    replies: 63,
    time: '1 week ago',
    preview: 'I spent 3 months figuring out what recruiters actually want in a portfolio. Here\'s the framework and prompts I used...',
  },
  {
    id: '4',
    category: 'advice',
    title: 'How I got a $22K salary bump by telling my PM story as a "systems thinker"',
    author: { name: 'Priya K.', avatar: 'PK', role: 'PM @ Salesforce' },
    target_career: 'Product Manager',
    upvotes: 187,
    replies: 31,
    time: '4 days ago',
    preview: 'The reframe that changed everything in my interviews: stop saying "I have no tech background" and start saying "I bring cross-functional systems thinking"...',
  },
];

const mentors = [
  { name: 'Rachel M.', from: 'High School Teacher', to: 'Senior UX Designer', company: 'Google', years: 2, available: true, expertise: ['UX Design', 'Portfolio Review', 'Career Change'], rating: 4.9, avatar: 'RM' },
  { name: 'David L.', from: 'Nurse', to: 'Health Tech PM', company: 'Oscar Health', years: 3, available: true, expertise: ['Health Tech', 'Product Management', 'Interview Prep'], rating: 4.8, avatar: 'DL' },
  { name: 'Aisha B.', from: 'Journalist', to: 'Content Designer', company: 'Spotify', years: 1, available: false, expertise: ['Content Design', 'UX Writing', 'Portfolio'], rating: 5.0, avatar: 'AB' },
];

const categoryConfig: Record<string, { label: string; color: string; bg: string }> = {
  'success-story': { label: '🎉 Success Story', color: '#16a34a', bg: 'rgba(22,163,74,0.08)' },
  'question': { label: '❓ Question', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  'resource': { label: '📎 Resource', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  'advice': { label: '💡 Advice', color: 'var(--color-orange-500)', bg: 'rgba(249,115,22,0.08)' },
};

export default function CommunityPage() {
  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Community</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Stories, questions, and advice from 12,000+ career-changers like you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Posts */}
        <div>
          {/* Tab bar + compose */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            {['All', 'Success Stories', 'Questions', 'Resources', 'Advice'].map(t => (
              <button key={t} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: t === 'All' ? 600 : 400, border: '1.5px solid ' + (t === 'All' ? 'var(--color-teal-600)' : 'var(--border-default)'), background: t === 'All' ? 'var(--color-teal-600)' : '#fff', color: t === 'All' ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}>{t}</button>
            ))}
            <button style={{ marginLeft: 'auto', padding: '8px 18px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
              + Post
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {posts.map(post => {
              const cat = categoryConfig[post.category];
              return (
                <div key={post.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '20px 24px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    {/* Author avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                      {post.author.avatar}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{post.author.name}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{post.author.role}</span>
                        <span style={{ fontSize: 11, background: cat.bg, color: cat.color, fontWeight: 700, padding: '2px 8px', borderRadius: 8 }}>{cat.label}</span>
                        {post.target_career && (
                          <span style={{ fontSize: 11, background: 'rgba(13,148,136,0.08)', color: 'var(--color-teal-600)', padding: '2px 8px', borderRadius: 8 }}>→ {post.target_career}</span>
                        )}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, margin: '0 0 6px', lineHeight: 1.3 }}>{post.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 10px' }}>{post.preview}</p>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, padding: 0 }}>
                          ↑ {post.upvotes}
                        </button>
                        <span>💬 {post.replies} replies</span>
                        <span>{post.time}</span>
                        <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-teal-600)', fontWeight: 600, padding: 0 }}>Read more →</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Mentors */}
        <div id="mentors" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>🤝 Mentors</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>People who made your exact transition</p>
            </div>
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mentors.map(m => (
                <div key={m.name} style={{ padding: 16, borderRadius: 14, border: '1px solid var(--border-subtle)', opacity: m.available ? 1 : 0.65 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>
                      {m.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {m.from} → <strong style={{ color: 'var(--color-teal-600)' }}>{m.to}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.company} · {m.years}y in role</div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#CA8A04' }}>★ {m.rating}</div>
                      <div style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: m.available ? '#d1fae5' : '#f3f4f6', color: m.available ? '#16a34a' : '#9CA3AF', fontWeight: 700, marginTop: 3 }}>
                        {m.available ? 'Available' : 'Full'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                    {m.expertise.slice(0, 2).map(e => (
                      <span key={e} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 8, background: 'rgba(13,148,136,0.08)', color: 'var(--color-teal-600)', fontWeight: 600 }}>{e}</span>
                    ))}
                  </div>
                  {m.available && (
                    <button style={{ width: '100%', padding: '9px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      Request a session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trending topics */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Trending Topics</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Portfolio building', 'Salary negotiation', 'First UX job', 'SQL for non-techies', 'Interview prep', 'Networking tips'].map(t => (
                <button key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '7px 0', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', fontWeight: 400 }}>
                  <span>#{t}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
