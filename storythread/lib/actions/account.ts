'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Update the authenticated user's profile metadata.
 */
export async function updateProfile(data: { full_name?: string; avatar_url?: string }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const { error } = await supabase.auth.updateUser({ data });
  if (error) return { error: error.message };

  // Also update the profiles table if it exists
  await supabase
    .from('profiles')
    .update({ full_name: data.full_name, avatar_url: data.avatar_url, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/dashboard/settings', 'page');
  return { success: true };
}

/**
 * Upload a profile avatar to Supabase Storage and return the public URL.
 */
export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const file = formData.get('file') as File;
  if (!file) return { error: 'No file provided' };

  const ext = file.name.split('.').pop();
  const fileName = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);

  // Persist avatar URL on user metadata + profiles table
  await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);

  revalidatePath('/dashboard/settings', 'page');
  return { success: true, url: publicUrl };
}

/**
 * Export all user data as a JSON blob (GDPR right to portability).
 * Returns a JSON string the client can download.
 */
export async function exportAccountData() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const exportData = {
    exported_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile,
  };

  return { data: JSON.stringify(exportData, null, 2) };
}

/**
 * Permanently delete the authenticated user's account and all associated data.
 * Requires SUPABASE_SERVICE_ROLE_KEY env var (never exposed to client).
 */
export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/login');

  // 1. Delete user data rows (profiles, etc.)
  await supabase.from('profiles').delete().eq('id', user.id);

  // 2. Sign out before deleting auth record
  await supabase.auth.signOut();

  // 3. Delete the auth.users record via service-role admin client
  const serviceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey) {
    const admin = createAdminClient(serviceUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await admin.auth.admin.deleteUser(user.id);
  }

  redirect('/');
}
