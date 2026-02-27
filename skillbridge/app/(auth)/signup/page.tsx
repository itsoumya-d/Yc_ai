'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/onboarding'), 1500);
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28, marginBottom: 10 }}>You&apos;re in!</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Taking you to your skills assessment…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ position: 'fixed', top: '10%', right: '8%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', left: '6%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(249,115,22,0.07), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>Discover where your skills can take you.</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 40, border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, marginBottom: 8 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>Free forever. No credit card required.</p>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#DC2626', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="Alex Johnson"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-default)', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-page)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid var(--border-default)', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-page)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, border: '1.5px solid var(--border-default)', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-page)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4, color: 'var(--text-muted)' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {password.length > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: password.length >= 8 ? '#16a34a' : '#DC2626' }}>
                  {password.length >= 8 ? '✓ Strong enough' : `${8 - password.length} more characters needed`}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px', borderRadius: 11, fontWeight: 700, fontSize: 16, background: loading ? '#9CA3AF' : 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}
            >
              {loading ? 'Creating account…' : 'Start your assessment →'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
            By creating an account, you agree to our{' '}
            <a href="#" style={{ color: 'var(--color-teal-600)', textDecoration: 'none' }}>Terms</a> and{' '}
            <a href="#" style={{ color: 'var(--color-teal-600)', textDecoration: 'none' }}>Privacy Policy</a>.
          </p>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--color-teal-600)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
