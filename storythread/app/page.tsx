'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Feather, BookOpen, Users, Globe, Sparkles, Star } from 'lucide-react';
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
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
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
    icon: BookOpen,
    title: 'Story Manager',
    description: 'Organize chapters, track word count, and manage multiple manuscripts. See your whole project at a glance.',
    badge: 'Core',
  },
  {
    icon: Users,
    title: 'Character Bible',
    description: 'Build deep character profiles — personality, backstory, voice, relationships. Your characters never act out of character.',
    badge: 'Character',
  },
  {
    icon: Globe,
    title: 'World Builder',
    description: "Map your world's locations, factions, history, and lore. The ultimate worldbuilding wiki, built for fiction.",
    badge: 'World',
  },
  {
    icon: Sparkles,
    title: 'AI Writing Assistant',
    description: 'GPT-4o suggests prose, dialogue, and plot continuations — trained to match your unique voice, not replace it.',
    badge: 'AI',
  },
];

const testimonials = [
  {
    quote: 'StoryThread is the only tool that actually understands the complexity of novel writing. My character relationships are finally organized.',
    name: 'Elena V.',
    role: 'Fantasy novelist, 3 books published',
    avatar: 'EV',
  },
  {
    quote: 'I\'ve been worldbuilding for 5 years across notebooks, Notion, and Google Docs. StoryThread brought it all together in a weekend.',
    name: 'James O.',
    role: 'Sci-Fi writer, 200K words in progress',
    avatar: 'JO',
  },
  {
    quote: 'The AI doesn\'t write for me — it helps me write. That\'s exactly the balance I wanted. It knows my characters\' voices better than I do.',
    name: 'Priya M.',
    role: 'Romance author, debut novel on Amazon',
    avatar: 'PM',
  },
];

const stats = [
  { value: '50,000+', label: 'Writers' },
  { value: '2M+', label: 'Stories Published' },
  { value: '180M+', label: 'Words Written' },
  { value: '4.8★', label: 'Rating' },
];

const genres = ['Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Horror', 'Literary Fiction', 'Thriller', 'Historical'];

const plans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    annualPrice: '$0',
    period: 'forever',
    description: 'Perfect for hobbyists and new writers',
    features: ['1 active project', 'Up to 5 chapters', 'Basic character profiles', 'Community access'],
    cta: 'Start Writing Free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Writer',
    monthlyPrice: '$14',
    annualPrice: '$11',
    period: 'per month',
    description: 'For serious fiction writers',
    features: ['Unlimited projects', 'Full AI writing assistant', 'Character & world bible', 'Export to Word/PDF', 'Beta reader sharing'],
    cta: 'Start Free Trial',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Studio',
    monthlyPrice: '$29',
    annualPrice: '$23',
    period: 'per month',
    description: 'For authors and writing groups',
    features: ['Everything in Writer', 'Co-author collaboration', 'Version history', 'Publisher export', 'Priority AI queue'],
    cta: 'Contact Sales',
    href: '/signup',
    highlight: false,
  },
];

