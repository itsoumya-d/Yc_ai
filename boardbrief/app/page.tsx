import Link from 'next/link';
import { Shield, Calendar, Users, CheckSquare, Sparkles, Vote, BarChart3, ArrowRight, Star } from 'lucide-react';

const styles = `
  @keyframes rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shield-glow {
    0%, 100% { filter: drop-shadow(0 0 0px rgba(200,169,81,0)); }
    50%       { filter: drop-shadow(0 0 8px rgba(200,169,81,0.5)); }
  }
  .r1 { animation: rise 0.6s ease both; }
  .r2 { animation: rise 0.6s ease 0.1s both; }
  .r3 { animation: rise 0.6s ease 0.2s both; }
  .r4 { animation: rise 0.6s ease 0.3s both; }
  .r5 { animation: rise 0.6s ease 0.4s both; }
  .shield-anim { animation: shield-glow 3s ease-in-out infinite; }
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px -4px rgba(200,169,81,0.2);
  }
  .navy-bg {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  }
  .gold-text {
    background: linear-gradient(135deg, #c8a951 0%, #e2c687 50%, #c8a951 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gold-border { border-color: rgba(200,169,81,0.3); }
  .btn-gold {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #c8a951, #b08f3a);
    transition: opacity 0.2s ease;
  }
  .btn-gold:hover { opacity: 0.9; }
  .divider-gold {
    background: linear-gradient(90deg, transparent, rgba(200,169,81,0.4), transparent);
    height: 1px;
  }
`;

const features = [
  { icon: Calendar, title: 'Meeting Management', desc: 'Schedule board meetings with AI-generated agendas, automated notices, and real-time minute tracking.' },
  { icon: Users, title: 'Board Directory', desc: 'Manage directors, their roles, term limits, committee memberships, and voting rights in one place.' },
  { icon: CheckSquare, title: 'Action Tracking', desc: 'Assign action items with owners and deadlines. Automatic follow-ups ensure nothing falls through the cracks.' },
  { icon: Vote, title: 'Resolutions & Votes', desc: 'Draft resolutions, collect electronic votes, and maintain a complete audit trail for every board decision.' },
  { icon: Sparkles, title: 'AI Meeting Assistant', desc: 'Generate agendas, draft board packages, and produce professional meeting minutes automatically.' },
  { icon: BarChart3, title: 'Governance Dashboard', desc: 'Board health score, upcoming deadlines, open action items, and compliance metrics at a glance.' },
];

const stats = [
  { value: '87%', label: 'Reduction in meeting prep time' },
  { value: '3x', label: 'Faster minute approval' },
  { value: '100%', label: 'Audit-ready at all times' },
];

const testimonials = [
  {
    quote: "Our board meetings used to take 4 hours. With BoardBrief generating the agenda and pre-reading materials, we're down to 90 minutes.",
    name: 'Rachel T.',
    role: 'CEO, Series A SaaS company',
    initial: 'R',
  },
  {
    quote: "The AI-generated minutes are better than what our previous secretary produced. Directors love having everything in one place.",
    name: 'James M.',
    role: 'CFO, Venture-backed startup',
    initial: 'J',
  },
  {
    quote: "BoardBrief gave us the governance infrastructure of a public company at a fraction of the cost.",
    name: 'Anika S.',
    role: 'General Counsel, Series B startup',
    initial: 'A',
  },
];

