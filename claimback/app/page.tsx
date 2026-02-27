import Link from 'next/link';
import { Shield, ScanLine, Gavel, Phone, PiggyBank, Landmark } from 'lucide-react';

const features = [
  {
    icon: <ScanLine className="h-6 w-6" />,
    title: 'Bill Scanner',
    description: 'Upload any bill and our AI instantly identifies overcharges and billing errors.',
  },
  {
    icon: <Gavel className="h-6 w-6" />,
    title: 'Dispute Generator',
    description: 'Auto-generate legally-sound dispute letters tailored to your specific overcharges.',
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: 'AI Phone Agent',
    description: 'Our AI calls billing departments and negotiates lower rates on your behalf.',
  },
  {
    icon: <Landmark className="h-6 w-6" />,
    title: 'Bank Fee Monitor',
    description: 'Connect your bank to automatically detect and dispute unfair fees.',
  },
  {
    icon: <PiggyBank className="h-6 w-6" />,
    title: 'Savings Tracker',
    description: 'Watch your savings grow with real-time tracking and milestone achievements.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Bill Protection',
    description: 'Continuous monitoring ensures you never overpay on medical, utility, or telecom bills.',
  },
];

const stats = [
  { value: '$2,400', label: 'Avg. Annual Savings' },
  { value: '87%', label: 'Dispute Win Rate' },
  { value: '< 2 min', label: 'Bill Scan Time' },
  { value: '25%', label: 'Success Fee Only' },
];

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Scan bills and identify overcharges',
    features: ['3 bill scans/month', 'Overcharge detection', 'Basic dispute letters', 'Savings tracking'],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Full dispute automation',
    features: ['Unlimited bill scans', 'AI phone negotiations', 'Bank fee monitoring', 'Priority support', 'Advanced analytics'],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Concierge',
    price: '$29.99',
    period: '/month',
    description: 'White-glove bill fighting service',
    features: ['Everything in Pro', 'Dedicated dispute agent', 'Multi-bill campaigns', 'Legal escalation support', 'Monthly savings report'],
    cta: 'Go Concierge',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-champion-600">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary font-heading">Claimback</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-champion-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-champion-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 bg-success-50 text-success-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <PiggyBank className="h-3.5 w-3.5" />
          Users save an average of $2,400/year
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary font-heading leading-tight max-w-3xl mx-auto">
          Stop overpaying. Let AI fight your bills.
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          Claimback scans your bills for overcharges, generates dispute letters, and even makes AI phone calls to negotiate lower rates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-champion-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-champion-700 transition-colors text-base"
          >
            Scan Your First Bill Free
          </Link>
          <Link
            href="/login"
            className="text-champion-600 font-medium px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-base"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-champion-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white font-heading">{stat.value}</p>
                <p className="text-sm text-champion-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading text-center mb-4">
          Your complete bill-fighting toolkit
        </h2>
        <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
          From scanning to negotiating, Claimback handles every step of disputing unfair charges.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-champion-50 text-champion-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-surface border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading text-center mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
            Only pay when you save. 25% performance fee on successful disputes.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg border p-6 ${
                  tier.highlighted
                    ? 'border-champion-600 bg-white shadow-lg ring-1 ring-champion-600'
                    : 'border-border bg-white'
                }`}
              >
                {tier.highlighted && (
                  <span className="inline-block bg-champion-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading font-bold text-lg text-text-primary">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-text-primary font-heading">{tier.price}</span>
                  <span className="text-sm text-text-secondary">{tier.period}</span>
                </div>
                <p className="text-sm text-text-secondary mt-2">{tier.description}</p>
                <ul className="mt-4 space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-primary">
                      <svg className="h-4 w-4 text-success-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block text-center text-sm font-medium py-2.5 rounded-lg transition-colors ${
                    tier.highlighted
                      ? 'bg-champion-600 text-white hover:bg-champion-700'
                      : 'bg-white text-champion-600 border border-border hover:bg-surface'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-text-primary font-heading mb-3">
            Ready to stop overpaying?
          </h2>
          <p className="text-text-secondary mb-6">
            Scan your first bill for free. Most users find savings within 2 minutes.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-champion-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-champion-700 transition-colors text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2025 Claimback. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
