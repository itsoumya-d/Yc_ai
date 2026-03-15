import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/ui/DashboardContent';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <Sidebar user={user} />
      <main id="main-content" className="flex-1 overflow-auto">
        <DashboardContent>{children}</DashboardContent>
      </main>
    </div>
  );
}
