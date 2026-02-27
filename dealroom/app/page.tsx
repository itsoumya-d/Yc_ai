import Link from 'next/link';
import {
  Zap,
  BarChart3,
  Mail,
  Sparkles,
  RefreshCw,
  Bell,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: 'Pipeline Dashboard',
    description:
      'Real-time visibility into every deal across your pipeline. Track stage progression, velocity, and revenue forecasts at a glance.',
  },
  {
    icon: Sparkles,
    title: 'AI Deal Scoring',
    description:
      'Machine learning models analyze buyer signals, engagement patterns, and historical data to predict deal outcomes with 85% accuracy.',
  },
  {
    icon: Mail,
    title: 'Email Intelligence',
    description:
      'Automatically capture and analyze every email interaction. Surface sentiment shifts, key objections, and engagement trends.',
  },
  {
    icon: Zap,
    title: 'AI Follow-Up Generator',
    description:
      'Generate personalized follow-up emails in seconds. Context-aware suggestions based on deal stage, buyer persona, and conversation history.',
  },
  {
    icon: RefreshCw,
    title: 'CRM Sync',
    description:
      'Bi-directional sync with Salesforce, HubSpot, and Pipedrive. Zero manual data entry with automatic activity logging.',
  },
  {
    icon: Bell,
    title: 'Deal Health Alerts',
    description:
      'Proactive notifications when deals show risk signals. Never let a winnable deal slip through the cracks again.',
  },
];

const metrics = [
  { before: '28%', after: '65%', label: 'selling time' },
  { before: '47%', after: '85%', label: 'forecast accuracy' },
  { before: '', after: '42%', label: 'higher win rate' },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 49,
    description: 'For small sales teams getting started with AI-powered selling.',
    features: [
      'Up to 5 seats',
      'Pipeline dashboard',
      'Basic deal scoring',
      'Email tracking',
      'CRM sync (1 integration)',
      'Community support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: 99,
    description: 'For growing teams that need advanced intelligence and automation.',
    features: [
      'Up to 25 seats',
      'AI deal scoring',
      'Email intelligence',
      'AI follow-up generator',
      'CRM sync (unlimited)',
      'Deal health alerts',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 179,
    description: 'For large organizations with custom needs and security requirements.',
    features: [
      'Unlimited seats',
      'Everything in Professional',
      'Custom AI models',
      'Advanced analytics & reporting',
      'SSO & SCIM provisioning',
      'Dedicated success manager',
      'SLA & uptime guarantee',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const integrations = ['Salesforce', 'HubSpot', 'Gmail', 'Zoom', 'Slack'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-brand-600" />
            <span className="font-heading text-xl font-bold text-text-primary">DealRoom</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Features
            </a>
            <a href="#metrics" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Results
            </a>
            <a href="#pricing" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
              Pricing
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[var(--radius-lg)] px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-[var(--radius-lg)] bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white px-6 pb-20 pt-24 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-ai-200 bg-ai-50 px-4 py-1.5">
            <Sparkles className="h-4 w-4 text-ai-600" />
            <span className="text-xs font-medium text-ai-700">Powered by AI</span>
          </div>
          <h1 className="font-heading text-5xl font-extrabold leading-tight tracking-tight text-text-primary md:text-6xl lg:text-7xl">
            AI That Closes{' '}
            <span className="bg-gradient-to-r from-brand-600 to-ai-600 bg-clip-text text-transparent">
              Deals
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary md:text-xl">
            Stop guessing, start closing. DealRoom gives your sales team AI-powered deal scoring,
            email intelligence, and real-time coaching to close deals 42% faster.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-[var(--shadow-md)] transition-all hover:bg-brand-700 hover:shadow-[var(--shadow-lg)]"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-border bg-white px-8 py-3.5 text-base font-semibold text-text-primary shadow-[var(--shadow-xs)] transition-colors hover:bg-surface"
            >
              Watch Demo
            </a>
          </div>
          <p className="mt-4 text-sm text-text-muted">14-day free trial. No credit card required.</p>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border bg-surface py-10">
        <div className="mx-auto max-w-5xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-text-muted">
            Integrates with the tools your team already uses
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {integrations.map((name) => (
              <div
                key={name}
                className="flex h-10 items-center justify-center rounded-[var(--radius-md)] px-4"
              >
                <span className="font-heading text-lg font-semibold text-text-muted">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
              Everything you need to close more deals
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              From pipeline management to AI-generated follow-ups, DealRoom covers every stage of your sales cycle.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-[var(--radius-xl)] border border-border bg-white p-6 shadow-[var(--shadow-xs)] transition-all hover:border-brand-200 hover:shadow-[var(--shadow-md)]"
                >
                  <div className="mb-4 inline-flex rounded-[var(--radius-lg)] bg-brand-50 p-3">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section id="metrics" className="bg-brand-600 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center font-heading text-2xl font-bold text-white md:text-3xl">
            Real results from real sales teams
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="font-mono text-3xl font-medium text-white md:text-4xl">
                  {metric.before ? (
                    <>
                      <span className="text-brand-200">{metric.before}</span>
                      <span className="mx-2 text-brand-300">&rarr;</span>
                      <span className="text-white">{metric.after}</span>
                    </>
                  ) : (
                    <span className="text-white">{metric.after}</span>
                  )}
                </div>
                <p className="mt-2 text-sm font-medium text-brand-100">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-text-secondary">
              Start with a 14-day free trial. No credit card required. Scale as your team grows.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-[var(--radius-xl)] border p-8 ${
                  tier.highlighted
                    ? 'border-brand-300 bg-brand-50 shadow-[var(--shadow-lg)]'
                    : 'border-border bg-white shadow-[var(--shadow-xs)]'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[var(--radius-full)] bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold text-text-primary">{tier.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-extrabold text-text-primary">
                    ${tier.price}
                  </span>
                  <span className="text-sm text-text-secondary">/seat/month</span>
                </div>
                <p className="mt-3 text-sm text-text-secondary">{tier.description}</p>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-text-primary">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.name === 'Enterprise' ? '#contact' : '/signup'}
                  className={`mt-8 flex w-full items-center justify-center gap-2 rounded-[var(--radius-lg)] px-6 py-3 text-sm font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'border border-border bg-white text-text-primary hover:bg-surface'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-brand-600 to-ai-600 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
            Ready to close more deals?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Join thousands of sales teams already using DealRoom to hit their targets. Start your
            free trial today.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-white px-8 py-3.5 text-base font-semibold text-brand-600 shadow-[var(--shadow-md)] transition-colors hover:bg-brand-50"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#demo"
              className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-brand-600" />
                <span className="font-heading text-lg font-bold text-text-primary">DealRoom</span>
              </div>
              <p className="mt-3 text-sm text-text-secondary">
                AI-powered sales intelligence for B2B teams that want to close more deals, faster.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-text-primary">Product</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#features" className="text-sm text-text-secondary hover:text-text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-text-secondary hover:text-text-primary">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-text-primary">Company</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-sm font-semibold text-text-primary">Legal</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-text-secondary hover:text-text-primary">
                    SOC 2 Compliance
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8">
            <p className="text-center text-sm text-text-muted">
              &copy; {new Date().getFullYear()} DealRoom. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
