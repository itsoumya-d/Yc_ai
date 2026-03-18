'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ROICalculator } from '@/components/ROICalculator';
import { ThreeHeroBackground } from '@/components/three/ThreeHeroBackground';
import {
  Shield,
  Calendar,
  Users,
  CheckSquare,
  Sparkles,
  Vote,
  BarChart3,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  FileText,
  Lock,
  PenLine,
} from 'lucide-react';

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
    title: 'AI Meeting Minutes',
    desc: 'Record your board meeting and get structured, legally-sound minutes in minutes — not days. Includes action items, resolutions, and vote tallies.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FileText,
    title: 'Board Pack Builder',
    desc: 'Assemble professional board packs from financials, KPIs, and strategic updates. One-click distribution to all board members.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: PenLine,
    title: 'e-Signatures',
    desc: 'Directors sign resolutions and consents directly in the browser. No printing. Full legal validity with complete audit trails.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: TrendingUp,
    title: 'Investor Updates',
    desc: 'Generate beautiful monthly investor updates from your dashboard data. Keep stakeholders informed and trust high.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Vote,
    title: 'Resolutions & Voting',
    desc: 'Draft resolutions, collect written consents, and formally tally votes. Full compliance with Delaware and international corporate law.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: BarChart3,
    title: 'Governance Dashboard',
    desc: 'Track governance health, upcoming filing deadlines, director terms, and action item completion in one unified view.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const stats = [
  { value: '1,000+', label: 'Boards Managed' },
  { value: '60%', label: 'Less Meeting Prep' },
  { value: '4.9★', label: 'Founder Rating' },
  { value: '2 min', label: 'Avg Minutes Draft' },
];

const testimonials = [
  {
    quote: 'BoardBrief turned our quarterly board prep from a 2-week nightmare into a 2-hour process. My board is more engaged than ever.',
    author: 'James Hartwell',
    title: 'CEO, Meridian Ventures',
    avatar: 'JH',
  },
  {
    quote: 'The AI meeting minutes are uncanny. I uploaded the recording and had professional, formatted minutes before the call even ended.',
    author: 'Priya Rajan',
    title: 'Co-Founder, NovaTech',
    avatar: 'PR',
  },
  {
    quote: 'Our investors explicitly commented on how professional our board materials have become. BoardBrief makes us look like a Series C company.',
    author: 'Marcus Cole',
    title: 'Founder, Stackwise',
    avatar: 'MC',
  },
];

