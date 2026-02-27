import Link from 'next/link';
import {
  ShieldCheck,
  Scan,
  FileText,
  Archive,
  Search,
  ClipboardList,
  Activity,
  Link as LinkIcon,
  Shield,
  Award,
  Check,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: Scan,
    title: 'Infrastructure Scanner',
    description:
      'Automatically scan your AWS, GCP, or Azure infrastructure for misconfigurations and compliance gaps.',
  },
  {
    icon: FileText,
    title: 'AI Policy Generator',
    description:
      'Generate audit-ready security policies tailored to your stack. SOC 2, HIPAA, ISO 27001 and more.',
  },
  {
    icon: Archive,
    title: 'Evidence Collector',
    description:
      'Continuously collect and organize evidence artifacts from your tools. Always audit-ready.',
  },
  {
    icon: Search,
    title: 'Gap Analysis',
    description:
      'AI-powered gap analysis identifies exactly what you need to fix, prioritized by risk and effort.',
  },
  {
    icon: ClipboardList,
    title: 'Task Tracker',
    description:
      'Assign remediation tasks to your team with deadlines, owners, and automatic progress tracking.',
  },
  {
    icon: Activity,
    title: 'Continuous Monitoring',
    description:
      'Real-time compliance monitoring with instant alerts when your posture drifts out of spec.',
  },
];

const steps = [
  {
    icon: LinkIcon,
    step: '1',
    title: 'Connect',
    description:
      'Connect your cloud providers, identity platform, and dev tools in minutes. No agents to install.',
  },
  {
    icon: Shield,
    step: '2',
    title: 'Scan & Assess',
    description:
      'CompliBot scans your infrastructure, generates policies, and builds a prioritized remediation plan.',
  },
  {
    icon: Award,
    step: '3',
    title: 'Certify',
    description:
      'Complete tasks, collect evidence, and pass your audit with confidence. We guide you every step.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: '$299',
    period: '/mo',
    description: 'For early-stage startups beginning their compliance journey.',
    features: [
      '1 framework (SOC 2 or ISO 27001)',
      'Up to 5 team members',
      'Infrastructure scanning',
      'AI policy generation',
      'Basic evidence collection',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '$599',
    period: '/mo',
    description: 'For scaling teams that need multi-framework coverage.',
    features: [
      'Up to 3 frameworks',
      'Up to 20 team members',
      'Everything in Starter',
      'Gap analysis & task tracker',
      'Continuous monitoring',
      'Slack & Jira integrations',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '$999',
    period: '/mo',
    description: 'For organizations with advanced compliance needs.',
    features: [
      'Unlimited frameworks',
      'Unlimited team members',
      'Everything in Growth',
      'Custom policy templates',
      'Auditor portal access',
      'SSO & SCIM provisioning',
      'Dedicated success manager',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-trust-600">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">
              CompliBot
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[var(--radius-button)] px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="rounded-[var(--radius-button)] bg-trust-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-trust-700"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-shield-50 px-3 py-1 text-sm font-medium text-shield-700">
              <ShieldCheck className="h-4 w-4" />
              Your AI Compliance Officer
            </div>
            <h1 className="text-4xl font-bold leading-tight text-text-primary sm:text-5xl lg:text-6xl">
              SOC 2 in 6 Weeks,{' '}
              <span className="text-trust-600">Not 6 Months</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              CompliBot automates your entire compliance journey. AI-powered gap
              analysis, policy generation, and evidence collection get you
              audit-ready faster than any consultant.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-trust-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-trust-700"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-surface-tertiary"
              >
                Book Demo
              </a>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              14-day free trial. No credit card required.
            </p>
          </div>

          {/* Compliance Score Ring Visual Placeholder */}
          <div className="flex items-center justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center rounded-full border-8 border-trust-100 sm:h-80 sm:w-80">
              <div className="absolute inset-2 rounded-full border-8 border-shield-200" />
              <div className="absolute inset-6 flex items-center justify-center rounded-full bg-trust-50">
                <div className="text-center">
                  <p className="text-5xl font-bold text-trust-600 sm:text-6xl">
                    94
                  </p>
                  <p className="mt-1 text-sm font-medium text-text-secondary">
                    Compliance Score
                  </p>
                </div>
              </div>
              <div className="absolute -right-2 top-8 rounded-[var(--radius-card)] bg-surface p-2 shadow-md">
                <div className="flex items-center gap-2 text-xs font-medium text-shield-600">
                  <ShieldCheck className="h-4 w-4" />
                  SOC 2 Ready
                </div>
              </div>
              <div className="absolute -left-2 bottom-12 rounded-[var(--radius-card)] bg-surface p-2 shadow-md">
                <div className="flex items-center gap-2 text-xs font-medium text-trust-600">
                  <Activity className="h-4 w-4" />
                  Monitoring Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-border bg-surface-tertiary py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
          <p className="text-sm font-medium text-text-muted">
            Trusted by 300+ startups on their compliance journey
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {['Acme Corp', 'Nebula AI', 'Vaultline', 'Stackwise', 'Quantum SaaS'].map(
              (name) => (
                <div
                  key={name}
                  className="flex h-8 items-center text-lg font-semibold text-text-muted/40"
                >
                  {name}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Everything you need to get compliant
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              From initial assessment to audit day, CompliBot handles the heavy
              lifting so your team can focus on building.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-trust-50 text-trust-600">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-surface-tertiary py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              Go from zero to audit-ready in three simple steps.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-trust-50">
                  <item.icon className="h-8 w-8 text-trust-600" />
                </div>
                <div className="mx-auto mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-trust-600 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
              Start free for 14 days. No credit card required. Scale as you grow.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-[var(--radius-card)] border p-8 ${
                  tier.highlighted
                    ? 'border-trust-600 bg-surface shadow-lg ring-1 ring-trust-600'
                    : 'border-border bg-surface'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-[var(--radius-pill)] bg-trust-600 px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-text-primary">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text-primary">
                    {tier.price}
                  </span>
                  <span className="text-text-muted">{tier.period}</span>
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {tier.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-shield-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link
                    href="/signup"
                    className={`block w-full rounded-[var(--radius-button)] px-4 py-3 text-center text-sm font-semibold transition-colors ${
                      tier.highlighted
                        ? 'bg-trust-600 text-white hover:bg-trust-700'
                        : 'border border-border text-text-primary hover:bg-surface-tertiary'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-trust-700 to-trust-600 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to automate your compliance?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-trust-100">
            Join 300+ startups that cut their compliance timeline by 75%. Start
            your free trial today.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-white px-6 py-3 text-base font-semibold text-trust-700 transition-colors hover:bg-trust-50"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-4 text-sm text-trust-200">
            14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-trust-600">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-text-secondary">
              CompliBot
            </span>
          </div>
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} CompliBot. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
