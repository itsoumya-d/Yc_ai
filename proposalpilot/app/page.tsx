'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Send, FileText, Users, Sparkles, BarChart3, Blocks, CheckCircle, Star, ArrowRight, PenLine, Shield } from 'lucide-react';
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
    icon: Sparkles,
    title: 'AI Generation',
    desc: 'Describe your project in plain English. AI writes a tailored, compelling proposal in under 60 seconds.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: PenLine,
    title: 'e-Signatures',
    desc: 'Clients sign directly in the browser. No printing, no DocuSign subscription, no friction.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: Users,
    title: 'Client Portal',
    desc: 'Clients see a branded portal to review, comment, approve, and sign your proposals.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: BarChart3,
    title: 'Win Rate Analytics',
    desc: 'Track which sections clients linger on, where they drop off, and what pricing converts best.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Blocks,
    title: 'Content Library',
    desc: 'Save case studies, bios, and pricing blocks. Reuse your best content in one click.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: FileText,
    title: 'Proposal Builder',
    desc: 'Drag-and-drop sections, pricing tables, and timelines. Fully white-labeled with your brand.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const stats = [
  { value: '10,000+', label: 'Proposals Sent' },
  { value: '68%', label: 'Average Win Rate' },
  { value: '4.9★', label: 'Customer Rating' },
  { value: '3 min', label: 'Avg Time to Create' },
];

const testimonials = [
  {
    quote: 'I went from spending 4 hours per proposal to 20 minutes. My close rate jumped from 30% to 65% in the first month.',
    author: 'James Whitfield',
    title: 'Founder, Whitfield Creative',
    avatar: 'JW',
  },
  {
    quote: 'The AI writes better than I do. Clients consistently say our proposals are the most professional they have seen.',
    author: 'Anika Patel',
    title: 'Principal, AP Strategy',
    avatar: 'AP',
  },
  {
    quote: 'Client portal and e-signatures turned a 5-day back-and-forth into a same-day close. Incredible.',
    author: 'Marcus Lin',
    title: 'Partner, Lin Advisory Group',
    avatar: 'ML',
  },
];

