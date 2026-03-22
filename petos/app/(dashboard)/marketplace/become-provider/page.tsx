import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, CreditCard, Shield, TrendingUp,
  DollarSign, Star, Clock, Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProviderOnboardingStatus, startProviderOnboarding } from '@/lib/actions/marketplace';

const STEPS = [
  { icon: Shield,      label: 'Create Stripe Express account',    desc: 'Stripe securely verifies your identity and bank details' },
  { icon: CreditCard,  label: 'Connect payout account',           desc: 'Add your bank or debit card to receive earnings' },
  { icon: CheckCircle2, label: 'List your first service',         desc: 'Set your price, availability, and service area' },
];

const BENEFITS = [
  { icon: DollarSign,  title: 'Instant payouts',      desc: 'Funds arrive in your bank within 2 business days after each booking' },
  { icon: TrendingUp,  title: 'Keep 90% of revenue',  desc: 'PetOS only charges a 10% platform fee — you keep the rest' },
  { icon: Star,        title: 'Build your reputation', desc: 'Verified reviews help you stand out and charge premium rates' },
  { icon: Clock,       title: 'Flexible scheduling',  desc: 'Set your own hours, block off days, accept only the jobs you want' },
];

export default async function BecomeProviderPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarded?: string; refresh?: string; listed?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const sp = await searchParams;
  const status = await getProviderOnboardingStatus();

  // If returning from Stripe with ?onboarded=true, re-check status
  const isOnboarded = status.onboarded;
  const isListed = sp.listed === 'true';

  if (isListed) {
    return (
      <div className="max-w-lg mx-auto p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">You&apos;re live!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          Your service is now visible to pet owners in your area.
          You&apos;ll receive an email when your first booking arrives.
        </p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          View Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Marketplace
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-9 w-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Become a Provider
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Earn money doing what you love
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm leading-relaxed">
          Join 1,200+ pet care professionals on PetOS. Get booked by verified pet owners,
          receive instant payments, and grow your business — all in one place.
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid grid-cols-2 gap-3">
        {BENEFITS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
          >
            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Onboarding steps */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-5">How it works</h2>
        <ol className="space-y-4">
          {STEPS.map(({ icon: Icon, label, desc }, i) => (
            <li key={label} className="flex items-start gap-4">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isOnboarded && i < 2
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isOnboarded && i < 2 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mt-1" />
                )}
              </div>
              <div className="pt-1">
                <p className={`text-sm font-semibold ${
                  isOnboarded && i < 2
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* CTA */}
      {!isOnboarded ? (
        <div className="space-y-3">
          <form action={startProviderOnboarding}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              {status.hasAccount ? 'Continue Stripe Setup' : 'Connect Stripe Account'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            You&apos;ll be redirected to Stripe to complete identity verification and connect your bank.
            PetOS never sees your full bank details.
          </p>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                Stripe account connected
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Payments enabled — you can now list services and receive bookings.
              </p>
            </div>
          </div>
          <Link
            href="/marketplace/become-provider/create-listing"
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <Zap className="w-4 h-4" />
            Create Your First Listing
          </Link>
        </div>
      )}

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Bank-level encryption</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> PCI DSS compliant</span>
        <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Powered by Stripe</span>
      </div>
    </div>
  );
}
