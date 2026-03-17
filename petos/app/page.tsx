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
    icon: '📋',
    title: 'Complete Health Records',
    description: 'Track vaccinations, medications, surgeries, and vet visits in one organized place. Share records instantly with any vet.',
    color: 'bg-blue-50 border-blue-100',
    iconBg: 'bg-blue-100',
  },
  {
    icon: '🤖',
    title: 'AI Symptom Checker',
    description: 'Upload a photo or describe symptoms for instant AI health analysis. Know when to call the vet — before it becomes an emergency.',
    color: 'bg-purple-50 border-purple-100',
    iconBg: 'bg-purple-100',
    badge: 'AI',
  },
  {
    icon: '🏥',
    title: 'Telehealth with Real Vets',
    description: 'Video consults with licensed veterinarians in minutes — not days. Available 7 days a week, including evenings.',
    color: 'bg-emerald-50 border-emerald-100',
    iconBg: 'bg-emerald-100',
  },
  {
    icon: '⚖️',
    title: 'Weight & Wellness Tracker',
    description: 'Log weight, activity, and food over time. Spot trends early — before they become expensive health issues.',
    color: 'bg-amber-50 border-amber-100',
    iconBg: 'bg-amber-100',
  },
  {
    icon: '💊',
    title: 'Medication Reminders',
    description: 'Never miss a flea treatment or heartworm pill. Smart reminders sent right to your phone.',
    color: 'bg-rose-50 border-rose-100',
    iconBg: 'bg-rose-100',
  },
  {
    icon: '💰',
    title: 'Pet Expense Tracking',
    description: 'Track every dollar spent on food, vet visits, grooming, and supplies. Know your true cost of pet ownership.',
    color: 'bg-teal-50 border-teal-100',
    iconBg: 'bg-teal-100',
  },
];

const stats = [
  { value: '100K+', label: 'Pets Tracked' },
  { value: '500+', label: 'Licensed Vets' },
  { value: '4.9★', label: 'App Rating' },
  { value: '<2 min', label: 'Avg. Telehealth Wait' },
];

const testimonials = [
  {
    quote: 'The AI symptom checker caught that my dog had an ear infection before it got bad. Saved me a $400 emergency vet bill.',
    name: 'Jessica L.',
    role: 'Dog mom to Max (Golden Retriever)',
    avatar: 'JL',
    petEmoji: '🐕',
  },
  {
    quote: 'I travel for work constantly. PetOS telehealth means I can check on my cat\'s health from anywhere without flying home for vet visits.',
    name: 'Marcus K.',
    role: 'Cat parent to Luna (Persian)',
    avatar: 'MK',
    petEmoji: '🐱',
  },
  {
    quote: 'Having all my dogs\' records in one app is life-changing. I have 3 dogs — previously I had 3 binders of paper records. Never again.',
    name: 'Stephanie R.',
    role: 'Multi-dog household (3 rescues)',
    avatar: 'SR',
    petEmoji: '🐕‍🦺',
  },
];

const howItWorks = [
  {
    step: '01',
    icon: '🐾',
    title: 'Add your pet',
    desc: 'Create a profile for your pet in 60 seconds. Upload their vaccination records or start fresh.',
  },
  {
    step: '02',
    icon: '📱',
    title: 'Track health & habits',
    desc: 'Log vet visits, medications, weight, and food. Get AI insights on their health trends over time.',
  },
  {
    step: '03',
    icon: '🏥',
    title: 'Get vet care when needed',
    desc: 'Book telehealth in minutes or find local vets from our network of 500+ licensed professionals.',
  },
];

const petTypes = ['Dogs', 'Cats', 'Rabbits', 'Birds', 'Fish', 'Hamsters', 'Reptiles', 'Guinea Pigs'];

