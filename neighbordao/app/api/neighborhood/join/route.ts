import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { slug } = await request.json();

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  const { data: neighborhood, error: neighborhoodError } = await supabase
    .from('neighborhoods')
    .select('id, name')
    .eq('slug', slug)
    .single();

  if (neighborhoodError || !neighborhood) {
    return NextResponse.json({ error: 'Neighborhood not found' }, { status: 404 });
  }

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
    if (memberError.code === '23505') {
      return NextResponse.json({ error: 'You are already a member of this neighborhood' }, { status: 409 });
    }
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Increment member_count
  await supabase.rpc('increment_member_count', { neighborhood_id: neighborhood.id }).maybeSingle();

  return NextResponse.json({ neighborhood });
}