const pricingPlans = [
  {
    name: 'Startup',
    monthlyPrice: 49,
    annualPrice: 39,
    period: '/month',
    desc: 'For early-stage founders running their first board',
    features: ['Up to 5 board members', 'AI meeting minutes', 'Resolution drafting', 'e-Signatures (10/month)', 'Governance dashboard', 'Email support'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    name: 'Scale',
    monthlyPrice: 149,
    annualPrice: 119,
    period: '/month',
    desc: 'For growth-stage companies with active boards',
    features: ['Up to 15 board members', 'Unlimited AI minutes', 'Board pack builder', 'Unlimited e-Signatures', 'Investor update generator', 'Audit trail & compliance', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    period: '',
    desc: 'For PE-backed and public-ready companies',
    features: ['Unlimited board members', 'Multi-entity support', 'Custom branding', 'SSO & SCIM', 'Dedicated CSM', 'Legal review integration', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'What does a "board management" platform actually do that a shared folder can\'t?',
    a: 'A shared folder stores documents but can\'t generate them, enforce signing workflows, or track governance obligations. BoardBrief gives you AI-generated minutes from recordings, automated board pack assembly, legally-binding e-signatures with audit trails, resolution tracking, and a governance dashboard that alerts you to upcoming deadlines — all of which a shared folder cannot do.',
  },
  {
    q: 'How accurate are the AI meeting minutes?',
    a: 'BoardBrief\'s AI produces structured minutes with better than 95% accuracy on action items, resolutions, and key decisions. Minutes are formatted to meet corporate governance standards and include timestamps, vote tallies, and attendee records. They are reviewed and approved by your team before being signed — you always have final control.',
  },
  {
    q: 'How do I create and send investor updates?',
    a: 'Connect your financial data sources (QuickBooks, Xero, or manual KPI entry) and BoardBrief generates a branded investor update template pre-populated with your metrics. You can edit, add commentary, and send via a branded email or link. All investor updates are archived and searchable from your dashboard.',
  },
  {
    q: 'Is BoardBrief secure enough for sensitive board materials?',
    a: 'Yes. BoardBrief is SOC 2 Type II certified with end-to-end encryption at rest and in transit. Per-meeting access controls let you restrict who sees sensitive documents. Full audit trails record every view, download, and signature. Our infrastructure runs on AWS with 99.9% uptime SLA.',
  },
  {
    q: 'Does BoardBrief integrate with our existing tools like Slack, Google Drive, or legal software?',
    a: 'BoardBrief integrates with Google Drive, Dropbox, OneDrive for document storage, Slack and email for notifications, QuickBooks and Xero for financial data, and DocuSign as a signing fallback. Enterprise plans support custom integrations with legal management platforms like Clio and Legito via our API.',
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
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">BoardBrief</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-amber-600 transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-amber-600 transition-colors">Customers</a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Log In
            </Link>
            <Link href="/signup" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-amber-50/30 to-white">
          <ThreeHeroBackground />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-1/4 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Trusted by 1,000+ startup founders
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            >
              Board Governance{' '}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                Made Simple
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The AI-powered governance platform that turns board meeting chaos into professional minutes, investor-ready packs, and legally-binding resolutions — in a fraction of the time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
            >
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Schedule Your First Board Meeting
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 text-slate-700 font-medium px-8 py-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                View Demo
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="text-sm text-slate-400"
            >
              Free forever for startups with 1 board · No credit card required
            </motion.p>
          </div>

          {/* Mock dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55 }}
            className="max-w-5xl mx-auto mt-16"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
              <div className="bg-slate-900 h-10 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="flex-1 bg-slate-700 mx-8 h-5 rounded-full" />
              </div>
              <div className="bg-slate-50 p-6">
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Next Meeting', value: 'Mar 15', sub: '14 days away', color: 'text-blue-600' },
                    { label: 'Open Actions', value: '7', sub: '2 overdue', color: 'text-red-500' },
                    { label: 'Resolutions', value: '23', sub: 'This year', color: 'text-amber-600' },
                    { label: 'Attendance', value: '94%', sub: 'Last 4 meetings', color: 'text-emerald-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-amber-700 font-medium">AI has drafted your Q1 board pack — ready for review</span>
                  <span className="ml-auto text-amber-600 font-semibold text-xs">Review Now →</span>
                </div>
              </div>
            </div>
          </motion.div>
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

        {/* Stats */}
        <section className="bg-amber-500 py-12">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-amber-100 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-3">
                Complete Governance Platform
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Everything your board needs in one place
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
                From AI-generated minutes to investor updates to e-signatures — BoardBrief handles the governance work so you can focus on building.
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
                From meeting to minutes in 4 steps
              </motion.h2>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Build the Agenda', desc: 'AI suggests agenda items based on open actions, resolutions, and strategic goals from your last meeting.' },
                { step: '2', title: 'Run the Meeting', desc: 'Record the meeting or take live notes. BoardBrief timestamps key decisions and action items in real time.' },
                { step: '3', title: 'AI Drafts Minutes', desc: 'Upload the recording. Get professionally formatted, legally-sound minutes ready for review in minutes.' },
                { step: '4', title: 'Sign & Archive', desc: 'Directors approve and sign. Everything is archived with a complete, searchable audit trail.' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} className="relative flex flex-col items-center text-center">
                  {i < 3 && (
                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-amber-400 to-slate-200 z-0" />
                  )}
                  <div className="relative z-10 w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-amber-200">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
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
                Founders and their boards love BoardBrief
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Join 1,000+ founders who run better boards with less prep time.
              </motion.p>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <motion.div key={t.author} variants={fadeUp} className="p-8 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">{t.avatar}</div>
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
                Free to start. Scale as your board grows.
              </motion.p>
            </AnimatedSection>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'annual' ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium ${billing === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
                Annual <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">Save 20%</span>
              </span>
            </div>

            <AnimatedSection className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => {
                const displayPrice = plan.monthlyPrice === null
                  ? 'Custom'
                  : billing === 'annual'
                  ? `$${plan.annualPrice}`
                  : `$${plan.monthlyPrice}`;
                return (
                  <motion.div
                    key={plan.name}
                    variants={fadeUp}
                    className={`relative p-8 rounded-2xl border-2 ${
                      plan.highlight
                        ? 'border-amber-500 bg-amber-500 text-white shadow-2xl shadow-amber-200 -mt-4 -mb-4'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">MOST POPULAR</span>
                      </div>
                    )}
                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? 'text-amber-100' : 'text-slate-500'}`}>{plan.desc}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{displayPrice}</span>
                      <span className={`text-sm mb-1 ${plan.highlight ? 'text-amber-100' : 'text-slate-500'}`}>{plan.period}</span>
                    </div>
                    {billing === 'annual' && plan.annualPrice !== null && (
                      <p className={`text-xs mb-5 ${plan.highlight ? 'text-amber-100' : 'text-slate-400'}`}>
                        Billed annually (${(plan.annualPrice ?? 0) * 12}/yr)
                      </p>
                    )}
                    {!(billing === 'annual' && plan.annualPrice !== null) && <div className="mb-5" />}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-amber-200' : 'text-emerald-500'}`} />
                          <span className={`text-sm ${plan.highlight ? 'text-amber-50' : 'text-slate-700'}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className={`block text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                        plan.highlight
                          ? 'bg-white text-amber-600 hover:bg-amber-50'
                          : 'bg-amber-500 text-white hover:bg-amber-600'
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
        <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white mb-4">
                Your board deserves better governance
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xl text-slate-400 mb-10">
                Schedule your first board meeting in minutes. Free forever for early-stage startups.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Schedule Your First Board Meeting
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> SOC 2 Compliant</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> No credit card</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> 1,000+ boards</span>
              </motion.div>
            </div>
          </AnimatedSection>
        </section>
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Newsletter CTA */}
          <div className="border border-slate-700 rounded-2xl p-8 mb-10 bg-slate-800/50">
            <div className="max-w-xl mx-auto text-center">
              <h3 className="text-white font-bold text-lg mb-2">Governance tips for startup founders</h3>
              <p className="text-slate-400 text-sm mb-4">Monthly board governance best practices, investor relations tips, and compliance updates for pre-seed to Series B founders.</p>
              {submitted ? (
                <p className="text-emerald-400 font-semibold text-sm">Subscribed! First edition on its way.</p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@startup.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">BoardBrief</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
            <p className="text-slate-500 text-sm">&copy; 2024 BoardBrief. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
