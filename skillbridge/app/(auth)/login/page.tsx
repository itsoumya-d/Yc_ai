'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Background decorations */}
      <div style={{ position: 'fixed', top: '15%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(13,148,136,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '8%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(249,115,22,0.07), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 30, background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge</span>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>Welcome back. Let&apos;s keep building.</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 40, border: '1px solid var(--border-subtle)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 24, marginBottom: 28 }}>Sign in</h1>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, padding: '12px 16px', marginBottom: 20, color: '#DC2626', fontSize: 14 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, border: '1.5px solid var(--border-default)', fontSize: 15, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-page)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, padding: 4 }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              <div style={{ marginTop: 6, textAlign: 'right' }}>
                <a href="#" style={{ fontSize: 13, color: 'var(--color-teal-600)', textDecoration: 'none' }}>Forgot password?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px', borderRadius: 11, fontWeight: 700, fontSize: 16, background: loading ? '#9CA3AF' : 'var(--color-teal-600)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 200ms', marginTop: 4 }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--color-teal-600)', fontWeight: 600, textDecoration: 'none' }}>Start free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
