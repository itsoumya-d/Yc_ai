import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/sidebar';
import { ToastProvider } from '@/components/ui/toast';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <ToastProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          userEmail={user.email}
          userName={profile?.full_name ?? undefined}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
