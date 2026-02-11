'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const organization = formData.get('organization') as string;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Create or find organization
  if (authData.user && organization) {
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', organization)
      .single();

    const orgId = existingOrg?.id;

    if (!orgId) {
      const { data: newOrg } = await supabase
        .from('organizations')
        .insert({ name: organization })
        .select('id')
        .single();

      if (newOrg) {
        await supabase
          .from('users')
          .update({ organization_id: newOrg.id, full_name: fullName, role: 'admin' })
          .eq('id', authData.user.id);
      }
    } else {
      await supabase
        .from('users')
        .update({ organization_id: orgId, full_name: fullName })
        .eq('id', authData.user.id);
    }
  }

  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
