import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';

// Create or retrieve Stripe Connect account and return onboarding URL
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_connect_account_id, business_name, email')
    .eq('id', user.id)
    .single();

  const stripe = getStripe();
  let accountId = profile?.stripe_connect_account_id;

  // Create a new connected account if none exists
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      email: profile?.email ?? user.email,
      business_profile: {
        name: profile?.business_name ?? undefined,
      },
    });

    accountId = account.id;

    await supabase
      .from('users')
      .update({ stripe_connect_account_id: accountId })
      .eq('id', user.id);
  }

  // Create account link for onboarding
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/settings?stripe=refresh`,
    return_url: `${appUrl}/settings?stripe=complete`,
    type: 'account_onboarding',
  });

  return NextResponse.json({ url: accountLink.url });
}

// Check Stripe Connect status
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_connect_account_id, stripe_connect_onboarded')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_connect_account_id) {
    return NextResponse.json({ connected: false, onboarded: false });
  }

  // Check if account is fully onboarded
  const stripe = getStripe();
  const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id);
  const isOnboarded = account.details_submitted ?? false;

  // Update onboarded status if changed
  if (isOnboarded !== profile.stripe_connect_onboarded) {
    await supabase
      .from('users')
      .update({ stripe_connect_onboarded: isOnboarded })
      .eq('id', user.id);
  }

  return NextResponse.json({
    connected: true,
    onboarded: isOnboarded,
    accountId: profile.stripe_connect_account_id,
  });
}
