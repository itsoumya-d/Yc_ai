import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardContent } from '@/components/ui/DashboardContent';
import { AIChatDrawer } from '@/components/AIChatDrawer';


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main id="main-content" className="flex-1 overflow-y-auto bg-background">
        <DashboardContent>{children}</DashboardContent>
      </main>
      <AIChatDrawer />
    </div>
  );
}
