import Link from 'next/link';

const styles = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.9); }
  }
  @keyframes count-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .fade-1 { animation: fade-up 0.6s ease both; }
  .fade-2 { animation: fade-up 0.6s ease 0.1s both; }
  .fade-3 { animation: fade-up 0.6s ease 0.2s both; }
  .fade-4 { animation: fade-up 0.6s ease 0.3s both; }
  .fade-5 { animation: fade-up 0.6s ease 0.4s both; }
  .dot-pulse { animation: pulse-dot 2s ease-in-out infinite; }
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -4px rgba(5,150,105,0.15);
  }
  .btn-shine {
    position: relative;
    overflow: hidden;
    transition: background-color 0.2s ease;
  }
  .btn-shine::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: skewX(-20deg);
    transition: left 0.5s ease;
  }
  .btn-shine:hover::after { left: 150%; }
  .green-glow {
    background: radial-gradient(ellipse at 50% 0%, rgba(5,150,105,0.12) 0%, transparent 70%);
  }
  .stat-green {
    background: linear-gradient(135deg, #059669 0%, #10B981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const features = [
  {
    icon: '⚡',
    title: 'AI Invoice Drafting',
    desc: 'Describe your work in plain English. Get a polished, itemised invoice in under 10 seconds.',
  },
  {
    icon: '💳',
    title: 'Online Payments',
    desc: 'Clients pay with credit card or ACH directly from a branded payment portal — no account needed.',
  },
  {
    icon: '🔔',
    title: 'Smart Follow-ups',
    desc: 'Automated reminders that escalate from friendly nudge to firm demand. Stop chasing payments manually.',
  },
  {
    icon: '👥',
    title: 'Client Health Scores',
    desc: 'Track payment history, average days to pay, and outstanding balance for every client.',
  },
  {
    icon: '🎨',
    title: 'Professional Templates',
    desc: '5 stunning invoice designs customised with your logo, brand colors, and business details.',
  },
  {
    icon: '📊',
    title: 'Revenue Analytics',
    desc: 'Real-time dashboards: cash flow forecasts, payment aging, top clients, and DSO trends.',
  },
];

const stats = [
  { value: '$2.4M', label: 'Invoiced last month' },
  { value: '98%', label: 'Payment collection rate' },
  { value: '14 days', label: 'Avg. faster than paper invoicing' },
];

const testimonials = [
  {
    quote: "I used to spend 2 hours a week on invoicing. Now it's under 10 minutes. The AI drafts are scarily good.",
    name: 'Alex Chen',
    role: 'Freelance Designer',
    avatar: 'A',
  },
  {
    quote: "Getting paid on time finally feels automatic. The reminder escalation alone has recovered thousands.",
    name: 'Priya Nair',
    role: 'Independent Consultant',
    avatar: 'P',
  },
  {
    quote: "My clients love the payment portal. No more 'I lost the invoice email' excuses.",
    name: 'Marcus Webb',
    role: 'Video Producer',
    avatar: 'M',
  },
];

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'For getting started',
    features: ['5 invoices / month', '1 client', 'Basic templates', 'Manual payments'],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12.99',
    period: '/month',
    desc: 'For active freelancers',
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'All templates + branding',
      'Online payments (Stripe)',
      'AI invoice drafting',
      'Automated reminders',
      'Revenue analytics',
    ],
    cta: 'Start 14-day free trial',
    highlight: true,
  },
  {
    name: 'Business',
    price: '$24.99',
    period: '/month',
    desc: 'For teams & agencies',
    features: [
      'Everything in Pro',
      'Team members',
      'Custom branding',
      'Expense tracking',
      'API access',
      'Priority support',
    ],
    cta: 'Start 14-day free trial',
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">

        {/* NAV */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <span className="text-sm font-bold text-white">AI</span>
              </div>
              <span className="font-heading text-lg font-bold text-[var(--foreground)]">
                Invoice<span className="text-brand-600">AI</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
              <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="hover:text-brand-600 transition-colors">Reviews</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-shine rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="green-glow relative overflow-hidden pb-20 pt-16">
          {/* Grid pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="fade-1 mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
                <span className="dot-pulse h-2 w-2 rounded-full bg-brand-500 inline-block" />
                Trusted by 8,200+ freelancers and small businesses
              </div>

              <h1 className="fade-2 font-heading text-5xl font-bold leading-tight tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
                Get paid faster with
                <br />
                <span className="stat-green">intelligent invoicing</span>
              </h1>

              <p className="fade-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted-foreground)]">
                Create professional invoices in seconds with AI. Automate payment reminders,
                accept online payments, and track your entire billing lifecycle — in one place.
              </p>

              <div className="fade-4 mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="btn-shine w-full rounded-lg bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-700 sm:w-auto"
                >
                  Start Free — no credit card
                </Link>
                <Link
                  href="#features"
                  className="w-full rounded-lg border border-[var(--border)] bg-white px-8 py-3.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-gray-50 sm:w-auto"
                >
                  See how it works →
                </Link>
              </div>

              {/* Stats row */}
              <div className="fade-5 mt-12 grid grid-cols-3 gap-6 border-t border-[var(--border)] pt-10">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="stat-green font-heading text-2xl font-bold sm:text-3xl">{s.value}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INVOICE PREVIEW CARD */}
        <div className="mx-auto -mt-4 max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-[var(--border)] bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-gray-50 px-6 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">INV-0042 · Acme Corp</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">Paid ✓</span>
            </div>
            <div className="px-8 py-6">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">From</p>
                  <p className="mt-1 font-semibold">Your Studio LLC</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Due</p>
                  <p className="mt-1 font-semibold">Mar 15, 2026</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { desc: 'Brand identity design (40 hrs)', amount: '$4,800' },
                  { desc: 'Logo variations & usage guide', amount: '$1,200' },
                  { desc: 'Social media kit (12 assets)', amount: '$800' },
                ].map((item) => (
                  <div key={item.desc} className="flex justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                    <span className="text-[var(--foreground)]">{item.desc}</span>
                    <span className="font-medium text-brand-700">{item.amount}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-4">
                <span className="font-semibold">Total</span>
                <span className="font-heading text-xl font-bold text-brand-600">$6,800.00</span>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
              Everything you need
            </p>
            <h2 className="font-heading text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              Built for getting paid.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted-foreground)]">
              From invoice creation to payment collection, InvoiceAI handles the entire billing lifecycle so you can focus on your work.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover rounded-xl border border-[var(--border)] bg-white p-6">
                <span className="text-2xl">{f.icon}</span>
                <h3 className="mt-3 font-heading text-base font-semibold text-[var(--foreground)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="bg-[var(--surface-secondary,#F9FAFB)] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-4xl font-bold text-[var(--foreground)]">
                Freelancers love InvoiceAI
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="card-hover rounded-xl border border-[var(--border)] bg-white p-6">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-[var(--foreground)]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
              Pricing
            </p>
            <h2 className="font-heading text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              Simple, transparent pricing
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[var(--muted-foreground)]">
              Start free. Upgrade when you need more. No surprise fees, no transaction percentages.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card-hover relative rounded-xl border p-7 ${
                  plan.highlight
                    ? 'border-brand-600 bg-white shadow-[0_0_0_4px_rgba(5,150,105,0.08)]'
                    : 'border-[var(--border)] bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-brand-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Most Popular
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-heading text-lg font-bold text-[var(--foreground)]">{plan.name}</h3>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{plan.desc}</p>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-heading text-4xl font-bold text-[var(--foreground)]">{plan.price}</span>
                  <span className="mb-1 text-sm text-[var(--muted-foreground)]">{plan.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`btn-shine mt-7 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-brand-600 text-white hover:bg-brand-700'
                      : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-brand-600 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="font-heading text-4xl font-bold text-white sm:text-5xl">
              Stop chasing payments.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Join 8,200+ freelancers who send professional invoices and get paid on time — with InvoiceAI.
            </p>
            <Link
              href="/signup"
              className="btn-shine mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Start free — no credit card required
            </Link>
            <p className="mt-3 text-xs text-brand-200">14-day Pro trial included. Cancel anytime.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[var(--border)] bg-white py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600">
                    <span className="text-xs font-bold text-white">AI</span>
                  </div>
                  <span className="font-heading text-base font-bold">InvoiceAI</span>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  AI-powered invoicing for freelancers and small businesses.
                </p>
              </div>
              {[
                { heading: 'Product', links: ['Features', 'Pricing', 'Templates', 'Integrations'] },
                { heading: 'Support', links: ['Documentation', 'Help Center', 'Status', 'Contact'] },
                { heading: 'Company', links: ['About', 'Blog', 'Privacy', 'Terms'] },
              ].map((col) => (
                <div key={col.heading}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {col.heading}
                  </p>
                  <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
                    {col.links.map((l) => (
                      <li key={l}>
                        <a href="#" className="hover:text-brand-600 transition-colors">{l}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} InvoiceAI. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
