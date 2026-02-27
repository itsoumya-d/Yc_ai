import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateInvoiceFromDescription } from '@/lib/openai/client';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { allowed, remaining } = rateLimit(`ai-generate:${user.id}`, { limit: 10, windowSeconds: 60 });
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before trying again.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': String(remaining) } }
    );
  }

  const body = await request.json();
  const { description } = body;

  if (!description?.trim()) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  // Get user profile for context
  const { data: profile } = await supabase
    .from('users')
    .select('business_name, default_payment_terms')
    .eq('id', user.id)
    .single();

  const result = await generateInvoiceFromDescription(description, {
    businessName: profile?.business_name ?? undefined,
    defaultPaymentTerms: profile?.default_payment_terms ?? undefined,
  });

  return NextResponse.json(result);
}
