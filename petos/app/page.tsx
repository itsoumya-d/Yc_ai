import Link from 'next/link';

const styles = `
  @keyframes float-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes paw-pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.08); }
  }
  @keyframes gentle-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-6px); }
  }
  .f1 { animation: float-up 0.6s ease both; }
  .f2 { animation: float-up 0.6s ease 0.1s both; }
  .f3 { animation: float-up 0.6s ease 0.2s both; }
  .f4 { animation: float-up 0.6s ease 0.3s both; }
  .f5 { animation: float-up 0.6s ease 0.4s both; }
  .paw-anim { animation: paw-pulse 2.5s ease-in-out infinite; }
  .card-float { animation: gentle-float 4s ease-in-out infinite; }
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 28px -6px rgba(234,88,12,0.18);
  }
  .orange-bg {
    background: radial-gradient(ellipse at 40% 0%, rgba(251,146,60,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 80%, rgba(234,88,12,0.06) 0%, transparent 50%);
  }
  .stat-orange {
    background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .btn-orange {
    position: relative;
    overflow: hidden;
    transition: background-color 0.2s ease;
  }
  .btn-orange::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,0.15);
    transform: translateX(-100%) skewX(-15deg);
    transition: transform 0.4s ease;
  }
  .btn-orange:hover::after { transform: translateX(150%) skewX(-15deg); }
`;

const features = [
  { icon: '🩺', title: 'Health Timeline', desc: 'Log vaccinations, vet visits, and medical history. Get smart reminders for upcoming care.' },
  { icon: '🤖', title: 'AI Symptom Check', desc: 'Describe symptoms or upload a photo. GPT-4o Vision gives instant health insights and urgency assessment.' },
  { icon: '💊', title: 'Medication Tracker', desc: 'Never miss a dose. Set recurring reminders for flea treatment, heartworm, and prescriptions.' },
  { icon: '📅', title: 'Appointment Manager', desc: 'Schedule vet visits, grooming, and training sessions. Get 48-hour reminders automatically.' },
  { icon: '📊', title: 'Health Trends', desc: 'Track weight, activity, and health scores over time. Spot patterns before they become problems.' },
  { icon: '💰', title: 'Pet Expense Tracker', desc: 'Monitor spending across food, vet, grooming, and supplies. Export reports for pet insurance.' },
];

const petTypes = ['🐕 Dogs', '🐈 Cats', '🐇 Rabbits', '🐦 Birds', '🐠 Fish', '🦎 Reptiles'];

const testimonials = [
  {
    quote: "I finally feel in control of Mochi's health. The AI symptom checker caught a recurring ear infection pattern I had missed for months.",
    name: 'Sarah K.',
    role: '2 dogs, 1 cat',
    avatar: '🐕',
  },
  {
    quote: 'My vet was impressed that I had a full health history ready at every appointment. PetOS makes me a better pet parent.',
    name: 'Diego M.',
    role: 'Rabbit & guinea pig owner',
    avatar: '🐇',
  },
  {
    quote: "The medication reminders alone are worth it. No more wondering 'did I give the flea treatment this month?'",
    name: 'Priya L.',
    role: '3 cats, senior pet caregiver',
    avatar: '🐈',
  },
];

export default function HomePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="min-h-screen bg-white overflow-x-hidden">

        {/* NAV */}
        <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="paw-anim inline-block text-2xl">🐾</span>
              <span className="font-heading text-xl font-bold text-[var(--foreground)]">
                Pet<span className="text-brand-600">OS</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <a href="#features" className="hover:text-brand-600 transition-colors">Features</a>
              <a href="#testimonials" className="hover:text-brand-600 transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-[var(--foreground)] hover:text-brand-600 transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="btn-orange rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="orange-bg relative overflow-hidden pb-20 pt-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
              {/* Left */}
              <div>
                <div className="f1 mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
                  <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse inline-block" />
                  Trusted by 45,000+ pet parents worldwide
                </div>
                <h1 className="f2 font-heading text-5xl font-bold leading-tight text-[var(--foreground)] sm:text-6xl">
                  Smart pet care,
                  <br />
                  <span className="stat-orange">beautifully simple.</span>
                </h1>
                <p className="f3 mt-5 text-lg leading-relaxed text-[var(--muted-foreground)]">
                  One app for all your pets&apos; health records, medications, appointments, and AI-powered symptom checks.
                  Be the pet parent your fur babies deserve.
                </p>
                <div className="f4 mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/signup"
                    className="btn-orange inline-flex items-center justify-center rounded-lg bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    Start free — all pet types
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-7 py-3.5 text-sm font-medium text-[var(--foreground)] hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>

                {/* Pet type pills */}
                <div className="f5 mt-6 flex flex-wrap gap-2">
                  {petTypes.map((p) => (
                    <span key={p} className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — floating health card */}
              <div className="relative flex items-center justify-center">
                <div className="card-float w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white shadow-2xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-2xl">
                      🐕
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Biscuit</p>
                      <p className="text-xs text-[var(--muted-foreground)]">Golden Retriever · 3 years old</p>
                    </div>
                    <span className="ml-auto rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                      Healthy ✓
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: '💉 Rabies vaccine', status: 'Up to date', color: 'text-green-600' },
                      { label: '💊 Flea treatment', status: 'Due in 8 days', color: 'text-yellow-600' },
                      { label: '📅 Annual checkup', status: 'Oct 15', color: 'text-brand-600' },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm">
                        <span>{item.label}</span>
                        <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-brand-200 bg-brand-50 p-3 text-xs text-brand-700">
                    🤖 AI health score: <span className="font-bold">92/100</span> — Excellent condition
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
              Everything you need
            </p>
            <h2 className="font-heading text-4xl font-bold text-[var(--foreground)] sm:text-5xl">
              Your pet&apos;s entire health, in one place.
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover rounded-xl border border-[var(--border)] bg-white p-6">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-3 font-heading text-base font-semibold text-[var(--foreground)]">{f.title}</h3>
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
                Pet parents love PetOS
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.name} className="card-hover rounded-xl border border-[var(--border)] bg-white p-6">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <blockquote className="text-sm leading-relaxed text-[var(--foreground)]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-lg">
                      {t.avatar}
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

        {/* CTA */}
        <section className="bg-brand-600 py-20">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <span className="text-5xl">🐾</span>
            <h2 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl">
              Your pets deserve the best care.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-brand-100">
              Join 45,000+ pet parents who use PetOS to stay on top of their pets&apos; health. Free forever for up to 3 pets.
            </p>
            <Link
              href="/signup"
              className="btn-orange mt-8 inline-block rounded-lg bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              Start free — no credit card
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[var(--border)] bg-white py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 text-sm text-[var(--muted-foreground)] sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <span className="font-heading font-bold text-[var(--foreground)]">PetOS</span>
                <span>— Smart pet health management</span>
              </div>
              <div className="flex gap-6">
                {['Privacy', 'Terms', 'Contact', 'Blog'].map((l) => (
                  <a key={l} href="#" className="hover:text-brand-600 transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
              © {new Date().getFullYear()} PetOS. Made with ❤️ for pet parents everywhere.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
