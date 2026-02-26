'use client';

import { useState } from 'react';

const skillsByCategory: Record<string, { name: string; level: number; transferable: boolean; years: number }[]> = {
  Communication: [
    { name: 'Public Speaking', level: 4, transferable: true, years: 8 },
    { name: 'Copywriting', level: 3, transferable: true, years: 5 },
    { name: 'Active Listening', level: 5, transferable: true, years: 10 },
    { name: 'Presentation Design', level: 3, transferable: true, years: 4 },
  ],
  Leadership: [
    { name: 'Project Management', level: 4, transferable: true, years: 6 },
    { name: 'Facilitation', level: 4, transferable: true, years: 7 },
    { name: 'Negotiation', level: 3, transferable: true, years: 4 },
    { name: 'Mentoring', level: 3, transferable: true, years: 3 },
  ],
  Analytics: [
    { name: 'Data Analysis', level: 3, transferable: true, years: 4 },
    { name: 'Financial Modeling', level: 2, transferable: true, years: 2 },
    { name: 'Research', level: 4, transferable: true, years: 6 },
  ],
  Technical: [
    { name: 'SQL', level: 1, transferable: false, years: 0 },
    { name: 'Python', level: 1, transferable: false, years: 0 },
    { name: 'Excel/Sheets', level: 3, transferable: true, years: 5 },
  ],
  'Soft Skills': [
    { name: 'Customer Empathy', level: 5, transferable: true, years: 10 },
    { name: 'Adaptability', level: 4, transferable: true, years: 8 },
    { name: 'Critical Thinking', level: 4, transferable: true, years: 7 },
  ],
};

const levelLabel = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
const levelColor = ['', '#9CA3AF', '#F97316', '#EAB308', '#0D9488', '#7C3AED'];
const levelBg = ['', '#f9fafb', '#fff7ed', '#fefce8', '#f0fdfa', '#f5f3ff'];

export default function SkillsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Object.keys(skillsByCategory)];
  const totalSkills = Object.values(skillsByCategory).flat().length;
  const strongSkills = Object.values(skillsByCategory).flat().filter(s => s.level >= 4).length;
  const transferableSkills = Object.values(skillsByCategory).flat().filter(s => s.transferable).length;

  const displayCategories = selectedCategory === 'All' ? Object.entries(skillsByCategory) : [[selectedCategory, skillsByCategory[selectedCategory] ?? []] as [string, typeof skillsByCategory[string]]];

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>My Skills Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Your mapped abilities across all categories. These power your career matches.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        {[
          { label: 'Total Skills', value: totalSkills, color: 'var(--color-teal-600)' },
          { label: 'Strong (4–5)', value: strongSkills, color: '#7C3AED' },
          { label: 'Transferable', value: transferableSkills, color: '#16a34a' },
          { label: 'To Develop', value: totalSkills - transferableSkills, color: 'var(--color-orange-500)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 32, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Radar-like visual summary */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '24px', border: '1px solid var(--border-subtle)', marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, marginBottom: 16 }}>Skill Strength by Category</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(skillsByCategory).map(([cat, skills]) => {
            const avg = skills.reduce((a, b) => a + b.level, 0) / skills.length;
            const pct = (avg / 5) * 100;
            const color = pct >= 70 ? 'var(--color-teal-600)' : pct >= 50 ? 'var(--color-orange-500)' : '#9CA3AF';
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 130, fontSize: 13, fontWeight: 500, flexShrink: 0 }}>{cat}</span>
                <div style={{ flex: 1, background: 'var(--border-subtle)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 600ms ease-out' }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color, width: 36, textAlign: 'right', flexShrink: 0 }}>{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 500, border: '1.5px solid ' + (selectedCategory === c ? 'var(--color-teal-600)' : 'var(--border-default)'), background: selectedCategory === c ? 'var(--color-teal-600)' : '#fff', color: selectedCategory === c ? '#fff' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      {displayCategories.map(([category, skills]) => (
        <div key={category} style={{ marginBottom: 28 }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 12 }}>
            {category}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {skills.map(skill => (
              <div key={skill.name} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
                {skill.transferable && (
                  <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderRadius: 6, padding: '2px 6px', fontWeight: 700 }}>
                    TRANSFERABLE
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, paddingRight: skill.transferable ? 80 : 0 }}>{skill.name}</div>
                {/* Level bar */}
                <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: 5, borderRadius: 4, background: i <= skill.level ? levelColor[skill.level] : 'var(--border-subtle)' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: levelColor[skill.level], background: levelBg[skill.level], padding: '2px 8px', borderRadius: 8 }}>
                    {levelLabel[skill.level]}
                  </span>
                  {skill.years > 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{skill.years}y exp</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add skill CTA */}
      <div style={{ background: 'rgba(13,148,136,0.06)', borderRadius: 16, border: '1.5px dashed rgba(13,148,136,0.3)', padding: '20px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>➕</div>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Missing a skill?</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Add skills manually or continue the assessment to discover more.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button style={{ padding: '9px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, background: 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>Add Skill</button>
          <a href="/assessment" style={{ padding: '9px 20px', borderRadius: 10, fontWeight: 600, fontSize: 14, border: '1.5px solid var(--border-default)', color: 'var(--text-primary)', textDecoration: 'none', background: '#fff' }}>Continue Assessment</a>
        </div>
      </div>
    </div>
  );
}
