import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER ?? '',
    price: 299,
    caseLimit: 3,
    documentLimit: 50,
    features: ['3 active cases', '50 documents', 'AI entity extraction', 'Benford\'s analysis'],
  },
  professional: {
    name: 'Professional',
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
    price: 799,
    caseLimit: 25,
    documentLimit: 500,
    features: ['25 active cases', '500 documents', 'Everything in Starter', 'Whistleblower portal', 'Team collaboration', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_PRICE_ENTERPRISE ?? '',
    price: 2499,
    caseLimit: -1,
    documentLimit: -1,
    features: ['Unlimited cases', 'Unlimited documents', 'Everything in Professional', 'Custom integrations', 'Dedicated support', 'On-premise option'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
