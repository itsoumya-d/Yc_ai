import Link from 'next/link';
import {
  ShoppingCart, Wrench, Vote, Sparkles, ShieldCheck, Calendar,
  Users, ArrowRight, MapPin, Star, TrendingUp,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShoppingCart, label: 'Group Purchasing',
    desc: 'Save 30–40% with bulk neighborhood orders',
    color: 'bg-[#DCFCE7] text-[#16A34A]',
  },
  {
    icon: Wrench, label: 'Resource Sharing',
    desc: 'Borrow tools and equipment from neighbors',
    color: 'bg-[#E0F2FE] text-[#0369A1]',
  },
  {
    icon: Vote, label: 'Democratic Voting',
    desc: 'Transparent polls and ranked-choice voting',
    color: 'bg-[#EFF6FF] text-[#2563EB]',
  },
  {
    icon: Sparkles, label: 'AI Summaries',
    desc: 'Never miss key decisions again',
    color: 'bg-[#F0FDF4] text-[#16A34A]',
  },
  {
    icon: ShieldCheck, label: 'Safety Alerts',
    desc: 'Verified reports with instant notifications',
    color: 'bg-[#FEF2F2] text-[#DC2626]',
  },
  {
    icon: Calendar, label: 'Event Planning',
    desc: 'Coordinate block parties and more',
    color: 'bg-[#F5F3FF] text-[#7C3AED]',
  },
];

const STATS = [
  { value: '$12,400', label: 'saved by Oak Hills in group purchasing' },
  { value: '2,400+', label: 'neighborhoods across the US' },
  { value: '94%', label: 'members say it improved community bonds' },
];

const TESTIMONIALS = [
  {
    quote: "We saved $340 on mulch delivery last spring. It took 10 minutes to organize 14 households.",
    author: 'Sarah M.', neighborhood: 'Oak Hills, CA',
    avatar: 'SM',
  },
  {
    quote: "The voting feature finally got our speed bump proposal passed after 3 years of trying.",
    author: 'Mike T.', neighborhood: 'Elm Street, TX',
    avatar: 'MT',
  },
  {
    quote: "Our neighborhood now has a shared pressure washer, ladder, and truck. Saved us thousands.",
    author: 'Lisa R.', neighborhood: 'Maple Grove, OH',
    avatar: 'LR',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#16A34A]">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-lg font-800 text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-nunito), sans-serif', fontWeight: 800 }}>
              NeighborDAO
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}
              onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
              Log in
            </Link>
            <Link href="/join" className="inline-flex items-center gap-1.5 rounded-lg bg-[#16A34A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#15803D] hover:shadow-md active:scale-[0.97]">
              Get Started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pt-24">
        {/* Decorative background circles */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#DCFCE7] opacity-60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-[#FEF9C3] opacity-60 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-1 text-sm font-medium text-[#15803D]">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered community coordination
          </div>
          <h1 className="mb-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Your neighborhood,{' '}
            <span className="text-[#16A34A]">organized.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Replace chaotic group chats with AI-powered coordination. Save money on bulk orders, share resources, and make decisions together.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/join" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:bg-[#15803D] hover:shadow-lg active:scale-[0.97] sm:w-auto">
              Find My Neighborhood <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E7E5E4] bg-white px-6 py-3.5 text-base font-medium transition-all hover:bg-[#F5F5F4] sm:w-auto" style={{ color: 'var(--text-secondary)' }}>
              I have an account
            </Link>
          </div>
        </div>

        {/* Stats ticker */}
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map(s => (
              <div key={s.label} className="rounded-xl border bg-white p-5 text-center shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="text-2xl font-extrabold text-[#16A34A]" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>{s.value}</div>
                <div className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Everything your neighborhood needs
          </h2>
          <p className="mb-10 text-center text-base" style={{ color: 'var(--text-secondary)' }}>
            From saving money to settling disputes — NeighborDAO handles it all.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.label} className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md" style={{ borderColor: 'var(--border)' }}>
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>{f.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="px-4 py-16 sm:px-6 lg:px-8" style={{ background: '#F0FDF4' }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#CA8A04] text-[#CA8A04]" />)}
          </div>
          <h2 className="mb-10 text-center text-2xl font-bold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Loved by neighborhoods across the US
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                <p className="mb-4 text-sm leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#16A34A] text-xs font-bold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.author}</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.neighborhood}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h2 className="mb-4 text-3xl font-extrabold" style={{ fontFamily: 'var(--font-nunito), sans-serif', color: 'var(--text-primary)' }}>
            Ready to organize your block?
          </h2>
          <p className="mb-8 text-base" style={{ color: 'var(--text-secondary)' }}>
            Join 2,400+ neighborhoods already saving money and building stronger communities.
          </p>
          <Link href="/join" className="inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-[#15803D] hover:shadow-xl active:scale-[0.97]">
            <TrendingUp className="h-5 w-5" /> Get Started — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8" style={{ borderColor: 'var(--border)', background: 'white' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm sm:flex-row" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <MapPin className="h-4 w-4 text-[#16A34A]" /> NeighborDAO
          </div>
          <div className="flex gap-6">
            {['About', 'Pricing', 'Blog', 'Privacy', 'Terms'].map(l => (
              <Link key={l} href="#" className="transition-colors hover:text-[#16A34A]">{l}</Link>
            ))}
          </div>
          <div>© {new Date().getFullYear()} NeighborDAO, Inc.</div>
        </div>
      </footer>
    </div>
  );
}
