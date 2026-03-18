'use client';

import Link from 'next/link';
import { ROICalculator } from '@/components/ROICalculator';
import { ThreeHeroBackground } from '@/components/three/ThreeHeroBackground';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Shield,
  FileSearch,
  TrendingUp,
  Network,
  BarChart3,
  Lock,
  ArrowRight,
  Scale,
  CheckCircle,
  Star,
  AlertTriangle,
  Search,
  Clock,
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
    icon: BarChart3,
    title: "Benford's Law Engine",
    description: "Apply statistical digit-frequency analysis to thousands of invoices in seconds. Our proprietary Benford engine flags anomalous billing patterns with confidence scoring.",
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Network,
    title: 'Network Graph Analysis',
    description: 'Visualize hidden connections between vendors, payments, and shell entities. Uncover kickback schemes and related-party fraud that linear analysis misses.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: TrendingUp,
    title: 'AI Pattern Detection',
    description: 'Detect overbilling, duplicate payments, phantom vendors, and 5 more fraud patterns with statistical confidence scoring across millions of records.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FileSearch,
    title: 'OCR Document Analysis',
    description: 'Ingest invoices, contracts, and payment records with AI-powered OCR. Automatically extract entities, amounts, dates, and relationships at scale.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Scale,
    title: 'Evidence Timeline',
    description: 'Build chronological evidence chains linking documents, payments, and communications into court-ready packages for False Claims Act litigation.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Lock,
    title: 'Attorney-Client Security',
    description: 'End-to-end encryption, per-case access controls, and comprehensive audit trails. Full legal privilege protection from intake to verdict.',
    color: 'bg-slate-50 text-slate-600',
  },
];

const stats = [
  { value: '$2B+', label: 'Fraud Detected' },
  { value: '94%', label: 'Detection Rate' },
  { value: '4.8★', label: 'Attorney Rating' },
  { value: '10x', label: 'Faster Case Build' },
];

const testimonials = [
  {
    quote: 'ClaimForge found $4.2M in overbilling patterns we would have never spotted manually. The Benford analysis alone justified the entire engagement.',
    author: 'Robert Hanley',
    title: 'Partner, Hanley & Associates (Qui Tam)',
    avatar: 'RH',
  },
  {
    quote: "The network graph surfaced a shell company scheme we'd been chasing for 6 months — in 40 minutes. It's the most powerful investigation tool I've used.",
    author: 'Maria Santos',
    title: 'Chief Investigator, Government Accountability Office',
    avatar: 'MS',
  },
  {
    quote: 'We built a complete 500-page evidence package for a $50M False Claims case in 3 weeks instead of 3 months. ClaimForge is a game changer for qui tam work.',
    author: 'James Whitmore',
    title: 'Senior Counsel, Whitmore Fraud Practice',
    avatar: 'JW',
  },
];

