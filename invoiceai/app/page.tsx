import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="font-heading text-xl font-bold text-brand-600">
            InvoiceAI
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          AI-Powered Invoicing
        </div>
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
          Get paid faster with
          <br />
          <span className="text-brand-600">intelligent invoicing</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Create professional invoices in seconds with AI. Automate follow-ups,
          accept online payments, and track everything in one place.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="w-full rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] sm:w-auto"
          >
            See how it works
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-[var(--foreground)]">
            Everything you need to get paid
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-[var(--muted-foreground)]">
            From creating invoices to collecting payments, InvoiceAI handles the entire billing lifecycle.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'AI Invoice Drafting',
                description: 'Describe your work in plain English and get a professional invoice in seconds.',
              },
              {
                title: 'Online Payments',
                description: 'Accept credit card and bank transfer payments through a branded payment portal.',
              },
              {
                title: 'Smart Follow-ups',
                description: 'Automated payment reminders that escalate from friendly to firm.',
              },
              {
                title: 'Client Management',
                description: 'Track client health scores, payment history, and outstanding balances.',
              },
              {
                title: 'Beautiful Templates',
                description: '5 professional invoice templates customized with your brand colors and logo.',
              },
              {
                title: 'Revenue Analytics',
                description: 'Dashboards and reports to understand your cash flow at a glance.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-3xl font-bold text-[var(--foreground)]">
            Simple, transparent pricing
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { name: 'Free', price: '$0', period: '/month', features: ['5 invoices/month', '1 client', 'Basic templates', 'Manual payments'], highlighted: false },
              { name: 'Pro', price: '$12.99', period: '/month', features: ['Unlimited invoices', 'Unlimited clients', 'All templates', 'Online payments', 'AI drafting', 'Payment reminders'], highlighted: true },
              { name: 'Business', price: '$24.99', period: '/month', features: ['Everything in Pro', 'Team members', 'Custom branding', 'Priority support', 'API access', 'Expense tracking'], highlighted: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-6 ${
                  plan.highlighted
                    ? 'border-brand-600 bg-[var(--card)] ring-2 ring-brand-600'
                    : 'border-[var(--border)] bg-[var(--card)]'
                }`}
              >
                <h3 className="font-heading text-lg font-semibold text-[var(--card-foreground)]">
                  {plan.name}
                </h3>
                <p className="mt-2">
                  <span className="font-heading text-3xl font-bold text-[var(--card-foreground)]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {plan.period}
                  </span>
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                      <svg className="h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]'
                  }`}
                >
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-[var(--muted-foreground)] sm:px-6 lg:px-8">
          &copy; {new Date().getFullYear()} InvoiceAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
