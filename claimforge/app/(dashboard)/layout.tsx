import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/ui/DashboardContent';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-hidden">
        <DashboardContent>{children}</DashboardContent>
      </main>
    </div>
  );
}
