import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navigation ── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span className="text-xl font-bold text-green-600 tracking-tight">
              NeighborDAO
            </span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Join Your Neighborhood
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-green-50 to-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Your Neighborhood,{' '}
            <span className="text-green-600">Organized</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            NeighborDAO brings your community together — split bulk orders,
            share tools and space, vote on neighborhood decisions, and manage
            your community treasury in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold px-7 py-3.5 rounded-lg transition-colors shadow-sm"
            >
              Join Your Neighborhood →
            </Link>
            <Link
              href="/signup?create=true"
              className="inline-flex items-center justify-center gap-2 border border-green-300 hover:bg-green-50 text-green-800 text-base font-semibold px-7 py-3.5 rounded-lg transition-colors"
            >
              Create a New Neighborhood
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-500 font-medium">
            5,200+ neighborhoods coordinating on NeighborDAO
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything your neighborhood needs
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              One platform. Every tool your community needs to coordinate,
              save, and thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🛒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Group Purchasing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Pool orders with neighbors to unlock wholesale prices on
                groceries, supplies, and services. Save 20–40% vs. buying
                solo.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Resource Sharing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                List your power tools, lawn equipment, or party supplies.
                Borrow what you need. Nothing sits unused.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">🗳️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Community Voting
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Make neighborhood decisions democratically. Support majority
                vote, ranked choice, and quadratic voting.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 hover:shadow-md transition-shadow">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Shared Treasury
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Collect dues, track expenses, and manage your neighborhood
                fund with full transparency.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              How it works
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Up and running in minutes. No technical setup required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white text-xl font-bold mb-5">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Find or Create Your Neighborhood
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Search by zip code or invite your neighbors with a unique join
                link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white text-xl font-bold mb-5">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Organize Together
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Post group orders, list resources, and start votes — all from
                one simple dashboard.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-600 text-white text-xl font-bold mb-5">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Stronger Together
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Watch your community save money and build real connections that
                last.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Community Examples / Stats ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Real communities, real results
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              See what neighborhoods across the country are achieving together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-green-200 rounded-2xl p-8 text-center bg-green-50">
              <div className="text-4xl font-extrabold text-green-600 mb-2">
                $3,200
              </div>
              <p className="text-gray-700 font-medium">
                Maple Street saved last year on bulk grocery orders
              </p>
            </div>

            <div className="border border-green-200 rounded-2xl p-8 text-center bg-green-50">
              <div className="text-4xl font-extrabold text-green-600 mb-2">
                35%
              </div>
              <p className="text-gray-700 font-medium">
                Riverside HOA cut maintenance costs sharing equipment
              </p>
            </div>

            <div className="border border-green-200 rounded-2xl p-8 text-center bg-green-50">
              <div className="text-4xl font-extrabold text-green-600 mb-2">
                89%
              </div>
              <p className="text-gray-700 font-medium">
                Participation rate — Downtown Block voted on 24 proposals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              What neighbors are saying
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                "We organized a neighborhood solar bulk buy and saved every
                household $1,800 on installation."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  MG
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Maria G.
                  </p>
                  <p className="text-gray-500 text-xs">Portland, OR</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 text-base leading-relaxed mb-6">
                "Finally a way to coordinate our HOA that doesn't involve
                200-person email chains."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm">
                  TB
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    Tom B.
                  </p>
                  <p className="text-gray-500 text-xs">Austin, TX</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-lg text-gray-500">
              Start free. Upgrade when your community grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free</h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">
                  $0
                </div>
                <p className="text-gray-500 text-sm">Forever free</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '1 neighborhood',
                  'Unlimited members',
                  'All core features',
                  'Group purchasing',
                  'Resource sharing',
                  'Community voting',
                  'Shared treasury',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="h-4 w-4 text-green-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center border border-green-300 hover:bg-green-50 text-green-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Get started free
              </Link>
            </div>

            {/* Neighborhood Pro */}
            <div className="border-2 border-green-600 rounded-2xl p-8 flex flex-col relative shadow-lg">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Neighborhood Pro
                </h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">
                  $19
                  <span className="text-base font-medium text-gray-500">
                    /mo
                  </span>
                </div>
                <p className="text-gray-500 text-sm">Per neighborhood group</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Multiple neighborhoods',
                  'Advanced treasury tools',
                  'Priority support',
                  'Analytics dashboard',
                  'Custom invite pages',
                  'Everything in Free',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="h-4 w-4 text-green-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=pro"
                className="block text-center bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Start Pro trial
              </Link>
            </div>

            {/* HOA / Property Manager */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  HOA / Property Manager
                </h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-1">
                  $79
                  <span className="text-base font-medium text-gray-500">
                    /mo
                  </span>
                </div>
                <p className="text-gray-500 text-sm">
                  For professional managers
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited neighborhoods',
                  'Custom domain',
                  'Billing integration',
                  'White-label branding',
                  'Dedicated account manager',
                  'Everything in Pro',
                ].map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg
                      className="h-4 w-4 text-green-600 mt-0.5 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup?plan=hoa"
                className="block text-center border border-green-300 hover:bg-green-50 text-green-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Your neighbors are waiting.
          </h2>
          <p className="text-xl text-green-100 mb-10">
            Get organized today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-green-700 text-base font-bold px-8 py-4 rounded-lg transition-colors shadow-md"
          >
            Start Your Neighborhood →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <div>
              <p className="text-white font-bold text-sm">NeighborDAO</p>
              <p className="text-gray-500 text-xs">
                Community coordination for the modern neighborhood
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            &copy; 2025 NeighborDAO. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
