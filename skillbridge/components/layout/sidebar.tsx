'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/assessment', icon: '🎯', label: 'Assessment' },
  { href: '/skills', icon: '⚡', label: 'My Skills' },
  { href: '/careers', icon: '🚀', label: 'Career Matches' },
  { href: '/learning', icon: '📚', label: 'Learning Plan' },
  { href: '/jobs', icon: '💼', label: 'Job Board' },
  { href: '/resume', icon: '📄', label: 'Resume Builder' },
  { href: '/progress', icon: '🏆', label: 'Progress' },
  { href: '/community', icon: '🤝', label: 'Community' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside style={{ width: 240, flexShrink: 0, background: '#fff', borderRight: '1px solid var(--border-subtle)', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 22, background: 'linear-gradient(135deg, var(--color-teal-600), var(--color-orange-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SkillBridge</span>
        </Link>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Career Transition Platform</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px' }}>
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                marginBottom: 2,
                background: active ? 'rgba(13,148,136,0.10)' : 'transparent',
                color: active ? 'var(--color-teal-600)' : 'var(--text-secondary)',
                fontWeight: active ? 600 : 400,
                fontSize: 14,
                transition: 'all 150ms',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
              {item.href === '/assessment' && (
                <span style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--color-orange-500)', color: '#fff', borderRadius: 8, padding: '2px 7px', fontWeight: 700 }}>NEW</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 14 }}>
          <span style={{ fontSize: 16 }}>⚙️</span> Settings
        </Link>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, color: '#DC2626', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
        >
          <span style={{ fontSize: 16 }}>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