const pricingPlans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: 'forever',
    description: 'For one pet, getting started',
    features: ['1 pet profile', 'Basic health records', 'Vaccination reminders', 'Community forum access'],
    cta: 'Add Your Pet Free',
    highlighted: false,
  },
  {
    name: 'Plus',
    monthlyPrice: '$9',
    annualPrice: '$7',
    period: 'per month',
    description: 'For dedicated pet parents',
    features: ['Up to 5 pets', 'AI symptom checker', '3 telehealth consults/month', 'Full health history', 'Medication reminders', 'Expense tracking'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Family',
    monthlyPrice: '$19',
    annualPrice: '$15',
    period: 'per month',
    description: 'For multi-pet households',
    features: ['Unlimited pets', 'Unlimited telehealth', 'Priority vet queue', 'Shareable records', 'Family account (3 users)', 'Annual wellness reports'],
    cta: 'Start Free Trial',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Is the AI symptom checker a replacement for a vet?',
    a: "No — and we're clear about that. The AI symptom checker is a triage tool designed to help you decide urgency: is this a wait-and-watch situation, a next-day vet visit, or a same-day emergency? It analyzes symptoms against veterinary databases but always recommends consulting a licensed vet for diagnosis and treatment. Think of it as a very informed second opinion.",
  },
  {
    q: 'How quickly can I connect with a vet for telehealth?',
    a: "Most telehealth connections happen within 2 minutes on Plus and Family plans. Our network of 500+ licensed veterinarians covers all 50 U.S. states and is available 7 days a week, including evenings and holidays. For non-urgent questions, you can also schedule same-day or next-day appointments.",
  },
  {
    q: "Can I share my pet's records with my regular vet?",
    a: "Yes. You can export a complete health summary as a PDF, or generate a shareable link that lets any vet view your pet's vaccination history, medication list, weight log, and recent vet notes. Many PetOS users email the link to new vets before appointments to save time on intake forms.",
  },
  {
    q: 'Does PetOS work for exotic pets, not just cats and dogs?',
    a: "Yes. PetOS supports health records, reminders, and expense tracking for all pet types — rabbits, birds, fish, reptiles, hamsters, guinea pigs, and more. Telehealth availability for exotic species depends on vet availability in your area; we currently have 80+ exotic animal specialists in our network.",
  },
  {
    q: "What happens to my pet's data if I cancel?",
    a: "Your pet's health data belongs to you. You can export a complete health record PDF at any time, even on the free plan. If you cancel a paid plan, you return to the free tier (1 pet). Your existing data is never deleted unless you explicitly request account deletion.",
  },
];

const trustedCompanies = ['Acme Corp', 'TechStart', 'BuildRight', 'DataFlow', 'NextScale', 'GrowthLabs'];