const faqs = [
  {
    q: 'How does AI proposal creation actually work?',
    a: 'You describe your project in plain English — client name, scope, deliverables, and budget. Our AI generates a complete, tailored proposal in under 60 seconds using your brand voice, industry context, and proven winning structures from thousands of proposals.',
  },
  {
    q: 'Are e-signatures on ProposalPilot legally binding?',
    a: 'Yes. ProposalPilot e-signatures are compliant with the U.S. ESIGN Act, UETA, and EU eIDAS regulations. Every signature includes an audit trail with timestamps, IP addresses, and identity verification — all admissible in court.',
  },
  {
    q: 'Can I use my own templates and brand?',
    a: 'Absolutely. You can upload your logo, set brand colors and fonts, and create custom section templates. The AI will use your brand voice when generating content. All client-facing portals are fully white-labeled.',
  },
  {
    q: 'How does the client portal work?',
    a: "When you send a proposal, your client receives a link to a branded, mobile-friendly portal. They can read every section, leave inline comments, ask questions, accept or decline, and sign — all without creating an account. You'll get real-time notifications at every step.",
  },
  {
    q: 'What does the Pro plan cost and what happens after the trial?',
    a: 'The Pro plan is $39/month (or $31/month billed annually). The 14-day free trial includes all Pro features with no credit card required. After the trial, you can downgrade to the Free plan (3 proposals/month) or continue on Pro — your choice, no surprise charges.',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    period: '/month',
    desc: 'For freelancers just getting started',
    features: ['3 proposals/month', 'AI generation', 'e-Signatures', 'Client portal', 'PDF export'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 39,
    annualPrice: 31,
    period: '/month',
    desc: 'For busy agencies and consultants',
    features: ['Unlimited proposals', 'Priority AI generation', 'Custom branding', 'Content library', 'Win rate analytics', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Team',
    monthlyPrice: 89,
    annualPrice: 71,
    period: '/month',
    desc: 'For growing agencies with teams',
    features: ['Everything in Pro', 'Up to 10 seats', 'Team analytics', 'CRM integrations', 'Custom domain', 'Dedicated support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
];

export default function LandingPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">ProposalPilot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-white">
          <ThreeHeroBackground />
          <div className="absolute inset-0 pointer-events-none select-none">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Trusted by 2,000+ agencies and consultancies
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            >
              Win More Clients with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                AI-Powered Proposals
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Stop losing deals to competitors with prettier proposals. ProposalPilot writes, designs, and sends client-winning proposals in minutes — not hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
            >
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Create Your First Proposal Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-700 font-medium px-8 py-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                View Live Demo
              </Link>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-sm text-slate-400"
            >
              No credit card required · Free forever for 3 proposals/month
            </motion.p>
          </div>
        </section>

        {/* Trusted-by logo strip */}
        <div className="py-12 border-y border-gray-100 dark:border-gray-800">
          <p className="text-center text-sm text-gray-400 mb-6 uppercase tracking-wider font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-40">
            {['Acme Corp', 'TechStart', 'BuildRight', 'DataFlow', 'NextScale', 'GrowthLabs'].map(name => (
              <span key={name} className="text-gray-600 dark:text-gray-400 font-bold text-lg tracking-tight">{name}</span>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <section className="bg-blue-600 py-12">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-blue-200 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                Everything You Need
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Close deals faster with every feature built in
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
                From AI writing to e-signatures to client portals — ProposalPilot has every tool agencies and consultants need to win more business.
              </motion.p>
            </AnimatedSection>

            <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className="p-6 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all group"
                >
                  <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                From brief to signed — in minutes
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Three steps is all it takes to go from blank page to closed deal.
              </motion.p>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-3 gap-10">
              {[
                { step: '1', title: 'Describe the Project', desc: 'Enter client name, project scope, and budget. AI drafts a complete, professional proposal in under a minute.' },
                { step: '2', title: 'Customize & Brand', desc: 'Tweak pricing, add case studies from your library, and apply your logo and brand colors in one click.' },
                { step: '3', title: 'Send & Get Signed', desc: 'Share a link. Your client reviews on a branded portal and signs with one tap — no PDF attachments needed.' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-xl mb-4 shadow-lg shadow-blue-200">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-lg">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Agencies and consultants love ProposalPilot
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Join 2,000+ freelancers and agencies who have increased their win rate.
              </motion.p>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <motion.div
                  key={t.author}
                  variants={fadeUp}
                  className="p-8 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{t.author}</p>
                      <p className="text-slate-500 text-xs">{t.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 px-6 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-10">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Simple, transparent pricing
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Start free. Upgrade when you need more.
              </motion.p>
            </AnimatedSection>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'annual' ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${billing === 'annual' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}`}>
                Annual <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">Save 20%</span>
              </span>
            </div>

            <AnimatedSection className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => {
                const displayPrice = plan.monthlyPrice === 0
                  ? '$0'
                  : billing === 'annual'
                  ? `$${plan.annualPrice}`
                  : `$${plan.monthlyPrice}`;
                return (
                  <motion.div
                    key={plan.name}
                    variants={fadeUp}
                    className={`relative p-8 rounded-2xl border-2 ${
                      plan.highlight
                        ? 'border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-200 -mt-4 -mb-4'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full shadow">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{plan.desc}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{displayPrice}</span>
                      <span className={`text-sm mb-1 ${plan.highlight ? 'text-blue-200' : 'text-slate-500'}`}>{plan.period}</span>
                    </div>
                    {billing === 'annual' && plan.monthlyPrice > 0 && (
                      <p className={`text-xs mb-5 ${plan.highlight ? 'text-blue-200' : 'text-slate-400'}`}>
                        Billed annually (${plan.annualPrice * 12}/yr)
                      </p>
                    )}
                    {!(billing === 'annual' && plan.monthlyPrice > 0) && <div className="mb-5" />}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-blue-200' : 'text-emerald-500'}`} />
                          <span className={`text-sm ${plan.highlight ? 'text-blue-100' : 'text-slate-700'}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className={`block text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                        plan.highlight
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatedSection>
          </div>
        </section>

        {/* ROI Calculator */}
        <ROICalculator />

        {/* FAQ */}
        <section className="py-20 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {faq.q}
                    <span className={`transition-transform duration-300 text-gray-400 inline-block ${openFaq === i ? 'rotate-180' : 'rotate-0'}`}>▼</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-violet-700">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white mb-4">
                Your next client is waiting for a better proposal
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xl text-blue-200 mb-10">
                Create your first AI-powered proposal in under 3 minutes — completely free.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-white text-blue-600 font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all duration-200"
                >
                  Create Your First Proposal Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-8 text-blue-200 text-sm">
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> SOC 2 Compliant</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> No credit card</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Cancel anytime</span>
              </motion.div>
            </div>
          </AnimatedSection>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Newsletter CTA */}
          <div className="border border-slate-700 rounded-2xl p-8 mb-10 bg-slate-800/50">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-white font-bold text-lg mb-2">Get proposal tips &amp; templates</h3>
              <p className="text-slate-400 text-sm mb-4">Join 5,000+ freelancers. Get weekly tips on winning more proposals — no spam, unsubscribe anytime.</p>
              {submitted ? (
                <p className="text-emerald-400 font-semibold text-sm">You&apos;re in! Check your inbox.</p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourcompany.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ProposalPilot</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-slate-500 text-sm">&copy; 2024 ProposalPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
