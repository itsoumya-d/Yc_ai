import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description } = await request.json();

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .insert({
      name,
      slug,
      description: description || '',
      admin_id: user.id,
      member_count: 1,
    })
    .select()
    .single();

  if (neighborhoodError) {
    return NextResponse.json({ error: neighborhoodError.message }, { status: 500 });
  }

  const displayName = user.email?.split('@')[0] || 'Member';

  const { error: memberError } = await supabase
    .from('neighborhood_members')
    .insert({
      neighborhood_id: neighborhood.id,
      user_id: user.id,
      display_name: displayName,
      role: 'admin',
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ neighborhood });
}
