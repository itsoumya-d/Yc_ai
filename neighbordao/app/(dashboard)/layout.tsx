import { Sidebar } from '@/components/layout/sidebar';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main id="main-content" className="flex-1 overflow-y-auto pb-20 lg:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}