const faqs = [
  {
    q: 'Does the AI write my story for me?',
    a: "No — and that's intentional. The AI acts as a co-author, suggesting prose and dialogue that fits your established voice, characters, and world rules. You stay in creative control at all times. Think of it as a very smart writing partner, not a ghostwriter.",
  },
  {
    q: 'Can I collaborate with other writers on the same story?',
    a: 'Yes, on the Studio plan you can invite co-authors to work on the same manuscript in real time. Each collaborator has presence indicators so you never overwrite each other. You can also share chapters with beta readers on any paid plan.',
  },
  {
    q: 'What happens to my stories if I cancel?',
    a: "Your stories are always yours. You can export your entire manuscript to Word, PDF, or plain text at any time — even on the free plan. We will never hold your work hostage. After cancellation, your data remains accessible for 90 days for export.",
  },
  {
    q: 'I already have notes in Notion / Google Docs. Can I import them?',
    a: "Yes. StoryThread accepts plain text, Markdown, Word documents, and Scrivener exports. Most writers migrate their full archive in under an hour using our import wizard. You can also paste content directly into any chapter or character profile.",
  },
  {
    q: 'Is there a word count limit on the AI assistant?',
    a: "The Writer plan includes 100,000 AI words per month — enough for most active novelists. The Studio plan is unlimited. On the free plan, you get 5,000 AI words per month to try it out. Unused words don't roll over.",
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
          <span className="flex items-center gap-2 font-heading text-xl font-bold text-brand-600">
            <Feather className="h-5 w-5" />
            StoryThread
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">Writers Love It</a>
            <a href="#genres" className="text-sm font-medium text-[var(--muted-foreground)] hover:text-brand-600 transition-colors">Genres</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Start Writing Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8 relative overflow-hidden">
        <ThreeHeroBackground />
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full opacity-10 blur-3xl bg-brand-400" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl bg-purple-400" />
        </div>

        <motion.div
          ref={heroRef}
          initial="hidden"
          animate={heroInView ? 'visible' : 'hidden'}
          variants={stagger}
          className="relative"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-6"
          >
            ✍️ AI-Powered Fiction Writing Platform
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl mb-6 leading-tight"
          >
            Write Stories That{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(135deg, var(--brand-600, #7C3AED) 0%, #EC4899 50%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Live Forever
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="mx-auto mt-4 max-w-2xl text-xl text-[var(--muted-foreground)] leading-relaxed mb-10">
            Build rich characters, immersive worlds, and compelling narratives — with an AI co-author that amplifies your vision instead of replacing it.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center mb-16">
            <Link href="/signup" className="w-full rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white transition-all hover:bg-brand-700 hover:scale-105 shadow-lg shadow-brand-200 sm:w-auto">
              Start Writing Free Today
            </Link>
            <Link href="/login" className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-8 py-4 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] sm:w-auto">
              Sign In
            </Link>
          </motion.div>

          {/* Stats */}
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

      {/* Genre strip */}
      <div className="border-y border-[var(--border)] bg-[var(--muted)] py-3 overflow-hidden">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-2 px-4">
            <span className="text-xs font-medium text-[var(--muted-foreground)] mr-2">Write in any genre:</span>
            {genres.map((g) => (
              <span key={g} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100">
                {g}
              </span>
            ))}
          </motion.div>
        </AnimatedSection>
      </div>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
              Your complete writing studio
            </h2>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Every tool a serious fiction writer needs — in one place, beautifully designed.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                    <feature.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-heading text-lg font-bold text-[var(--foreground)]">{feature.title}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">{feature.badge}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatedSection>
      </section>

      {/* How it works */}
      <section className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                From first draft to final chapter
              </h2>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Set up your world', desc: 'Create your story, define your world\'s rules, and add your characters. Import existing notes from anywhere.', icon: '🌍' },
                { step: '02', title: 'Write with AI support', desc: 'Draft scenes with your AI co-author. Get suggestions for dialogue, description, and plot that fit your established world.', icon: '✍️' },
                { step: '03', title: 'Publish your story', desc: 'Export your manuscript in any format. Share chapters with beta readers. Build your author profile.', icon: '📚' },
              ].map((item) => (
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

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <AnimatedSection>
          <motion.div variants={fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
              Writers love StoryThread
            </h2>
            <p className="text-lg text-[var(--muted-foreground)]">
              From hobbyists to published authors — they all write more, and write better.
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
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
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
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-[var(--border)] bg-[var(--muted)] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="font-heading text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-lg text-[var(--muted-foreground)]">
                Start free. Upgrade when your story demands it.
              </p>
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

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={scaleIn}
                  className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 flex flex-col ${plan.highlight ? 'ring-2 ring-brand-600 shadow-xl' : ''}`}
                >
                  <div className="mb-6">
                    <div className="text-xs font-bold text-brand-600 mb-2 uppercase">
                      {plan.name}
                      {plan.highlight && <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-brand-100">MOST POPULAR</span>}
                    </div>
                    <div className="text-4xl font-extrabold text-[var(--foreground)] mb-1">
                      {billing === 'annual' ? plan.annualPrice : plan.monthlyPrice}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">{plan.period}</div>
                    <p className="text-sm mt-2 text-[var(--muted-foreground)]">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <span className="text-brand-600">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`w-full text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 ${
                      plan.highlight
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
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
      <section className="py-20 bg-[var(--background)]">
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
      <section className="border-t border-[var(--border)] py-20 bg-[var(--muted)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <motion.div variants={scaleIn} className="rounded-3xl bg-brand-600 p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(255,255,255,0.12) 0%, transparent 60%)' }} />
              <div className="relative">
                <div className="text-4xl mb-4">📖</div>
                <h2 className="font-heading text-4xl font-extrabold text-white mb-4">
                  Your story deserves to be told
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Join 50,000+ writers who are finishing stories they thought they&apos;d never complete. Start free — no credit card required.
                </p>
                <Link
                  href="/signup"
                  className="inline-block px-10 py-4 rounded-xl font-bold text-brand-700 bg-white hover:scale-105 transition-transform shadow-lg"
                >
                  Start Writing Free Today
                </Link>
                <p className="text-white/60 text-sm mt-4">Free plan forever • No credit card • Cancel anytime</p>
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
              <h3 className="font-heading text-xl font-bold mb-2 text-[var(--foreground)]">Writing tips and feature updates</h3>
              <p className="text-sm mb-5 text-[var(--muted-foreground)]">Join thousands of writers getting craft advice and platform news in their inbox.</p>
              {emailSubmitted ? (
                <p className="text-sm font-semibold text-brand-600">You&apos;re on the list! Welcome to the StoryThread community.</p>
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
            <span className="flex items-center gap-2 font-heading font-bold text-brand-600">
              <Feather className="h-4 w-4" /> StoryThread
            </span>
            <div className="flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <Link href="/privacy" className="hover:text-brand-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-brand-600 transition-colors">Terms</Link>
            </div>
            <p className="text-center text-sm text-[var(--muted-foreground)]">
              © 2026 StoryThread — Where stories begin.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
