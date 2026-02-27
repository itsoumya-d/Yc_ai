'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', icon: '🛡️', label: 'Dashboard' },
  { href: '/frameworks', icon: '📋', label: 'Frameworks' },
  { href: '/gap-analysis', icon: '🔍', label: 'Gap Analysis' },
  { href: '/controls', icon: '⚙️', label: 'Controls' },
  { href: '/policies', icon: '📄', label: 'Policies' },
  { href: '/evidence', icon: '🗄️', label: 'Evidence Vault' },
  { href: '/tasks', icon: '✅', label: 'Tasks' },
  { href: '/monitoring', icon: '📡', label: 'Monitoring' },
  { href: '/audit-room', icon: '🔒', label: 'Audit Room' },
  { href: '/integrations', icon: '🔌', label: 'Integrations' },
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
    <aside style={{
      width: 232,
      flexShrink: 0,
      background: 'var(--bg-sidebar)',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--color-trust-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🛡️</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.01em' }}>CompliBot</span>
        </Link>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, paddingLeft: 42 }}>Compliance Automation</div>
      </div>

      {/* Compliance score mini */}
      <div style={{ margin: '12px 12px', padding: '12px 14px', background: 'rgba(37,99,235,0.15)', borderRadius: 12, border: '1px solid rgba(37,99,235,0.25)' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>Overall Score</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 26, color: '#fff' }}>82%</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#4ADE80', background: 'rgba(74,222,128,0.1)', padding: '3px 8px', borderRadius: 8 }}>SOC 2</span>
        </div>
        <div style={{ marginTop: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 4, overflow: 'hidden' }}>
          <div style={{ width: '82%', height: '100%', background: 'linear-gradient(90deg, var(--color-trust-600), #4ADE80)', borderRadius: 4 }} />
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px' }}>
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
                borderRadius: 9,
                textDecoration: 'none',
                marginBottom: 2,
                background: active ? 'var(--bg-sidebar-active)' : 'transparent',
                color: active ? 'var(--text-sidebar-active)' : 'var(--text-sidebar)',
                fontWeight: active ? 600 : 400,
                fontSize: 13,
                transition: 'all 150ms',
                borderLeft: active ? '2px solid var(--color-trust-600)' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, textDecoration: 'none', color: 'var(--text-sidebar)', fontSize: 13 }}>
          <span>⚙️</span> Settings
        </Link>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, color: '#F87171', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <span>🚪</span> Sign out
        </button>
      </div>
    </aside>
  );
}
