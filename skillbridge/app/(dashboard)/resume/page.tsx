'use client';

import { useState } from 'react';

const sampleResume = {
  name: 'Alex Johnson',
  email: 'alex@example.com',
  location: 'Chicago, IL',
  phone: '(312) 555-0182',
  summary: 'Empathetic communicator and seasoned facilitator transitioning to UX Design. 8+ years helping diverse groups understand complex topics — a skill set that maps directly to user research, stakeholder communication, and inclusive design. Currently completing Google UX Design Certificate.',
  experience: [
    {
      role: 'Senior Training Facilitator',
      company: 'United Way Chicago',
      dates: 'Jan 2019 – Present',
      bullets: [
        'Designed and facilitated 120+ workshops for groups of 10–80, achieving 94% satisfaction scores',
        'Led needs assessment interviews with 50+ community stakeholders to refine program curriculum',
        'Built a training measurement framework reducing onboarding time by 30%',
        'Managed cross-functional team of 4 coordinators and 12 volunteer trainers',
      ],
    },
    {
      role: 'Program Coordinator',
      company: 'Chicago Public Schools',
      dates: 'Aug 2015 – Dec 2018',
      bullets: [
        'Coordinated after-school programs serving 400+ students across 6 schools',
        'Conducted quarterly surveys and focus groups to improve program outcomes',
        'Created visual dashboards to present program data to board stakeholders',
      ],
    },
  ],
  education: [
    { degree: 'B.A. Communications', school: 'University of Illinois Chicago', year: 2015 },
    { degree: 'Google UX Design Certificate', school: 'Coursera', year: '(in progress)' },
  ],
  skills: ['Facilitation', 'Workshop Design', 'Stakeholder Interviews', 'Communication', 'Project Management', 'Data Analysis', 'Needs Assessment', 'Figma (learning)', 'Presentation Design'],
};

export default function ResumePage() {
  const [targetRole, setTargetRole] = useState('UX Designer');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [atsScore] = useState(82);
  const [tab, setTab] = useState<'edit' | 'preview'>('preview');

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 2200);
  }

  return (
    <div style={{ padding: '32px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>Resume Builder</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>AI tailors your resume for each target role, optimized for ATS systems.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* AI generator */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'linear-gradient(135deg, rgba(13,148,136,0.05), rgba(249,115,22,0.04))' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17 }}>🤖 AI Tailor</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>Rewrite for a specific role</p>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Target Role</label>
                <select
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid var(--border-default)', fontSize: 14, background: 'var(--bg-page)', outline: 'none' }}
                >
                  {['UX Designer', 'Product Manager', 'Data Analyst', 'Content Designer', 'UX Researcher'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating}
                style={{ padding: '12px', borderRadius: 10, fontWeight: 700, fontSize: 14, background: generating ? '#9CA3AF' : 'linear-gradient(135deg, var(--color-teal-600), #0f766e)', color: '#fff', border: 'none', cursor: generating ? 'not-allowed' : 'pointer' }}
              >
                {generating ? '✨ Rewriting…' : generated ? '✨ Re-generate' : '✨ Generate for ' + targetRole}
              </button>
              {generating && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                  Analyzing job requirements and your skills…
                </div>
              )}
            </div>
          </div>

          {/* ATS Score */}
          {generated && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '18px 20px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>ATS Score</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: atsScore >= 80 ? 'rgba(22,163,74,0.1)' : 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: atsScore >= 80 ? '#16a34a' : 'var(--color-orange-500)' }}>
                  {atsScore}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#16a34a' }}>Strong</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passes most ATS filters</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Keyword match', score: 88, color: '#16a34a' },
                  { label: 'Format clarity', score: 95, color: '#16a34a' },
                  { label: 'Skills alignment', score: 78, color: 'var(--color-orange-500)' },
                  { label: 'Impact language', score: 72, color: 'var(--color-orange-500)' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                      <span style={{ fontWeight: 600, color: s.color }}>{s.score}%</span>
                    </div>
                    <div style={{ background: 'var(--border-subtle)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                      <div style={{ width: `${s.score}%`, height: '100%', background: s.color, borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: '18px 20px' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Export</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{ padding: '10px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: 'pointer' }}>Download PDF</button>
              <button style={{ padding: '10px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: '#fff', color: 'var(--text-secondary)', border: '1.5px solid var(--border-default)', cursor: 'pointer' }}>Download DOCX</button>
              <button style={{ padding: '10px', borderRadius: 9, fontWeight: 600, fontSize: 13, background: '#fff', color: 'var(--text-secondary)', border: '1.5px solid var(--border-default)', cursor: 'pointer' }}>Copy Plain Text</button>
            </div>
          </div>
        </div>

        {/* Right: Resume preview */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 24px' }}>
            {(['preview', 'edit'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '14px 18px', fontSize: 14, fontWeight: tab === t ? 700 : 400, color: tab === t ? 'var(--color-teal-600)' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-teal-600)' : '2px solid transparent', textTransform: 'capitalize' }}>
                {t}
              </button>
            ))}
            {generated && (
              <span style={{ marginLeft: 'auto', padding: '12px 0', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
                ✓ AI-tailored for {targetRole}
              </span>
            )}
          </div>

          {/* Resume content */}
          <div style={{ padding: '32px 36px', fontFamily: 'Georgia, serif', maxHeight: 800, overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24, borderBottom: '2px solid #111', paddingBottom: 16 }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>{sampleResume.name}</h1>
              <div style={{ fontSize: 13, color: '#555', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>{sampleResume.email}</span>
                <span>{sampleResume.phone}</span>
                <span>{sampleResume.location}</span>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-teal-600)', marginBottom: 6 }}>Summary</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: '#333' }}>{sampleResume.summary}</p>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-teal-600)', marginBottom: 12 }}>Experience</h2>
              {sampleResume.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{exp.role}</span>
                      <span style={{ fontSize: 14, color: '#555' }}> · {exp.company}</span>
                    </div>
                    <span style={{ fontSize: 13, color: '#888' }}>{exp.dates}</span>
                  </div>
                  <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ fontSize: 13, lineHeight: 1.6, color: '#333', marginBottom: 3 }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Education */}
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-teal-600)', marginBottom: 10 }}>Education</h2>
              {sampleResume.education.map((edu, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{edu.degree}</span>
                    <span style={{ fontSize: 13, color: '#555' }}> · {edu.school}</span>
                  </div>
                  <span style={{ fontSize: 13, color: '#888' }}>{edu.year}</span>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-teal-600)', marginBottom: 8 }}>Skills</h2>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#333' }}>{sampleResume.skills.join(' · ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
