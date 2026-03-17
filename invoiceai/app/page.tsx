'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ROICalculator } from '@/components/ROICalculator';
import { ThreeHeroBackground } from '@/components/three/ThreeHeroBackground';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.93 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

function AnimatedSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'AI Invoice Drafting',
    description: 'Describe your work in plain English. Get a polished, professional invoice in under 10 seconds — line items, tax, and all.',
    highlight: true,
  },
  {
    icon: '💳',
    title: 'Online Payments',
    description: 'Accept credit cards and bank transfers through a branded payment portal. Clients pay in one click — no account required.',
    highlight: false,
  },
  {
    icon: '🔔',
    title: 'Smart Follow-ups',
    description: 'Automated payment reminders that escalate from friendly to firm. Overdue invoices chase themselves.',
    highlight: false,
  },
  {
    icon: '👤',
    title: 'Client Management',
    description: 'Track client health scores, payment history, and outstanding balances. Know which clients are risky before it costs you.',
    highlight: false,
  },
  {
    icon: '🎨',
    title: 'Beautiful Templates',
    description: '5 professional invoice templates customized with your brand colors and logo. Your invoices look like they cost thousands.',
    highlight: false,
  },
  {
    icon: '📊',
    title: 'Revenue Analytics',
    description: 'Cash flow dashboards so you always know what\'s coming in, what\'s overdue, and what\'s at risk.',
    highlight: false,
  },
];

const stats = [
  { value: '$50M+', label: 'Invoiced Through Platform' },
  { value: '30%', label: 'Faster Payment vs. Email' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'User Rating' },
];

const testimonials = [
  {
    quote: 'I used to spend 2 hours a week chasing invoices. Now InvoiceAI sends automated reminders and I get paid 12 days faster on average.',
    name: 'Rachel D.',
    role: 'Freelance Designer, $180K/yr revenue',
    avatar: 'RD',
  },
  {
    quote: 'The AI drafting is insane. I describe the project in 2 sentences and get a perfect invoice. Saved me hours every month.',
    name: 'Tom B.',
    role: 'Consultant, Bravura Strategy',
    avatar: 'TB',
  },
  {
    quote: 'My clients actually pay faster now because the payment link is right in the invoice. Zero friction. Revenue up 23% vs. last year.',
    name: 'Keiko S.',
    role: 'Marketing Agency Owner',
    avatar: 'KS',
  },
];

const howItWorks = [
  {
    step: '01',
    icon: '💬',
    title: 'Describe your work',
    desc: 'Type what you did in plain English — or let the AI pull from your project notes. No spreadsheets.',
  },
  {
    step: '02',
    icon: '⚡',
    title: 'Invoice generated instantly',
    desc: 'AI fills in line items, quantities, taxes, and your branding. Review in seconds, send with one click.',
  },
  {
    step: '03',
    icon: '💰',
    title: 'Get paid online',
    desc: 'Clients pay through a branded portal — credit card or bank transfer. Money hits your account fast.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: '/month',
    features: ['5 invoices/month', '1 client', 'Basic templates', 'Manual payments'],
    highlighted: false,
    cta: 'Get started',
  },
  {
    name: 'Pro',
    monthlyPrice: '$12.99',
    annualPrice: '$10.39',
    period: '/month',
    features: ['Unlimited invoices', 'Unlimited clients', 'All templates', 'Online payments', 'AI drafting', 'Payment reminders'],
    highlighted: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Business',
    monthlyPrice: '$24.99',
    annualPrice: '$19.99',
    period: '/month',
    features: ['Everything in Pro', 'Team members', 'Custom branding', 'Priority support', 'API access', 'Expense tracking'],
    highlighted: false,
    cta: 'Get started',
  },
];

