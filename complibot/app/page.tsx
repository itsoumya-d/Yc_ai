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
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-blue-700 font-bold text-xl">
            {/* ShieldCheck icon (inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>CompliBot</span>
          </Link>

          {/* Nav actions */}
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
            >
              Start Free Trial
            </Link>
          </nav>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block mb-4 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase">
              Compliance Automation Platform
            </span>

            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
              Compliance Automation{' '}
              <span className="text-blue-700">for Modern Teams</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              CompliBot maps your infrastructure to SOC 2, ISO 27001, HIPAA, GDPR, and PCI DSS
              — automatically identifying gaps and generating audit-ready policies.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-blue-700 text-white font-semibold text-base hover:bg-blue-800 transition-colors shadow-sm"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold text-base hover:bg-gray-50 transition-colors"
              >
                Book a Demo
              </Link>
            </div>

            {/* Framework badge chips */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['SOC 2 Ready', 'ISO 27001', 'HIPAA', 'GDPR', 'PCI DSS'].map((badge) => (
                <span
                  key={badge}
                  className="px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social Proof Bar ── */}
        <section className="border-y border-gray-100 bg-gray-50 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6">
            <p className="text-sm font-semibold text-gray-500 whitespace-nowrap">
              Trusted by 500+ compliance teams
            </p>
            <div className="flex items-center flex-wrap justify-center gap-8">
              {['Acme Corp', 'Nexus Labs', 'Orbit Health', 'Vertex AI', 'CloudBase'].map((company) => (
                <span
                  key={company}
                  className="text-sm font-semibold text-gray-400 tracking-wide"
                >
                  {company}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything you need to stay audit-ready
              </h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                One platform to manage all your compliance frameworks — from gap detection to policy generation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Feature 1 */}
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Framework Mapping</h3>
                <p className="text-gray-500 leading-relaxed">
                  Automatically map your controls to 5 major frameworks simultaneously. No manual crosswalks,
                  no spreadsheets — CompliBot does it in real time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Gap Detection</h3>
                <p className="text-gray-500 leading-relaxed">
                  AI identifies compliance gaps before your auditors do, with severity scoring. Prioritize
                  remediation efforts based on risk — not guesswork.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1D4ED8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policy Generator</h3>
                <p className="text-gray-500 leading-relaxed">
                  Generate audit-ready policies in seconds using GPT-4o, customized for your org. Export to
                  PDF or Word, ready for your next audit.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="bg-gray-50 py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How it works</h2>
              <p className="text-lg text-gray-500">
                Go from zero to audit-ready in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Connector line (desktop only) */}
              <div
                className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-blue-200"
                aria-hidden="true"
              />

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xl font-extrabold mb-5 shadow-md relative z-10">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Connect Your Org</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Integrate with AWS, GCP, Azure, Okta, GitHub and more via native connectors in minutes.
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xl font-extrabold mb-5 shadow-md relative z-10">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">AI Maps Controls</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  CompliBot's AI engine automatically maps your infrastructure to every applicable control
                  across all 5 frameworks.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-blue-700 text-white flex items-center justify-center text-2xl font-extrabold mb-5 shadow-md relative z-10">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Get Audit-Ready</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Receive a prioritized remediation plan, auto-generated policies, and a shareable audit
                  readiness report.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-lg text-gray-500">
                No surprise fees. Cancel any time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

              {/* Startup */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Startup</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">$149</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Up to 2 frameworks',
                    '5 users',
                    'Gap detection',
                    'Basic reporting',
                    'Email support',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center px-6 py-3 rounded-lg border border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Get started
                </Link>
              </div>

              {/* Growth */}
              <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Growth</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">$449</span>
                    <span className="text-gray-500 text-sm">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'All 5 frameworks',
                    '25 users',
                    'AI policy generation',
                    'Advanced analytics',
                    'Priority support',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#22C55E"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="block text-center px-6 py-3 rounded-lg border border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Get started
                </Link>
              </div>

              {/* Enterprise — highlighted */}
              <div className="flex flex-col rounded-2xl bg-blue-700 p-8 shadow-lg relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold tracking-wide uppercase shadow-sm">
                  Most Popular
                </span>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-1">Enterprise</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">Custom</span>
                  </div>
                  <p className="text-blue-200 text-xs mt-1">Contact us for pricing</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {[
                    'Unlimited frameworks',
                    'Unlimited users',
                    'SSO / SAML',
                    'Dedicated CSM',
                    'SLA guarantee',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-blue-100">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="block text-center px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
                >
                  Talk to sales
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="bg-blue-800 py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start your compliance journey today
            </h2>
            <p className="text-blue-200 text-lg mb-8">
              Join 500+ teams who trust CompliBot to stay audit-ready — without the spreadsheets.
            </p>
            <Link
              href="/signup"
              className="inline-block px-8 py-3.5 rounded-lg bg-white text-blue-800 font-semibold text-base hover:bg-blue-50 transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-white font-bold text-lg flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              CompliBot
            </span>
            <p className="text-xs text-gray-500">Compliance automation for modern teams.</p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-600">
            &copy; 2025 CompliBot, Inc. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
