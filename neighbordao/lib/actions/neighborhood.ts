'use server';

import { createClient } from '@/lib/supabase/server';
import { Neighborhood } from '@/types/database';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getNeighborhood(): Promise<Neighborhood | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: member } = await supabase
    .from('neighborhood_members')
    .select('neighborhood_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!member) return null;

  const { data: neighborhood } = await supabase
    .from('neighborhoods')
    .select('*')
    .eq('id', member.neighborhood_id)
    .single();

  return neighborhood;
}

export async function createNeighborhood(data: {
  name: string;
  description: string;
}): Promise<{ error?: string; neighborhood?: Neighborhood }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const baseSlug = slugify(data.name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .insert({
      name: data.name,
      slug,
      description: data.description || '',
      admin_id: user.id,
      member_count: 1,
    })
    .select()
    .single();

  if (neighborhoodError) return { error: neighborhoodError.message };

  const displayName = user.email?.split('@')[0] || 'Member';

  const { error: memberError } = await supabase
    .from('neighborhood_members')
    .insert({
      neighborhood_id: neighborhood.id,
      user_id: user.id,
      display_name: displayName,
      role: 'admin',
    });

  if (memberError) return { error: memberError.message };

  return { neighborhood };
}

export async function joinNeighborhood(slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .select('id')
    .eq('slug', slug)
    .single();

  if (neighborhoodError || !neighborhood) return { error: 'Neighborhood not found' };

  const displayName = user.email?.split('@')[0] || 'Member';

  const { error: memberError } = await supabase
    .from('neighborhood_members')
    .insert({
      neighborhood_id: neighborhood.id,
      user_id: user.id,
      display_name: displayName,
      role: 'member',
    });

  if (memberError) {
    if (memberError.code === '23505') return { error: 'Already a member' };
    return { error: memberError.message };
  }

  return {};
}