const faqs = [
  {
    q: 'How does AI invoice drafting actually work?',
    a: "You describe your work in plain English — for example, 'Website redesign for Acme Corp, 40 hours at $125/hr, including 3 revision rounds.' InvoiceAI parses that description, creates properly formatted line items, applies your saved tax rates, and generates a branded invoice in under 10 seconds. You review, tweak if needed, and send.",
  },
  {
    q: 'How do my clients pay? Do they need to create an account?',
    a: 'No account required for your clients. They receive an email with a payment link, click it, and pay via credit card or bank transfer (ACH) on a branded page. The entire experience is frictionless — which is why our users see payment times drop by an average of 12 days.',
  },
  {
    q: 'Can InvoiceAI send automatic payment reminders?',
    a: "Yes. You configure the reminder schedule once — for example, 3 days before due, on the due date, and 7 days overdue. InvoiceAI sends professionally worded emails that automatically escalate in urgency. You'll never have to manually chase a client again.",
  },
  {
    q: 'How much does InvoiceAI take from payments?',
    a: "InvoiceAI doesn't charge transaction fees beyond standard payment processing rates (2.9% + $0.30 for cards, 0.8% capped at $5 for ACH bank transfers). These are Stripe's standard rates, passed through at cost. We charge only the flat monthly subscription — no hidden percentages.",
  },
  {
    q: 'Can I use my own invoice number sequence and branding?',
    a: "Absolutely. You can set a custom prefix and starting number for your invoice sequence (e.g., INV-2026-001), upload your logo, set brand colors, and choose from 5 professional templates. Pro and Business plans also support a custom payment domain (e.g., pay.yourbusiness.com).",
  },
];

const trustedCompanies = ['Acme Corp', 'TechStart', 'BuildRight', 'DataFlow', 'NextScale', 'GrowthLabs'];