export default function HomePage() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="font-heading text-xl font-bold text-brand-600">PetOS</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">How It Works</a>
            <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors">Pet Parents Love It</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 transition-colors hover:scale-105">
              Add Your Pet Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center relative overflow-hidden">
        <ThreeHeroBackground />
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-10 blur-3xl rounded-full bg-brand-400" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 opacity-10 blur-3xl rounded-full bg-amber-300" />
        </div>

        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="relative"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center rounded-full bg-brand-50 border border-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700 mb-6">
            🐾 Trusted by 100,000+ pet parents worldwide
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
            The Complete Health Platform{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600, #059669) 0%, #0891b2 50%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              for Your Pet
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-xl text-gray-500 leading-relaxed mb-10">
            Track health records, get AI symptom analysis, and connect with licensed vets via telehealth — all in one app. Because your pet deserves more than a paper vaccination card.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-16 flex-col sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-brand-600 px-10 py-4 text-base font-bold text-white hover:bg-brand-700 hover:scale-105 transition-all shadow-lg shadow-brand-100"
            >
              Add Your Pet Free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-gray-200 px-10 py-4 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={scaleIn}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center"
              >
                <div className="text-2xl font-extrabold text-brand-600 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Trusted by logo strip */}
      <AnimatedSection>
        <motion.div
          variants={fadeUp}
          className="py-12 border-y border-gray-100"
        >
          <p className="text-center text-sm text-gray-400 mb-6 uppercase tracking-wider font-medium">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-40">
            {trustedCompanies.map((name) => (
              <span key={name} className="text-gray-600 font-bold text-lg tracking-tight">{name}</span>
            ))}
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Pet types strip */}
      <div className="border-y border-gray-100 bg-gray-50 py-3">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 px-4">
            <span className="text-xs font-medium text-gray-400 mr-2">Works for:</span>
            {petTypes.map((p) => (
              <span key={p} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                {p}
              </span>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Everything your pet needs — in your pocket
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Stop juggling paper records, reminder apps, and vet portals. PetOS is the one app that does it all.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className={`rounded-2xl border p-6 hover:shadow-md transition-shadow ${feature.color}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${feature.iconBg}`}>
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-900">{feature.title}</h3>
                  {'badge' in feature && feature.badge && (
                    <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{feature.badge}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-50 py-20 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Set up in under 2 minutes
              </h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">
                No paperwork. No vet portal login. Just add your pet and start tracking.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <motion.div key={item.step} variants={slideLeft} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 text-3xl mb-6 shadow-md shadow-brand-100">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-brand-500 mb-2 tracking-widest">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-6 py-20">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Pet parents obsess over PetOS
            </h2>
            <p className="text-lg text-gray-500">
              100,000+ pet parents trust PetOS to keep their companions healthy and happy.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={scaleIn}
                className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-amber-400">★</span>
                    ))}
                  </div>
                  <span className="text-2xl">{t.petEmoji}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-500 italic mb-6">
                  &quot;{t.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Simple pricing for every pet parent
              </h2>
              <p className="text-lg text-gray-500">
                Start free. Upgrade when your pet needs more.
              </p>
            </motion.div>

            {/* Billing toggle */}
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
              <span className={`text-sm font-medium transition-colors ${billing === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
                className={`relative w-14 h-7 rounded-full transition-colors ${billing === 'annual' ? 'bg-brand-600' : 'bg-gray-300'}`}
                aria-label="Toggle billing period"
              >
                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow ${billing === 'annual' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium transition-colors ${billing === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
                Annual <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">Save 20%</span>
              </span>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={scaleIn}
                  className={`rounded-2xl border p-8 flex flex-col bg-white ${plan.highlighted ? 'border-brand-600 ring-2 ring-brand-600 shadow-lg' : 'border-gray-100'}`}
                >
                  <div className="mb-6">
                    {plan.highlighted && (
                      <div className="text-xs font-bold bg-brand-600 text-white px-3 py-1 rounded-full inline-block mb-3">Most Popular</div>
                    )}
                    <div className="text-xs font-bold text-brand-600 mb-2 uppercase">{plan.name}</div>
                    <div className="text-4xl font-extrabold text-gray-900 mb-1">
                      {billing === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </div>
                    <div className="text-sm text-gray-500">{plan.period}</div>
                    <p className="text-sm mt-2 text-gray-500">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-brand-600">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
                      plan.highlighted
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
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
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-6">
          <AnimatedSection>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-center mb-12 text-gray-900">
              Frequently Asked Questions
            </motion.h2>
            <motion.div variants={stagger} className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
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
                        <div className="px-6 pb-4 text-gray-500 text-sm leading-relaxed">
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
      <section className="bg-gray-50 border-t border-gray-100 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <AnimatedSection>
            <motion.div
              variants={scaleIn}
              className="rounded-3xl bg-brand-600 p-14 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom right, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="text-5xl mb-4">🐾</div>
                <h2 className="text-4xl font-extrabold text-white mb-4">
                  Your pet deserves the best care
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Join 100,000+ pet parents who never miss a vaccination, always know their pet&apos;s health history, and get vet care in minutes — not days.
                </p>
                <Link
                  href="/signup"
                  className="inline-block px-10 py-4 rounded-xl font-bold text-brand-700 bg-white hover:scale-105 transition-transform shadow-lg text-base"
                >
                  Add Your Pet Free — Takes 60 Seconds
                </Link>
                <p className="text-white/60 text-sm mt-4">No credit card • Free plan forever • All pet types supported</p>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="mx-auto max-w-6xl px-6">
          {/* Newsletter CTA */}
          <AnimatedSection>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-8 mb-10 text-center"
            >
              <h3 className="font-heading text-xl font-bold mb-2 text-gray-900">Pet health tips in your inbox</h3>
              <p className="text-sm mb-5 text-gray-500">Seasonal health reminders, vet advice, and PetOS updates — curated for pet parents.</p>
              {emailSubmitted ? (
                <p className="text-sm font-semibold text-brand-600">You&apos;re in! Your first pet health digest is on its way.</p>
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
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-brand-400"
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
            <div className="flex items-center gap-2">
              <span className="text-xl">🐾</span>
              <span className="font-heading font-bold text-brand-600">PetOS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} PetOS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
