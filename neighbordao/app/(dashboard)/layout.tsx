import { Sidebar, MobileNav } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <MobileNav />
      <main className="md:pl-60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
