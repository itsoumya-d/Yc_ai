'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { User, Organization, AuditLogEntry } from '@/types/database';

interface ActionResult<T = null> {
  data?: T;
  error?: string;
}

export interface UserProfileUpdate {
  full_name?: string;
  title?: string;
  avatar_url?: string;
}

export interface OrganizationUpdate {
  name?: string;
  domain?: string;
}

export async function getUserProfile(): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error) return { error: error.message };
  return { data: data as User };
}

export async function updateUserProfile(
  updates: UserProfileUpdate
): Promise<ActionResult<User>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', authUser.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return { data: data as User };
}

export async function getOrganization(): Promise<ActionResult<Organization>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', authUser.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (error) return { error: error.message };
  return { data: data as Organization };
}

export async function updateOrganization(
  updates: OrganizationUpdate
): Promise<ActionResult<Organization>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id, role')
    .eq('id', authUser.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };
  if (profile.role !== 'admin') return { error: 'Only admins can update organization settings' };

  const { data, error } = await supabase
    .from('organizations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', profile.organization_id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return { data: data as Organization };
}

export async function getAuditLog(limit: number = 50): Promise<ActionResult<AuditLogEntry[]>> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', authUser.id)
    .single();

  if (!profile?.organization_id) return { error: 'No organization found' };

  const { data, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: data as AuditLogEntry[] };
}