const pricingPlans = [
  {
    name: 'Investigator',
    monthlyPrice: 199,
    annualPrice: 159,
    period: '/month',
    desc: 'For individual fraud investigators and consultants',
    features: ['Up to 5 active cases', "Benford's Law engine", 'OCR document ingestion', 'Pattern detection', 'Evidence timeline', 'PDF evidence export'],
    cta: 'Open Your First Case Free',
    highlight: false,
  },
  {
    name: 'Law Firm',
    monthlyPrice: 599,
    annualPrice: 479,
    period: '/month',
    desc: 'For qui tam attorneys and fraud litigation practices',
    features: ['Unlimited cases', 'Everything in Investigator', 'Network graph analysis', 'AI pattern detection', 'Multi-attorney access', 'Court-ready packages', 'Priority support'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    monthlyPrice: null,
    annualPrice: null,
    period: '',
    desc: 'For government agencies and large compliance teams',
    features: ['Unlimited cases & users', 'Custom AI models', 'On-premise deployment', 'USASpending.gov API', 'SSO & SCIM', 'Dedicated support', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlight: false,
  },
];

const fraudTypes = [
  { name: 'Duplicate Billing', severity: 'High', icon: AlertTriangle, color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'Phantom Vendors', severity: 'Critical', icon: Search, color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'Overbilling Schemes', severity: 'High', icon: TrendingUp, color: 'bg-orange-50 border-orange-200 text-orange-800' },
  { name: 'Related-Party Fraud', severity: 'Critical', icon: Network, color: 'bg-red-50 border-red-200 text-red-800' },
  { name: 'Time & Labor Fraud', severity: 'Medium', icon: Clock, color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  { name: 'Contract Fraud', severity: 'High', icon: FileSearch, color: 'bg-orange-50 border-orange-200 text-orange-800' },
];

const faqs = [
  {
    q: 'What is the False Claims Act and how does ClaimForge support FCA cases?',
    a: 'The False Claims Act (31 U.S.C. §§ 3729–3733) imposes liability on entities that defraud the federal government. Qui tam provisions allow private whistleblowers to sue on behalf of the government and receive 15–30% of recovered funds. ClaimForge accelerates FCA case development with Benford\'s Law statistical analysis, network graph fraud mapping, OCR document ingestion, and court-ready evidence package generation — cutting case build time by up to 10x.',
  },
  {
    q: 'How does ClaimForge manage evidence and maintain chain of custody?',
    a: 'Every document ingested into ClaimForge receives an immutable timestamp, cryptographic hash, and access log. The evidence timeline maintains a full chain of custody from intake to export. When you generate a court-ready package, ClaimForge applies bates numbering, creates a document index, and generates a privilege log — all automatically, with every custodial event recorded in a tamper-evident audit trail.',
  },
  {
    q: 'How does case tracking work for long-running investigations?',
    a: 'ClaimForge organizes each investigation into a structured case file with a timeline, anomaly register, entity relationship map, and task tracker. You can assign investigation tasks to team members, set deadlines, track status, and generate progress reports for clients or oversight bodies. All case activity is logged and exportable.',
  },
  {
    q: 'Can multiple attorneys and investigators work on the same case?',
    a: 'Yes. The Law Firm and Enterprise plans support multi-user case access with role-based permissions — attorneys, investigators, paralegals, and clients can each have appropriately scoped access. Real-time collaborative annotation lets multiple team members work on the same document set simultaneously. All activity is logged with user attribution.',
  },
  {
    q: 'How does ClaimForge protect sensitive case data and attorney-client privilege?',
    a: 'ClaimForge is SOC 2 Type II certified with AES-256 encryption at rest and TLS 1.3 in transit. All case data is stored in isolated per-client vaults with no cross-customer data access. Role-based access controls and per-case attorney-client privilege designations allow you to share selective evidence with investigators while keeping privileged communications restricted. On-premise deployment is available for government agencies on the Enterprise plan.',
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
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">ClaimForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-red-600 transition-colors">Features</a>
            <a href="#fraud-types" className="hover:text-red-600 transition-colors">Fraud Types</a>
            <a href="#testimonials" className="hover:text-red-600 transition-colors">Clients</a>
            <a href="#pricing" className="hover:text-red-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden bg-gradient-to-br from-slate-50 via-red-50/20 to-white">
          <ThreeHeroBackground />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/4 w-80 h-80 bg-red-400/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-slate-400/8 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-2 rounded-full mb-8"
            >
              <Shield className="w-3.5 h-3.5" />
              False Claims Act Intelligence Platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6"
            >
              Detect Fraud Before It{' '}
              <span className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                Costs You Millions
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              AI-powered investigation platform that applies Benford&apos;s Law, network graph analysis, and OCR document processing to build airtight False Claims Act cases — 10x faster.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
            >
              <Link
                href="/signup"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg shadow-red-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Open Your First Case Free
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
              No credit card required · SOC 2 Type II Certified · Attorney-client privilege protected
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
                    { label: 'Anomalies Found', value: '347', sub: 'Requires review', color: 'text-red-600' },
                    { label: 'Fraud Estimated', value: '$4.2M', sub: 'Flagged amount', color: 'text-orange-600' },
                    { label: 'Confidence Score', value: '94%', sub: "Benford's test", color: 'text-emerald-600' },
                    { label: 'Docs Processed', value: '12,847', sub: 'Via OCR', color: 'text-blue-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                      <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-slate-400">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-red-700 font-medium">Critical: Vendor &quot;Apex Solutions LLC&quot; shares address with 3 shell entities — network fraud detected</span>
                  <span className="ml-auto text-red-600 font-semibold text-xs">Investigate →</span>
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
        <section className="bg-slate-900 py-12">
          <AnimatedSection>
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((s) => (
                <motion.div key={s.label} variants={fadeUp}>
                  <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
                  <p className="text-slate-400 text-sm font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.p variants={fadeUp} className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-3">
                Investigation Intelligence
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                The most powerful fraud detection platform for legal teams
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500 max-w-2xl mx-auto">
                ClaimForge combines statistical analysis, AI pattern detection, and network mapping to find fraud that traditional audits miss.
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
                  <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* Fraud types */}
        <section id="fraud-types" className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Built to catch every type of government fraud
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Specialized detection algorithms for the most common False Claims Act schemes.
              </motion.p>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fraudTypes.map((fraud) => (
                <motion.div
                  key={fraud.name}
                  variants={fadeUp}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 ${fraud.color}`}
                >
                  <fraud.icon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{fraud.name}</p>
                    <p className="text-xs opacity-70">{fraud.severity} risk</p>
                  </div>
                  <CheckCircle className="w-4 h-4 ml-auto opacity-70" />
                </motion.div>
              ))}
            </AnimatedSection>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                From documents to verdict in 4 steps
              </motion.h2>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Ingest Documents', desc: 'Upload invoices, contracts, and records. OCR extracts all data automatically — no manual entry.' },
                { step: '2', title: 'AI Analysis', desc: "Benford's Law engine and AI patterns scan millions of data points in minutes, not months." },
                { step: '3', title: 'Build Evidence', desc: 'Link anomalies to documents, entities, and payments in a chronological evidence chain.' },
                { step: '4', title: 'Export & Litigate', desc: 'Generate court-ready evidence packages with bates numbering, indexes, and privilege logs.' },
              ].map((s, i) => (
                <motion.div key={s.step} variants={fadeUp} className="relative flex flex-col items-center text-center">
                  {i < 3 && (
                    <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gradient-to-r from-red-500 to-slate-200 z-0" />
                  )}
                  <div className="relative z-10 w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4 shadow-lg shadow-red-200">
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
        <section id="testimonials" className="py-24 px-6 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection className="text-center mb-16">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Trusted by fraud investigators and qui tam attorneys
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Used on $2B+ in recovered fraud across government contracts and healthcare.
              </motion.p>
            </AnimatedSection>
            <AnimatedSection className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t) => (
                <motion.div key={t.author} variants={fadeUp} className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">{t.avatar}</div>
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
        <section id="pricing" className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection className="text-center mb-10">
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-slate-900 mb-4">
                Pricing built for investigators
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-slate-500">
                Start with one case free. Scale as your caseload grows.
              </motion.p>
            </AnimatedSection>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'annual' ? 'bg-red-600' : 'bg-gray-300'}`}
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
                        ? 'border-red-600 bg-red-600 text-white shadow-2xl shadow-red-200 -mt-4 -mb-4'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="bg-amber-400 text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full shadow">MOST POPULAR</span>
                      </div>
                    )}
                    <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                    <p className={`text-sm mb-4 ${plan.highlight ? 'text-red-100' : 'text-slate-500'}`}>{plan.desc}</p>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-4xl font-extrabold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{displayPrice}</span>
                      <span className={`text-sm mb-1 ${plan.highlight ? 'text-red-100' : 'text-slate-500'}`}>{plan.period}</span>
                    </div>
                    {billing === 'annual' && plan.annualPrice !== null && (
                      <p className={`text-xs mb-5 ${plan.highlight ? 'text-red-100' : 'text-slate-400'}`}>
                        Billed annually (${(plan.annualPrice ?? 0) * 12}/yr)
                      </p>
                    )}
                    {!(billing === 'annual' && plan.annualPrice !== null) && <div className="mb-5" />}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-red-200' : 'text-emerald-500'}`} />
                          <span className={`text-sm ${plan.highlight ? 'text-red-50' : 'text-slate-700'}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/signup"
                      className={`block text-center font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                        plan.highlight
                          ? 'bg-white text-red-600 hover:bg-red-50'
                          : 'bg-red-600 text-white hover:bg-red-700'
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
        <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-red-950">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center">
              <motion.div variants={fadeUp}>
                <Shield className="w-12 h-12 text-red-400 mx-auto mb-6" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl font-extrabold text-white mb-4">
                Every day of delay costs your client money
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xl text-slate-400 mb-10">
                Open your first case in minutes and let AI find the patterns that human review misses.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Open Your First Case Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mt-8 text-slate-400 text-sm">
                <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" /> SOC 2 Type II</span>
                <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Attorney-client privilege</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> No credit card</span>
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
              <h3 className="text-white font-bold text-lg mb-2">FCA intelligence &amp; fraud detection briefings</h3>
              <p className="text-slate-400 text-sm mb-4">Monthly updates on False Claims Act case law, fraud detection techniques, and qui tam litigation trends for attorneys and investigators.</p>
              {submitted ? (
                <p className="text-emerald-400 font-semibold text-sm">Subscribed! First briefing on its way.</p>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="attorney@lawfirm.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold text-lg">ClaimForge</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
            <p className="text-slate-500 text-sm">&copy; 2024 ClaimForge. SOC 2 Type II Certified.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
