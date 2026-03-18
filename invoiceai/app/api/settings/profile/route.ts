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

  // General fields
  if (body.business_name !== undefined) updateData.business_name = body.business_name || null;
  if (body.business_email !== undefined) updateData.business_email = body.business_email || null;
  if (body.business_phone !== undefined) updateData.business_phone = body.business_phone || null;
  if (body.business_address !== undefined) updateData.business_address = body.business_address || null;
  if (body.default_notes !== undefined) updateData.default_notes = body.default_notes || null;
  if (body.default_terms !== undefined) updateData.default_terms = body.default_terms || null;
  if (body.invoice_number_format !== undefined) updateData.invoice_number_format = body.invoice_number_format || 'INV-{number}';
  if (body.default_payment_terms !== undefined) updateData.default_payment_terms = Number(body.default_payment_terms) || 30;
  if (body.default_currency !== undefined) updateData.default_currency = body.default_currency || 'USD';
  if (body.onboarding_completed !== undefined) updateData.onboarding_completed = body.onboarding_completed;

  // Branding fields
  if (body.logo_url !== undefined) updateData.logo_url = body.logo_url || null;
  if (body.brand_color !== undefined) updateData.brand_color = body.brand_color || '#16a34a';
  if (body.secondary_color !== undefined) updateData.secondary_color = body.secondary_color || null;
  if (body.font_preference !== undefined) updateData.font_preference = body.font_preference || 'inter';
  if (body.default_template !== undefined) updateData.default_template = body.default_template || 'classic';

  // Metadata (notifications, preferences)
  if (body.metadata !== undefined) updateData.metadata = body.metadata;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
