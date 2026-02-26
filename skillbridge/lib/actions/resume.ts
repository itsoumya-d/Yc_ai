'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Resume } from '@/types/database';

export async function getResumes(): Promise<Resume[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch resumes: ${error.message}`);
  }

  return data ?? [];
}

export async function getResume(id: string): Promise<Resume | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch resume: ${error.message}`);
  }

  return data;
}

export async function createResume(data: {
  title: string;
  template: Resume['template'];
  target_role?: string;
}): Promise<Resume> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data: resume, error } = await supabase
    .from('resumes')
    .insert({
      user_id: user.id,
      title: data.title,
      template: data.template,
      target_role: data.target_role ?? null,
      content: {},
      is_primary: false,
      ai_optimized: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create resume: ${error.message}`);
  }

  revalidatePath('/resumes');

  return resume;
}

export async function updateResume(
  id: string,
  data: Partial<Resume>
): Promise<Resume> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const {
    id: _id,
    user_id,
    created_at,
    ...updateData
  } = data as Record<string, unknown>;

  const { data: updated, error } = await supabase
    .from('resumes')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update resume: ${error.message}`);
  }

  revalidatePath('/resumes');
  revalidatePath(`/resumes/${id}`);

  return updated;
}

export async function deleteResume(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to delete resume: ${error.message}`);
  }

  revalidatePath('/resumes');
}

export async function setPrimaryResume(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Unset all other resumes as primary
  const { error: unsetError } = await supabase
    .from('resumes')
    .update({ is_primary: false, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('is_primary', true);

  if (unsetError) {
    throw new Error(
      `Failed to unset primary resumes: ${unsetError.message}`
    );
  }

  // Set the specified resume as primary
  const { error: setError } = await supabase
    .from('resumes')
    .update({ is_primary: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id);

  if (setError) {
    throw new Error(`Failed to set primary resume: ${setError.message}`);
  }

  revalidatePath('/resumes');
}
