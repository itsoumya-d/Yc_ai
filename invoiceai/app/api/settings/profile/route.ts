import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  if (body.business_name !== undefined) updateData.business_name = body.business_name || null;
  if (body.business_email !== undefined) updateData.business_email = body.business_email || null;
  if (body.business_phone !== undefined) updateData.business_phone = body.business_phone || null;
  if (body.business_address !== undefined) updateData.business_address = body.business_address || null;
  if (body.default_notes !== undefined) updateData.default_notes = body.default_notes || null;
  if (body.default_terms !== undefined) updateData.default_terms = body.default_terms || null;
  if (body.onboarding_completed !== undefined) updateData.onboarding_completed = body.onboarding_completed;

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
