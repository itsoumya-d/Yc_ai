'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError(authError.message); setLoading(false); return; }
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-sidebar)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--color-trust-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</div>
            <span style={{ fontWeight: 800, fontSize: 26, color: '#fff' }}>CompliBot</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>Sign in to your compliance workspace</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 36, border: '1px solid rgba(255,255,255,0.1)' }}>
          {error && (
            <div style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 9, padding: '11px 14px', marginBottom: 18, color: '#FCA5A5', fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.com" style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', fontSize: 14, background: 'rgba(255,255,255,0.07)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '11px 14px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)', fontSize: 14, background: 'rgba(255,255,255,0.07)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '13px', borderRadius: 10, fontWeight: 700, fontSize: 15, background: loading ? '#374151' : 'var(--color-trust-600)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Don&apos;t have an account? <a href="mailto:sales@complibot.io" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Contact sales</a>
          </p>
        </div>
      </div>
    </div>
  );
}
