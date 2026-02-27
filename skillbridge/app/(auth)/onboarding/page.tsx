'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const careers = ['UX Designer', 'Product Manager', 'Data Analyst', 'Software Engineer', 'Content Designer', 'UX Researcher', 'Marketing Manager', 'Business Analyst', 'Project Manager', 'Instructional Designer'];
const fromRoles = ['Teacher / Educator', 'Healthcare Worker', 'Military / Government', 'Sales / Account Manager', 'Administrative / Ops', 'Finance / Accounting', 'Journalism / Media', 'Retail / Hospitality', 'Engineering / Technical', 'Other'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    from_role: '',
    target_career: '',
    timeline: '',
    motivation: '',
  });

  function next() {
    if (step < 4) setStep(s => s + 1);
    else router.push('/assessment');
  }

  const steps = [
    { title: 'Where are you coming from?', sub: 'Your current or most recent background' },
    { title: 'Where do you want to go?', sub: 'Your dream career direction' },
    { title: 'How soon do you want to transition?', sub: 'We\'ll pace your learning plan accordingly' },
    { title: 'What\'s driving this change?', sub: 'Helps us personalize your path and community matches' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '10%', right: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge</span>
        </div>

        {/* Step progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 36 }}>
          {[1, 2, 3, 4].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? 'var(--color-teal-600)' : 'var(--border-subtle)', transition: 'background 300ms' }} />
          ))}
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: '40px 40px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-teal-600)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Step {step} of 4
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>{steps[step - 1].title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 28 }}>{steps[step - 1].sub}</p>

          {/* Step 1: From role */}
          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {fromRoles.map(r => (
                <button
                  key={r}
                  onClick={() => setData(d => ({ ...d, from_role: r }))}
                  style={{ padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, border: '2px solid ' + (data.from_role === r ? 'var(--color-teal-600)' : 'var(--border-default)'), background: data.from_role === r ? 'rgba(13,148,136,0.08)' : '#fff', color: data.from_role === r ? 'var(--color-teal-600)' : 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Target career */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {careers.map(c => (
                <button
                  key={c}
                  onClick={() => setData(d => ({ ...d, target_career: c }))}
                  style={{ padding: '12px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500, border: '2px solid ' + (data.target_career === c ? 'var(--color-teal-600)' : 'var(--border-default)'), background: data.target_career === c ? 'rgba(13,148,136,0.08)' : '#fff', color: data.target_career === c ? 'var(--color-teal-600)' : 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          {/* Step 3: Timeline */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: '3', label: 'As soon as possible', sub: 'Within 3 months — intensive focus' },
                { value: '6', label: 'Within 6 months', sub: 'Part-time, ~10 hours/week' },
                { value: '12', label: 'Within a year', sub: 'Steady pace, ~5 hours/week' },
                { value: '24', label: 'No rush', sub: 'Exploring, ~2–3 hours/week' },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setData(d => ({ ...d, timeline: t.value }))}
                  style={{ padding: '16px 18px', borderRadius: 12, border: '2px solid ' + (data.timeline === t.value ? 'var(--color-teal-600)' : 'var(--border-default)'), background: data.timeline === t.value ? 'rgba(13,148,136,0.08)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: data.timeline === t.value ? 'var(--color-teal-600)' : 'var(--text-primary)' }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{t.sub}</div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Motivation */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { value: 'salary', label: '💰 Higher earning potential', sub: 'Significant salary increase in new field' },
                { value: 'passion', label: '🔥 Follow my passion', sub: 'Do work I actually care about' },
                { value: 'burnout', label: '😮‍💨 Escape burnout', sub: 'Current role is draining — need change' },
                { value: 'growth', label: '🚀 Career advancement', sub: 'Ceiling in current field — want growth' },
                { value: 'flexibility', label: '🌐 Remote / flexibility', sub: 'New career offers better work-life balance' },
              ].map(m => (
                <button
                  key={m.value}
                  onClick={() => setData(d => ({ ...d, motivation: m.value }))}
                  style={{ padding: '16px 18px', borderRadius: 12, border: '2px solid ' + (data.motivation === m.value ? 'var(--color-teal-600)' : 'var(--border-default)'), background: data.motivation === m.value ? 'rgba(13,148,136,0.08)' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms' }}
                >
                  <div style={{ fontWeight: 600, fontSize: 15, color: data.motivation === m.value ? 'var(--color-teal-600)' : 'var(--text-primary)' }}>{m.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={next}
            disabled={
              (step === 1 && !data.from_role) ||
              (step === 2 && !data.target_career) ||
              (step === 3 && !data.timeline) ||
              (step === 4 && !data.motivation)
            }
            style={{
              marginTop: 28,
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              background: (
                (step === 1 && !data.from_role) ||
                (step === 2 && !data.target_career) ||
                (step === 3 && !data.timeline) ||
                (step === 4 && !data.motivation)
              ) ? '#9CA3AF' : 'var(--color-teal-600)',
              color: '#fff',
            }}
          >
            {step === 4 ? 'Start My Assessment →' : 'Continue →'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