export default function LandingPage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--background)]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-heading text-xl font-bold text-brand-600">InvoiceAI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Send Free Invoice
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8 relative overflow-hidden">
        <ThreeHeroBackground />
        {/* Ambient */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-15 blur-3xl rounded-full bg-brand-400" />
        </div>

        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="relative"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-6">
            ⚡ AI-Powered Invoicing — Get Paid 30% Faster
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl mb-6 leading-tight"
          >
            Get Paid Faster with{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600, #2563eb) 0%, #7c3aed 60%, #db2777 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI-Powered Invoicing
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-xl text-[var(--muted-foreground)] leading-relaxed mb-10">
            Create professional invoices in 10 seconds. Automate payment reminders. Accept online payments. Stop chasing clients — start running your business.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-16">
            <Link
              href="/signup"
              className="w-full rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-brand-700 hover:scale-105 shadow-lg shadow-brand-200 sm:w-auto"
            >
              Send Your First Invoice Free
            </Link>
            <Link
              href="#how-it-works"
              className="w-full rounded-xl border border-[var(--border)] px-8 py-4 text-base font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] sm:w-auto"
            >
              See how it works →
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center"
              >
                <div className="text-2xl font-extrabold text-brand-600 mb-1">{stat.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trusted by logo strip */}
      <AnimatedSection>
        <motion.div
          variants={fadeUp}
          className="py-12 border-y border-[var(--border)]"
        >
          <p className="text-center text-sm text-[var(--muted-foreground)] mb-6 uppercase tracking-wider font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-40">
            {trustedCompanies.map((name) => (
              <span key={name} className="text-[var(--foreground)] font-bold text-lg tracking-tight">{name}</span>
            ))}
          </div>
        </motion.div>
      </AnimatedSection>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Invoice to paid in 3 steps
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">
                No accounting degree required. No learning curve. Just describe your work and get paid.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <motion.div key={item.step} variants={slideLeft} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-3xl mb-6 shadow-md shadow-brand-100">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-brand-500 mb-2 tracking-widest">{item.step}</div>
                  <h3 className="font-heading text-xl font-bold text-[var(--foreground)] mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Everything you need to get paid
              </h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
                From creating invoices to collecting payments — InvoiceAI handles the entire billing lifecycle so you can focus on doing the work.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-md transition-shadow ${feature.highlight ? 'ring-2 ring-brand-300' : ''}`}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="font-heading text-lg font-bold text-[var(--card-foreground)] mb-2">
                    {feature.title}
                    {feature.highlight && (
                      <span className="ml-2 text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full">AI-powered</span>
                    )}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Freelancers and agencies love InvoiceAI
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Real results from real businesses that stopped chasing payments.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <motion.div
                  key={t.name}
                  variants={scaleIn}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--muted-foreground)] italic mb-6">
                    &quot;{t.quote}&quot;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[var(--foreground)]">{t.name}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">Start free. Pay only when you scale.</p>
            </motion.div>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'annual' ? 'bg-brand-600' : 'bg-gray-300'}`}
                aria-label="Toggle billing period"
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${billing === 'annual' ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}`}>
                Annual <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">Save 20%</span>
              </span>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={scaleIn}
                  className={`rounded-2xl border p-6 ${
                    plan.highlighted
                      ? 'border-brand-600 bg-[var(--card)] ring-2 ring-brand-600 shadow-lg'
                      : 'border-[var(--border)] bg-[var(--card)]'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="text-xs font-bold bg-brand-600 text-white px-3 py-1 rounded-full inline-block mb-3">Most Popular</div>
                  )}
                  <h3 className="font-heading text-lg font-bold text-[var(--card-foreground)]">
                    {plan.name}
                  </h3>
                  <p className="mt-2">
                    <span className="font-heading text-3xl font-extrabold text-[var(--card-foreground)]">
                      {billing === 'annual' ? plan.annualPrice : plan.monthlyPrice}
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
                    className={`mt-6 block w-full rounded-xl px-4 py-3 text-center text-sm font-bold transition-all ${
                      plan.highlighted
                        ? 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-105'
                        : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* ROI Calculator */}
      <ROICalculator />

      {/* FAQ Accordion */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.h2 variants={fadeUp} className="font-heading text-3xl font-bold text-center mb-12 text-[var(--foreground)]">
              Frequently Asked Questions
            </motion.h2>
            <motion.div variants={stagger} className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--card)]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
                  >
                    {faq.q}
                    <span
                      className="ml-4 flex-shrink-0 transition-transform duration-200 text-brand-600"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      ▼
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div
              variants={scaleIn}
              className="rounded-3xl bg-brand-600 p-14 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="text-4xl mb-4">💸</div>
                <h2 className="font-heading text-4xl font-extrabold text-white mb-4">
                  Stop leaving money on the table
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Send your first invoice in the next 5 minutes. No credit card. No setup fee. No excuse.
                </p>
                <Link
                  href="/signup"
                  className="inline-block px-10 py-4 rounded-xl font-bold text-brand-700 bg-white hover:scale-105 transition-transform shadow-lg text-base"
                >
                  Send Your First Invoice Free
                </Link>
                <p className="text-white/60 text-sm mt-4">No credit card required • Free plan forever • 99.9% uptime guaranteed</p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Newsletter CTA */}
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 mb-10 text-center"
            >
              <h3 className="font-heading text-xl font-bold mb-2 text-[var(--foreground)]">Get paid faster — stay in the loop</h3>
              <p className="text-sm mb-5 text-[var(--muted-foreground)]">Cash flow tips, invoicing best practices, and new features delivered to your inbox.</p>
              {emailSubmitted ? (
                <p className="text-sm font-semibold text-brand-600">You&apos;re in! Watch your inbox for the first issue.</p>
              ) : (
                <form
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                  onSubmit={(e) => { e.preventDefault(); if (email) setEmailSubmitted(true); }}
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                  >
                    Get Early Access
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatedSection>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-heading font-bold text-brand-600">InvoiceAI</span>
            <div className="flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">&copy; {new Date().getFullYear()} InvoiceAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
