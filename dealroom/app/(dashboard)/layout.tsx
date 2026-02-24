import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:pl-0 pt-0 lg:pt-0">
        {/* Mobile top padding for fixed header */}
        <div className="lg:hidden h-14" />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
