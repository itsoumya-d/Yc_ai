import { supabase } from '../supabase';
import type { Application } from '../../types';

export async function getApplications(): Promise<Application[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createApplication(
  program: string,
  programName: string
): Promise<Application> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      program,
      program_name: programName,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(
  id: string,
  status: Application['status']
): Promise<void> {
  const { error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
}
