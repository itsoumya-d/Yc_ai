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
    .select('full_name, organization_id')
    .eq('id', user.id)
    .single();

  let orgName: string | undefined;
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();
    orgName = org?.name ?? undefined;
  }

  return (
    <ToastProvider>
      <div className="flex h-screen bg-slate-50">
        <Sidebar
          userEmail={user.email}
          userName={profile?.full_name ?? undefined}
          orgName={orgName}
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
