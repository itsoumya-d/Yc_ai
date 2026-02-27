import Link from 'next/link';
import {
  Feather,
  BookOpen,
  Users,
  Globe,
  Sparkles,
  PenLine,
  BookMarked,
  CheckCircle2,
  Star,
  ArrowRight,
  Layers,
} from 'lucide-react';

/* ─── ANIMATION & STYLE INJECTION ──────────────────────────────────────── */
const heroStyles = `
  @keyframes ink-reveal {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes quill-float {
    0%, 100% { transform: translateY(0px) rotate(-8deg); }
    50%       { transform: translateY(-8px) rotate(-8deg); }
  }
  @keyframes slow-drift {
    0%, 100% { transform: translateX(0) translateY(0); }
    33%       { transform: translateX(6px) translateY(-4px); }
    66%       { transform: translateX(-4px) translateY(3px); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  .ink-1 { animation: ink-reveal 0.7s ease both; }
  .ink-2 { animation: ink-reveal 0.7s ease 0.12s both; }
  .ink-3 { animation: ink-reveal 0.7s ease 0.24s both; }
  .ink-4 { animation: ink-reveal 0.7s ease 0.36s both; }
  .ink-5 { animation: ink-reveal 0.7s ease 0.48s both; }
  .ink-6 { animation: ink-reveal 0.7s ease 0.6s both; }
  .quill-anim { animation: quill-float 3s ease-in-out infinite; }
  .drift-anim  { animation: slow-drift 8s ease-in-out infinite; }
  .gold-shimmer {
    background: linear-gradient(90deg, #b8942e 0%, #fde047 40%, #d4a843 60%, #b8942e 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }
  .parchment-noise {
    background-image:
      radial-gradient(ellipse at 20% 50%, rgba(136,19,55,0.04) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(212,168,67,0.06) 0%, transparent 50%);
  }
  .rule-flourish {
    background: linear-gradient(90deg, transparent, #c8a97e 20%, #881337 50%, #c8a97e 80%, transparent);
    height: 1px;
  }
  .card-lift {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }
  .card-lift:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px -8px rgba(136,19,55,0.12);
  }
  .btn-primary {
    position: relative;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .btn-primary::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .btn-primary:hover::after {
    transform: translateX(0);
  }
`;

/* ─── DATA ─────────────────────────────────────────────────────────────── */
const features = [
  {
    icon: BookOpen,
    title: 'Manuscript Manager',
    desc: 'Organise chapters, track word counts, and navigate your entire manuscript from a single elegant workspace.',
    tag: 'Core',
  },
  {
    icon: Users,
    title: 'Character Bible',
    desc: 'Build layered character profiles — voice samples, backstory arcs, relationship maps, and personality matrices.',
    tag: 'Core',
  },
  {
    icon: Globe,
    title: 'World Architect',
    desc: 'Construct continents, factions, languages, and lore. Your world-building wiki, always one click away.',
    tag: 'Core',
  },
  {
    icon: Sparkles,
    title: 'AI Writing Companion',
    desc: 'Context-aware suggestions that know your characters, plot, and voice. Never break flow for a blank page.',
    tag: 'AI',
  },
  {
    icon: PenLine,
    title: 'Distraction-Free Editor',
    desc: 'A serene, full-screen prose environment with auto-save, focus mode, and ambient word-count goals.',
    tag: 'Writing',
  },
  {
    icon: BookMarked,
    title: 'Export & Publish',
    desc: 'One-click export to EPUB, PDF, and DOCX. Share a public reading link or send to beta readers instantly.',
    tag: 'Publish',
  },
];

const steps = [
  {
    num: '01',
    title: 'Build Your World',
    desc: "Start with your story's skeleton — genre, premise, cast of characters. Our structured templates guide you from blank page to living world.",
  },
  {
    num: '02',
    title: 'Write With Momentum',
    desc: 'The distraction-free editor keeps your narrative flowing. AI suggestions appear in context, shaped by everything you have already written.',
  },
  {
    num: '03',
    title: 'Share Your Story',
    desc: 'Export to any format, publish a public reading link, or send directly to beta readers — all from one polished dashboard.',
  },
];

const testimonials = [
  {
    quote: 'StoryThread is the first writing tool that actually understands my characters better than I do after chapter three.',
    name: 'Maren Holst',
    role: 'Fantasy novelist, 3 published books',
    initial: 'M',
  },
  {
    quote: 'I finished my first novel draft in four months. The world-building system alone is worth every penny.',
    name: 'James Okafor',
    role: 'Debut author, thriller writer',
    initial: 'J',
  },
  {
    quote: 'The AI suggestions never feel generic. It picks up on my prose style and offers lines I actually want to keep.',
    name: 'Selin Arslan',
    role: 'Literary fiction writer, MFA graduate',
    initial: 'S',
  },
];

