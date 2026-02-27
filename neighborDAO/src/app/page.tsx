import Link from 'next/link';
import { Vote, DollarSign, Users, Megaphone, Shield, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Vote, title: 'Create Proposals', desc: 'Submit proposals for community improvements, rule changes, funding requests, and elections.' },
  { icon: CheckCircle, title: 'Vote On Issues', desc: 'Cast votes with full transparency. Every vote is recorded and viewable by all members.' },
  { icon: DollarSign, title: 'Shared Treasury', desc: 'Pool community funds, track every transaction, and vote on spending priorities.' },
  { icon: Users, title: 'Community Events', desc: 'Organize neighborhood events, coordinate volunteers, and build stronger connections.' },
  { icon: Shield, title: 'Democratic Rules', desc: 'Amend bylaws, set voting thresholds, and define community governance parameters.' },
  { icon: BarChart3, title: 'Full Analytics', desc: 'Track participation rates, voting patterns, and community engagement over time.' },
];

const steps = [
  { n: '01', title: 'Create Your DAO', desc: 'Register your neighborhood and invite residents to join your community.' },
  { n: '02', title: 'Submit Proposals', desc: 'Any member can submit a proposal for the community to consider.' },
  { n: '03', title: 'Vote & Execute', desc: 'Members vote within the deadline and decisions are automatically recorded.' },
];

const stats = [
  { value: '2,847', label: 'Active Members' },
  { value: '156', label: 'Proposals Passed' },
  { value: '$284K', label: 'Managed' },
  { value: '94%', label: 'Satisfaction Rate' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-bg-root/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Vote className="h-4 w-4 text-text-inverse" />
            </div>
            <span className="text-lg font-bold text-text-primary">NeighborDAO</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 max-w-4xl">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
            🏘️ Community Governance Platform
          </span>
          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-text-primary sm:text-6xl lg:text-7xl">
            Govern Your<br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Neighborhood
            </span>
            , Together
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-text-secondary">
            Transparent proposals, democratic voting, and shared treasury management — everything your community needs to make decisions that matter.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-primary text-base">
              Launch a DAO <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-outline text-base">
              Join Community
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-bg-surface py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-text-secondary">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">Everything Your Community Needs</h2>
            <p className="mt-3 text-text-secondary">Powerful tools built for democratic neighborhood governance.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card hover:border-primary/40 transition-all hover:-translate-y-0.5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{f.title}</h3>
                <p className="text-sm text-text-secondary">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-bg-surface py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">How It Works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-xl font-extrabold text-primary">
                  {s.n}
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{s.title}</h3>
                <p className="text-sm text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold text-text-primary">Ready to transform your neighborhood?</h2>
          <p className="mb-8 text-text-secondary">Join thousands of communities already using NeighborDAO to govern democratically.</p>
          <Link href="/signup" className="btn-primary text-base">
            Start Free Today <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-text-muted">
        <p>© 2025 NeighborDAO · Community Governance Platform</p>
      </footer>
    </div>
  );
}
