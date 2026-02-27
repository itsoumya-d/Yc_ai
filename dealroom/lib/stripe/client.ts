import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2025-01-27.acacia',
    });
  }
  return stripe;
}

export const PLANS = {
  growth: {
    priceId: process.env.STRIPE_PRICE_GROWTH ?? '',
    price: 49,
    seatPrice: 29,
    dealLimit: 500,
    label: 'Growth',
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
    price: 149,
    seatPrice: 49,
    dealLimit: -1,
    label: 'Enterprise',
  },
} as const;

export type PlanKey = keyof typeof PLANS;
