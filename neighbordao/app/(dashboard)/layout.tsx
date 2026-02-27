import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { ToastProvider } from '@/components/ui/toast'
import type { User } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  // Fetch the full user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  // If no profile yet, create one
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.user_metadata?.full_name ?? null,
        avatar_url: authUser.user_metadata?.avatar_url ?? null,
        role: 'member',
      })
      .select()
      .single()

    if (!newProfile) {
      redirect('/login')
    }
  }

  const currentUser = (profile ?? {
    id: authUser.id,
    email: authUser.email!,
    full_name: authUser.user_metadata?.full_name ?? null,
    avatar_url: null,
    neighborhood_id: null,
    role: 'member',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }) as User

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[var(--muted-bg)]">
        <Sidebar user={currentUser} />
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
