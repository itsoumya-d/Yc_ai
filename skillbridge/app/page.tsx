import Link from "next/link";
import {
  Compass,
  ClipboardCheck,
  TrendingUp,
  GraduationCap,
  Zap,
  Target,
  BookOpen,
  Briefcase,
  FileText,
  BarChart3,
  Star,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Upload Your Resume",
    description:
      "Our AI analyzes your experience and identifies your transferable skills in seconds.",
    Icon: ClipboardCheck,
  },
  {
    number: 2,
    title: "Explore Career Paths",
    description:
      "Browse careers matched to your skills with salary data, growth trends, and skill gap analysis.",
    Icon: TrendingUp,
  },
  {
    number: 3,
    title: "Follow Your Plan",
    description:
      "Get a personalized learning roadmap with curated courses to bridge your skill gaps.",
    Icon: GraduationCap,
  },
];

const features = [
  {
    title: "AI Skills Analysis",
    description:
      "Upload your resume and let AI identify your transferable skills across industries.",
    Icon: Zap,
  },
  {
    title: "Career Matching",
    description:
      "Get matched with growing careers based on your unique skill profile.",
    Icon: Target,
  },
  {
    title: "Learning Paths",
    description:
      "Curated course recommendations from top platforms to fill skill gaps.",
    Icon: BookOpen,
  },
  {
    title: "Smart Job Board",
    description:
      "Jobs scored by skill match with missing skill alerts.",
    Icon: Briefcase,
  },
  {
    title: "Resume Builder",
    description:
      "AI-powered resume rewriter optimized for your target role.",
    Icon: FileText,
  },
  {
    title: "Progress Tracking",
    description:
      "Visual dashboard to track your career transition journey.",
    Icon: BarChart3,
  },
];

const testimonials = [
  {
    quote:
      "SkillBridge helped me transition from teaching to UX design in 6 months. The skill matching was eye-opening.",
    name: "Sarah M.",
    transition: "Teacher → UX Designer",
    initials: "SM",
    color: "bg-brand-100 text-brand-700",
  },
  {
    quote:
      "I never realized my project management skills translated so well to tech. Now I'm a Product Manager!",
    name: "Marcus J.",
    transition: "Construction PM → Product Manager",
    initials: "MJ",
    color: "bg-sunrise-100 text-sunrise-700",
  },
  {
    quote:
      "The learning path feature kept me on track. I completed my transition in record time.",
    name: "Priya K.",
    transition: "Retail Manager → Data Analyst",
    initials: "PK",
    color: "bg-brand-100 text-brand-700",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Get started with the basics",
    badge: null,
    features: [
      "AI skills assessment",
      "Basic skills profile",
      "3 career matches",
      "Community access",
      "1 resume",
    ],
    buttonText: "Get Started Free",
    buttonStyle:
      "border border-brand-600 text-brand-600 hover:bg-brand-50",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "For serious career changers",
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Unlimited career matches",
      "Full learning paths",
      "Job board access",
      "5 resumes",
    ],
    buttonText: "Start Pro Trial",
    buttonStyle:
      "bg-brand-600 text-white hover:bg-brand-700 shadow-lg",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$39",
    period: "/mo",
    description: "Maximum support and tools",
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "AI resume rewriter",
      "Mentor access",
      "Priority support",
      "Unlimited resumes",
    ],
    buttonText: "Start Premium Trial",
    buttonStyle:
      "border border-brand-600 text-brand-600 hover:bg-brand-50",
    highlighted: false,
  },
];

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Press", href: "#" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "API", href: "#" },
  ],
};