export default function LandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">

        {/* NAV */}
        <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5">
              <span className="shield-anim">
                <Shield className="h-6 w-6 text-gold-500" />
              </span>
              <span className="font-heading text-xl font-bold text-[var(--foreground)]">
                Board<span className="gold-text">Brief</span>
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <a href="#features" className="hover:text-gold-600 transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-gold-600 transition-colors">Reviews</a>
              <a href="#pricing" className="hover:text-gold-600 transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-[var(--foreground)] hover:text-gold-600 transition-colors">
                Log In
              </Link>
              <Link href="/signup" className="btn-gold rounded-lg px-4 py-2 text-sm font-semibold text-white">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="navy-bg relative overflow-hidden py-24">
          {/* Gold grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(200,169,81,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,81,0.04) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
          {/* Decorative shield watermark */}
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 text-[30rem] text-white/[0.015] select-none leading-none">
            ⬡
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="r1 mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-300">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                Built for YC founders, fast-growing startups, and governance teams
              </div>

              <h1 className="r2 font-heading text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                Board governance,
                <br />
                <span className="gold-text">beautifully managed.</span>
              </h1>

              <p className="r3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-300">
                BoardBrief is the AI-powered governance platform for startup founders. Prepare meetings in minutes,
                track every resolution, and maintain board-ready compliance — effortlessly.
              </p>

              <div className="r4 mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/signup"
                  className="btn-gold inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-semibold text-white"
                >
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Log In
                </Link>
              </div>

              {/* Stats */}
              <div className="r5 mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-12">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-heading text-3xl font-bold text-gold-400">{s.value}</p>
                    <p className="mt-1 text-xs text-navy-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-600">
              The Complete Platform
            </p>
            <h2 className="font-heading text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              Everything your board needs,
              <br />
              nothing it doesn&apos;t.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover rounded-xl border border-[var(--border)] bg-white p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-50">
                  <f.icon className="h-5 w-5 text-gold-600" />
                </div>
                <h3 className="font-heading text-base font-semibold text-[var(--foreground)]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="bg-[var(--muted)] py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="font-heading text-4xl font-bold text-[var(--foreground)]">
                Trusted by startup leaders
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="card-hover rounded-xl border border-[var(--border)] bg-white p-7">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold-400 text-gold-400" />
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-[var(--foreground)]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 text-sm font-bold text-white">
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
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-4xl font-bold text-[var(--foreground)]">
              Simple pricing
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[var(--muted-foreground)]">
              Start free, upgrade as your board grows.
            </p>
          </div>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                name: 'Free',
                price: '$0',
                desc: 'For early-stage startups',
                features: ['1 board', '5 board members', 'Meeting management', 'Action tracking', 'Basic resolutions'],
                cta: 'Get started free',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '$49',
                desc: 'Per month, billed annually',
                features: ['Unlimited boards', 'Unlimited members', 'AI meeting assistant', 'AI-generated minutes', 'Resolution library', 'Audit trail & compliance', 'Board portal for directors'],
                cta: 'Start 14-day trial',
                highlight: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`card-hover relative rounded-xl border p-8 ${
                  plan.highlight
                    ? 'border-gold-400 bg-white shadow-[0_0_0_4px_rgba(200,169,81,0.08)]'
                    : 'border-[var(--border)] bg-white'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="btn-gold rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">
                      Recommended
                    </span>
                  </div>
                )}
                <h3 className="font-heading text-xl font-bold">{plan.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{plan.desc}</p>
                <p className="mt-4">
                  <span className="font-heading text-4xl font-bold">{plan.price}</span>
                  {plan.highlight && <span className="text-sm text-[var(--muted-foreground)]">/mo</span>}
                </p>
                <ul className="mt-5 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckSquare className="h-4 w-4 shrink-0 text-gold-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className={`mt-7 block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'btn-gold text-white'
                      : 'border border-[var(--border)] hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="navy-bg py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <Shield className="mx-auto h-12 w-12 text-gold-400 shield-anim" />
            <h2 className="mt-5 font-heading text-4xl font-bold text-white sm:text-5xl">
              Build board confidence,
              <br />
              <span className="gold-text">from day one.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-navy-300">
              Join 2,400+ founders and governance teams who use BoardBrief to run efficient, professional board meetings.
            </p>
            <Link
              href="/signup"
              className="btn-gold mt-8 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white"
            >
              Start free today <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-navy-400">No credit card required · Free forever plan available</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[var(--border)] bg-white py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--muted-foreground)] sm:flex-row">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gold-500" />
                <span className="font-heading font-bold text-[var(--foreground)]">BoardBrief</span>
                <span>— Governance made simple</span>
              </div>
              <div className="flex gap-6">
                {['Privacy', 'Terms', 'Security', 'Contact'].map((l) => (
                  <a key={l} href="#" className="hover:text-gold-600 transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} BoardBrief. SOC 2 compliant · GDPR ready
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