const freePlan = [
  '3 active stories',
  'Unlimited chapters & characters',
  'World building toolkit',
  '50 AI writing suggestions / month',
  'EPUB & PDF export',
];

const proPlan = [
  'Unlimited stories',
  'Priority AI (GPT-4o)',
  'Unlimited AI suggestions',
  'Advanced analytics & insights',
  'Beta reader sharing links',
  'Version history',
  'Priority support',
];

/* ─── COMPONENT ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />

      <div className="min-h-screen bg-[var(--background)] parchment-noise overflow-x-hidden">

        {/* ── NAV ── */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(253,246,227,0.9)] backdrop-blur-sm">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <span className="flex items-center gap-2.5">
              <span className="quill-anim inline-block">
                <Feather className="h-5 w-5 text-brand-600" />
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--foreground)]">
                Story<span className="text-brand-600">Thread</span>
              </span>
            </span>
            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-brand-600 transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-brand-600 transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-primary rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Start Free
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative mx-auto max-w-6xl px-4 pt-20 pb-24 sm:px-6 lg:px-8">
          {/* Decorative large monogram */}
          <div
            aria-hidden
            className="drift-anim pointer-events-none absolute right-0 top-0 select-none text-[28rem] font-serif font-bold leading-none text-brand-600/[0.04] sm:text-[32rem] lg:right-12 lg:text-[40rem]"
          >
            S
          </div>

          <div className="relative max-w-3xl">
            {/* Badge */}
            <div className="ink-1 mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <Star className="h-3 w-3 fill-brand-500 text-brand-500" />
              <span>Join 12,400+ writers already crafting their worlds</span>
            </div>

            {/* Headline */}
            <h1 className="ink-2 font-serif text-5xl font-bold leading-[1.08] tracking-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Your story deserves
              <br />
              <span className="gold-shimmer">a worthy stage.</span>
            </h1>

            <p className="ink-3 mt-6 max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)]">
              StoryThread is the all-in-one writing studio for novelists — from world-building and
              character bibles to AI-assisted prose and one-click publishing. Everything you need,
              nothing you do not.
            </p>

            {/* CTAs */}
            <div className="ink-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Begin your story — it&apos;s free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Sign in to continue writing
              </Link>
            </div>

            {/* Social proof strip */}
            <div className="ink-5 mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {['M', 'J', 'S', 'A', 'K'].map((letter) => (
                  <div
                    key={letter}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--background)] bg-brand-600 text-xs font-bold text-white"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">12,400+</span> novelists,
                screenwriters &amp; storytellers
              </p>
            </div>
          </div>

          {/* Floating manuscript card */}
          <div className="ink-6 mt-12 lg:absolute lg:right-8 lg:top-24 lg:mt-0 lg:w-72">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-lg">
              <p className="font-serif text-sm italic leading-relaxed text-[var(--muted-foreground)]">
                &ldquo;The lantern light caught the edge of her blade — she&apos;d come too far to
                hesitate now. The city below held a thousand{' '}
                <span className="rounded bg-brand-50 px-0.5 text-brand-700">secrets</span>, and only
                one of them mattered.&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-gold-500" />
                <span className="text-xs text-[var(--muted-foreground)]">AI suggested continuation</span>
              </div>
              <div className="rule-flourish mt-3" />
              <p className="mt-2 text-xs font-medium text-[var(--muted-foreground)]">
                Chapter 12 · The Obsidian City · 2,341 words
              </p>
            </div>
          </div>
        </section>

        {/* ── GENRE STRIP ── */}
        <div className="border-y border-[var(--border)] bg-[var(--muted)] py-3 overflow-hidden">
          <div className="flex items-center gap-8 whitespace-nowrap text-xs font-semibold tracking-widest text-[var(--muted-foreground)] uppercase">
            {['Fantasy', 'Thriller', 'Romance', 'Sci-Fi', 'Literary', 'Mystery', 'Horror', 'Historical'].flatMap((g, i, arr) => [
              <span key={g}>{g}</span>,
              i < arr.length - 1 ? <span key={`sep-${g}`} className="text-brand-400">✦</span> : null,
            ])}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
              The Complete Studio
            </p>
            <h2 className="font-serif text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              Every tool the
              <br />
              <span className="italic text-brand-600">novelist</span> needs.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="card-lift group relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                    <f.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-serif text-base font-bold text-[var(--foreground)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.desc}</p>
                <div className="rule-flourish mt-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          className="relative overflow-hidden bg-[var(--foreground)] py-24"
        >
          {/* Decorative text */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 select-none font-serif text-[20rem] font-bold leading-none text-white/[0.02]"
          >
            III
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold-400">
                The Writing Journey
              </p>
              <h2 className="font-serif text-4xl font-bold text-white sm:text-5xl">
                From idea to manuscript,
                <br />
                <span className="gold-shimmer">in three acts.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="relative">
                  <div className="relative rounded-xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
                    <span className="font-serif text-5xl font-bold text-white/10">
                      {step.num}
                    </span>
                    <h3 className="mt-3 font-serif text-xl font-bold text-white">{step.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/signup"
                className="btn-primary inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Start your first story <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
              Reader Reviews
            </p>
            <h2 className="font-serif text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              From the writers&apos; room.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="card-lift rounded-xl border border-[var(--border)] bg-[var(--card)] p-7">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <blockquote className="font-serif text-sm italic leading-relaxed text-[var(--foreground)]">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="relative bg-[var(--muted)] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-600">
                Simple Pricing
              </p>
              <h2 className="font-serif text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
                Write freely.
                <br />
                <span className="italic text-brand-600">Upgrade when ready.</span>
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              {/* Free */}
              <div className="card-lift rounded-xl border border-[var(--border)] bg-[var(--card)] p-8">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <Layers className="mb-3 h-6 w-6 text-[var(--muted-foreground)]" />
                    <h3 className="font-serif text-2xl font-bold text-[var(--foreground)]">Free</h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">Forever, no credit card</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-4xl font-bold text-[var(--foreground)]">$0</span>
                    <span className="text-sm text-[var(--muted-foreground)]">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {freePlan.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-8 block w-full rounded-lg border border-brand-600 py-2.5 text-center text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  Get started free
                </Link>
              </div>

              {/* Pro */}
              <div className="card-lift relative rounded-xl border-2 border-brand-600 bg-[var(--card)] p-8 shadow-[0_0_0_4px_rgba(136,19,55,0.06)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-brand-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <Sparkles className="mb-3 h-6 w-6 text-brand-600" />
                    <h3 className="font-serif text-2xl font-bold text-[var(--foreground)]">Pro</h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">For serious novelists</p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-4xl font-bold text-[var(--foreground)]">$12</span>
                    <span className="text-sm text-[var(--muted-foreground)]">/mo</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {proPlan.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="btn-primary mt-8 block w-full rounded-lg bg-brand-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Start 14-day free trial
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <div className="rule-flourish mb-16 mx-auto max-w-xs" />
          <div className="quill-anim inline-block mb-6">
            <Feather className="mx-auto h-10 w-10 text-brand-400" />
          </div>
          <h2 className="mx-auto max-w-2xl font-serif text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
            Your next chapter
            <br />
            <span className="italic text-brand-600">starts today.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[var(--muted-foreground)]">
            Join over 12,000 writers who chose StoryThread as their creative home. No templates, no
            friction — just your story.
          </p>
          <Link
            href="/signup"
            className="btn-primary mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Begin writing for free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            No credit card required · Cancel any time · Free forever plan
          </p>
          <div className="rule-flourish mt-16 mx-auto max-w-xs" />
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-[var(--border)] bg-[var(--foreground)] py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <span className="flex items-center gap-2 font-serif text-lg font-bold text-white">
                  <Feather className="h-4 w-4 text-brand-400" />
                  StoryThread
                </span>
                <p className="mt-2 text-xs leading-relaxed text-white/50">
                  The novelist&apos;s writing studio. Build worlds. Craft characters. Tell stories.
                </p>
              </div>

              {/* Product */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Product</p>
                <ul className="space-y-2 text-sm text-white/60">
                  {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Writers */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Writers</p>
                <ul className="space-y-2 text-sm text-white/60">
                  {['Getting started', 'Writing guides', 'Community', 'Templates'].map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Company</p>
                <ul className="space-y-2 text-sm text-white/60">
                  {['About', 'Blog', 'Privacy', 'Terms'].map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-white transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rule-flourish mt-10 opacity-20" />
            <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-white/30 sm:flex-row">
              <p>© {new Date().getFullYear()} StoryThread. Where stories begin.</p>
              <p>Made for writers, by writers.</p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
