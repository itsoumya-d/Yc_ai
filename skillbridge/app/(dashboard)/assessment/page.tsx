'use client';

import { useState } from 'react';

type SkillCard = {
  name: string;
  category: string;
  description: string;
};

const skillDeck: SkillCard[] = [
  { name: 'Public Speaking', category: 'Communication', description: 'Presenting ideas confidently to groups' },
  { name: 'Data Analysis', category: 'Analytics', description: 'Interpreting data to find patterns and insights' },
  { name: 'Project Management', category: 'Leadership', description: 'Coordinating tasks, timelines, and teams' },
  { name: 'User Research', category: 'Design', description: 'Gathering and synthesizing user feedback' },
  { name: 'SQL', category: 'Technical', description: 'Querying databases to extract information' },
  { name: 'Copywriting', category: 'Communication', description: 'Writing persuasive and clear content' },
  { name: 'Negotiation', category: 'Leadership', description: 'Reaching mutually beneficial agreements' },
  { name: 'Python', category: 'Technical', description: 'Programming and automation with Python' },
  { name: 'Customer Empathy', category: 'Soft Skills', description: 'Understanding customer needs and pain points' },
  { name: 'Financial Modeling', category: 'Analytics', description: 'Building models to analyze financial data' },
  { name: 'Facilitation', category: 'Leadership', description: 'Leading meetings and workshops effectively' },
  { name: 'UI Design', category: 'Design', description: 'Creating visual interfaces for digital products' },
];

const levelLabels = ['Not me', 'A little', 'Solid', 'Strong', 'Expert'];
const levelColors = ['#EF4444', '#F97316', '#EAB308', '#0D9488', '#7C3AED'];

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [complete, setComplete] = useState(false);

  const currentSkill = skillDeck[currentIndex];
  const progress = (currentIndex / skillDeck.length) * 100;

  function rate(level: number) {
    if (animating) return;
    setRatings(prev => ({ ...prev, [currentSkill.name]: level }));
    setAnimating(level >= 2 ? 'right' : 'left');
    setTimeout(() => {
      setAnimating(null);
      if (currentIndex + 1 >= skillDeck.length) {
        setComplete(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 350);
  }

  function skip() {
    if (animating) return;
    setAnimating('left');
    setTimeout(() => {
      setAnimating(null);
      if (currentIndex + 1 >= skillDeck.length) {
        setComplete(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
    }, 280);
  }

  if (complete) {
    const ratedCount = Object.keys(ratings).length;
    const strongSkills = Object.entries(ratings).filter(([, v]) => v >= 3).map(([k]) => k);
    return (
      <div style={{ padding: '60px 32px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        {/* Confetti effect via CSS */}
        <style>{`
          @keyframes confetti-pop { 0%{transform:scale(0) rotate(0deg);opacity:0} 60%{transform:scale(1.3) rotate(15deg);opacity:1} 100%{transform:scale(1) rotate(0deg);opacity:1} }
          .badge-pop { animation: confetti-pop 600ms cubic-bezier(.34,1.56,.64,1) forwards; }
        `}</style>
        <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
        <h1 className="badge-pop" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 36, marginBottom: 12 }}>
          Assessment Complete!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 18, marginBottom: 32 }}>
          You rated <strong>{ratedCount} skills</strong>. We found{' '}
          <strong style={{ color: 'var(--color-teal-600)' }}>{strongSkills.length} strong skills</strong> to build your career path.
        </p>
        {strongSkills.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid var(--border-subtle)', marginBottom: 28, textAlign: 'left' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Your Strongest Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strongSkills.map(s => (
                <span key={s} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(13,148,136,0.1)', color: 'var(--color-teal-600)', fontSize: 13, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/careers" style={{ padding: '14px 32px', borderRadius: 12, fontWeight: 700, fontSize: 16, background: 'var(--color-teal-600)', color: '#fff', textDecoration: 'none' }}>
            See My Career Matches →
          </a>
          <button onClick={() => { setComplete(false); setCurrentIndex(0); setRatings({}); }} style={{ padding: '14px 24px', borderRadius: 12, fontWeight: 600, fontSize: 16, border: '1.5px solid var(--border-default)', background: '#fff', cursor: 'pointer' }}>
            Redo Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', maxWidth: 700, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Skills Assessment</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Rate each skill honestly. The AI uses this to find your best career matches.</p>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{currentIndex} of {skillDeck.length} skills</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-teal-600)' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ background: 'var(--border-subtle)', borderRadius: 8, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-teal-600), var(--color-orange-500))', borderRadius: 8, transition: 'width 400ms ease-out' }} />
        </div>
      </div>

      {/* Skill card */}
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '48px 40px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        transform: animating === 'right' ? 'translateX(120px) rotate(6deg)' : animating === 'left' ? 'translateX(-120px) rotate(-6deg)' : 'none',
        opacity: animating ? 0 : 1,
        transition: 'transform 320ms ease-in, opacity 280ms ease-in',
        marginBottom: 32,
      }}>
        {/* Category badge */}
        <span style={{ display: 'inline-block', padding: '5px 14px', borderRadius: 20, background: 'rgba(13,148,136,0.1)', color: 'var(--color-teal-600)', fontSize: 12, fontWeight: 700, marginBottom: 24, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {currentSkill.category}
        </span>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 38, marginBottom: 12, lineHeight: 1.1 }}>
          {currentSkill.name}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.5, maxWidth: 380, margin: '0 auto 36px' }}>
          {currentSkill.description}
        </p>

        {/* Rating buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {levelLabels.map((label, i) => {
            const level = i; // 0-4
            const isHovered = hoveredLevel === level;
            return (
              <button
                key={label}
                onClick={() => rate(level)}
                onMouseEnter={() => setHoveredLevel(level)}
                onMouseLeave={() => setHoveredLevel(null)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  border: `2px solid ${isHovered ? levelColors[i] : 'var(--border-default)'}`,
                  background: isHovered ? levelColors[i] + '15' : '#fff',
                  color: isHovered ? levelColors[i] : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  minWidth: 90,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skip / card count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={skip}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
        >
          Skip this skill →
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {Array.from({ length: Math.min(5, skillDeck.length - currentIndex) }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--color-teal-600)' : 'var(--border-default)' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {Object.keys(ratings).length} rated
        </div>
      </div>

      {/* Category breakdown */}
      {currentIndex > 0 && (
        <div style={{ marginTop: 40, background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Ratings so far</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.entries(ratings).map(([skill, level]) => (
              <span key={skill} style={{ padding: '4px 12px', borderRadius: 16, fontSize: 12, fontWeight: 600, background: levelColors[level] + '18', color: levelColors[level] }}>
                {skill} · {levelLabels[level]}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