const logos = ["Google", "Microsoft", "Amazon", "Meta", "Apple"];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="h-7 w-7 text-brand-600" />
            <span className="font-heading text-xl text-brand-600">
              SkillBridge
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:items-center lg:px-8">
          {/* Left content */}
          <div className="flex flex-col items-start">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
              <Zap className="h-4 w-4" />
              AI-Powered Career Navigator
            </span>

            <h1 className="font-heading text-5xl leading-[1.1] tracking-tight md:text-6xl">
              Discover Your Next{" "}
              <span className="text-brand-600">Career Move</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--muted-foreground)]">
              SkillBridge identifies your transferable skills, matches you with
              growing careers, and builds a personalized learning path — all
              powered by AI.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:bg-brand-700 hover:shadow-xl"
              >
                Start Free Assessment
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-7 py-3.5 text-base font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["bg-brand-300", "bg-sunrise-300", "bg-brand-400", "bg-sunrise-400"].map(
                  (bg, i) => (
                    <div
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-white ${bg}`}
                    />
                  )
                )}
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Join{" "}
                <span className="font-semibold text-[var(--foreground)]">
                  10,000+
                </span>{" "}
                career changers
              </p>
            </div>
          </div>

          {/* Right decorative blobs */}
          <div className="relative hidden h-[480px] lg:block" aria-hidden="true">
            <div className="absolute right-0 top-8 h-72 w-72 rounded-full bg-brand-200/60 blur-sm" />
            <div className="absolute right-24 top-32 h-64 w-64 rounded-full bg-brand-100/80 blur-sm" />
            <div className="absolute right-12 top-56 h-56 w-56 rounded-full bg-sunrise-100/70 blur-sm" />
            <div className="absolute right-40 top-16 h-40 w-40 rounded-full bg-brand-300/40 blur-sm" />
          </div>
        </div>
      </section>

      {/* ─── Logos Bar ─── */}
      <section className="border-y border-[var(--border)] bg-[var(--muted)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm font-medium text-[var(--muted-foreground)]">
            Trusted by professionals from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {logos.map((name) => (
              <span
                key={name}
                className="text-lg font-bold tracking-wide text-[var(--muted-foreground)]/60"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl">
              How SkillBridge Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Three simple steps to your new career
            </p>
          </div>

          <div className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {/* Connecting line (desktop) */}
            <div
              className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-300 to-brand-200 md:block"
              aria-hidden="true"
            />

            {steps.map(({ number, title, description, Icon }) => (
              <div
                key={number}
                className="relative flex flex-col items-center text-center"
              >
                {/* Number circle */}
                <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg">
                  <Icon className="h-8 w-8" />
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-sunrise-400 text-xs font-bold text-white shadow">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-xl">{title}</h3>
                <p className="mt-3 max-w-xs text-[var(--muted-foreground)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section id="features" className="scroll-mt-20 bg-[var(--muted)]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl">
              Everything You Need for a Career Change
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Powerful tools designed to guide every step of your transition
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl">
              Career Changes, Made Real
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Hear from professionals who made the leap
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map(({ quote, name, transition, initials, color }) => (
              <div
                key={name}
                className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]"
              >
                {/* Stars */}
                <div className="flex gap-0.5 text-sunrise-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-[var(--foreground)] leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${color}`}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {transition}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section id="pricing" className="scroll-mt-20 bg-[var(--muted)]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="font-heading text-3xl md:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Start free. Upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {pricingPlans.map(
              ({
                name,
                price,
                period,
                description,
                badge,
                features: planFeatures,
                buttonText,
                buttonStyle,
                highlighted,
              }) => (
                <div
                  key={name}
                  className={`relative flex flex-col rounded-2xl border bg-[var(--card)] p-8 shadow-[var(--shadow-card)] ${
                    highlighted
                      ? "border-sunrise-400 shadow-[var(--shadow-card-hover)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  {badge && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold ${
                        highlighted
                          ? "bg-sunrise-400 text-white"
                          : "bg-brand-100 text-brand-700"
                      }`}
                    >
                      {badge}
                    </span>
                  )}

                  <h3 className="font-heading text-lg">{name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-heading text-4xl">{price}</span>
                    <span className="text-[var(--muted-foreground)]">
                      {period}
                    </span>
                  </div>

                  <ul className="mt-8 flex flex-1 flex-col gap-3">
                    {planFeatures.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-start gap-2 text-sm"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/signup"
                    className={`mt-8 block rounded-full px-6 py-3 text-center text-sm font-semibold transition-colors ${buttonStyle}`}
                  >
                    {buttonText}
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="bg-brand-600">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl text-white md:text-4xl">
            Ready to Start Your Career Transition?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Join thousands of professionals who&apos;ve found their next career
            with SkillBridge.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-700 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Brand column */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-brand-600" />
                <span className="font-heading text-lg text-brand-600">
                  SkillBridge
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                AI-powered career navigation for professionals ready to make
                their next move.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading}>
                <h4 className="text-sm font-semibold">{heading}</h4>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {links.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 sm:flex-row">
            <p className="text-sm text-[var(--muted-foreground)]">
              &copy; 2026 SkillBridge. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "GitHub"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
