'use server';

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const PLATFORM_FEE_PERCENT = 0.10; // 10% commission

// ─────────────────────────────────────────────────────────────────────────────
// Provider: Stripe Connect Express onboarding
// ─────────────────────────────────────────────────────────────────────────────

export async function startProviderOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: provider } = await supabase
    .from('service_providers')
    .select('id, stripe_account_id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .maybeSingle();

  let stripeAccountId = provider?.stripe_account_id;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: { supabase_user_id: user.id },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;

    if (provider) {
      await supabase
        .from('service_providers')
        .update({ stripe_account_id: stripeAccountId })
        .eq('user_id', user.id);
    }
    // If no provider row yet, it will be created when they finish the business profile form
  }

  const origin = (await headers()).get('origin') ?? 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/marketplace/become-provider?refresh=true`,
    return_url: `${origin}/marketplace/become-provider?onboarded=true`,
    type: 'account_onboarding',
  });

  redirect(accountLink.url);
}

export async function getProviderOnboardingStatus() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { hasAccount: false, onboarded: false } as const;

  const { data: provider } = await supabase
    .from('service_providers')
    .select('stripe_account_id, stripe_onboarding_complete, business_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!provider?.stripe_account_id) return { hasAccount: false, onboarded: false } as const;

  // Sync with Stripe
  const account = await stripe.accounts.retrieve(provider.stripe_account_id);
  const isOnboarded = !!(account.details_submitted && account.charges_enabled);

  if (isOnboarded && !provider.stripe_onboarding_complete) {
    await supabase
      .from('service_providers')
      .update({ stripe_onboarding_complete: true })
      .eq('user_id', user.id);
  }

  return {
    hasAccount: true,
    onboarded: isOnboarded,
    businessName: provider.business_name,
    accountId: provider.stripe_account_id,
  } as const;
}

export async function createProviderListing(input: {
  serviceType: string;
  title: string;
  description: string;
  priceType: string;
  price: number;
  durationMinutes?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: provider } = await supabase
    .from('service_providers')
    .select('id, stripe_onboarding_complete')
    .eq('user_id', user.id)
    .single();

  if (!provider?.stripe_onboarding_complete) {
    throw new Error('You must complete Stripe onboarding before listing services.');
  }

  const { error } = await supabase.from('service_listings').insert({
    provider_id: provider.id,
    service_type: input.serviceType,
    title: input.title,
    description: input.description,
    price_type: input.priceType,
    price: input.price,
    duration_minutes: input.durationMinutes,
    is_active: true,
  });

  if (error) throw new Error(`Failed to create listing: ${error.message}`);
  redirect('/marketplace/become-provider?listed=true');
}

// ─────────────────────────────────────────────────────────────────────────────
// Customer: service booking checkout
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingCheckoutInput {
  listingId: string;
  scheduledStart: string; // ISO string
  scheduledEnd: string;   // ISO string
  petId: string;
  notes?: string;
}

export async function createServiceBookingCheckout(input: BookingCheckoutInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch listing with provider details
  const { data: listing } = await supabase
    .from('service_listings')
    .select('*, service_providers!inner(id, stripe_account_id, stripe_onboarding_complete, business_name)')
    .eq('id', input.listingId)
    .eq('is_active', true)
    .single();

  if (!listing) throw new Error('Listing not found or unavailable');

  const provider = listing.service_providers as {
    id: string;
    stripe_account_id: string;
    stripe_onboarding_complete: boolean;
    business_name: string;
  };

  if (!provider.stripe_onboarding_complete || !provider.stripe_account_id) {
    throw new Error('Provider has not completed payment setup');
  }

  const priceUSD = Number(listing.price);
  const platformFeeAmount = Math.round(priceUSD * PLATFORM_FEE_PERCENT * 100); // cents
  const providerPayoutAmount = Math.round(priceUSD * (1 - PLATFORM_FEE_PERCENT) * 100); // cents

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? profile?.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  // Create pending booking record first (to hold the slot)
  const { data: booking, error: bookingError } = await supabase
    .from('service_bookings')
    .insert({
      listing_id: input.listingId,
      provider_id: provider.id,
      pet_id: input.petId,
      owner_id: user.id,
      status: 'pending',
      scheduled_start: input.scheduledStart,
      scheduled_end: input.scheduledEnd,
      service_type: listing.service_type,
      price: priceUSD,
      platform_fee: priceUSD * PLATFORM_FEE_PERCENT,
      provider_payout: priceUSD * (1 - PLATFORM_FEE_PERCENT),
      special_instructions: input.notes ?? null,
    })
    .select('id')
    .single();

  if (bookingError || !booking) throw new Error('Failed to create booking');

  const scheduledDate = new Date(input.scheduledStart).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const origin = (await headers()).get('origin') ?? 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: listing.currency ?? 'usd',
          unit_amount: Math.round(priceUSD * 100),
          product_data: {
            name: listing.title,
            description: `By ${provider.business_name} · ${scheduledDate}`,
          },
        },
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeAmount,
      transfer_data: { destination: provider.stripe_account_id },
      metadata: {
        booking_id: booking.id,
        supabase_user_id: user.id,
        type: 'service_booking',
      },
    },
    metadata: {
      booking_id: booking.id,
      type: 'service_booking',
    },
    success_url: `${origin}/marketplace?booked=true`,
    cancel_url: `${origin}/marketplace/${input.listingId}?cancelled=true`,
  });

  redirect(session.url!);
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider: mark booking completed (auto-transfer already happened via Connect)
// ─────────────────────────────────────────────────────────────────────────────

export async function markBookingCompleted(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthenticated');

  // Verify the caller is the provider for this booking
  const { data: booking } = await supabase
    .from('service_bookings')
    .select('id, status, service_providers!inner(user_id)')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  const providerUserId = (booking.service_providers as { user_id: string }).user_id;
  if (providerUserId !== user.id) throw new Error('Unauthorized');
  if (booking.status !== 'confirmed') throw new Error('Booking is not in confirmed state');

  await supabase
    .from('service_bookings')
    .update({ status: 'completed', actual_end: new Date().toISOString() })
    .eq('id', bookingId);

  return { success: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Read: get marketplace listings
// ─────────────────────────────────────────────────────────────────────────────

export async function getMarketplaceListings(serviceType?: string) {
  const supabase = await createClient();

  let query = supabase
    .from('service_listings')
    .select('*, service_providers!inner(id, business_name, rating, review_count, is_verified, photo_url, address)')
    .eq('is_active', true)
    .eq('service_providers.is_active', true)
    .eq('service_providers.stripe_onboarding_complete', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (serviceType) query = query.eq('service_type', serviceType);

  const { data } = await query;
  return data ?? [];
}

export async function getServiceListing(listingId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('service_listings')
    .select('*, service_providers!inner(id, business_name, rating, review_count, is_verified, photo_url, address, bio)')
    .eq('id', listingId)
    .eq('is_active', true)
    .single();

  return data;
}

export async function getProviderBookings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: provider } = await supabase
    .from('service_providers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!provider) return [];

  const { data } = await supabase
    .from('service_bookings')
    .select('*, pets(name, species), profiles!owner_id(full_name, email)')
    .eq('provider_id', provider.id)
    .order('scheduled_start', { ascending: true });

  return data ?? [];
}
