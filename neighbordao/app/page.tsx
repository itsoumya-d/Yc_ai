import Link from 'next/link';
import {
  ShoppingCart,
  Wrench,
  Vote,
  Brain,
  Shield,
  Calendar,
  ArrowRight,
  TreePine,
  Users,
  DollarSign,
  MapPin,
} from 'lucide-react';

const features = [
  {
    icon: ShoppingCart,
    title: 'Group Purchasing',
    description: 'Save 30-40% with bulk neighborhood orders. AI optimizes timing and vendor selection.',
  },
  {
    icon: Wrench,
    title: 'Resource Sharing',
    description: 'Borrow tools and equipment from neighbors. Calendar booking with deposits.',
  },
  {
    icon: Vote,
    title: 'Democratic Voting',
    description: 'Transparent polls with ranked-choice voting, quorum tracking, and AI impact summaries.',
  },
  {
    icon: Brain,
    title: 'AI Summaries',
    description: 'Never miss key decisions. AI summarizes long discussions into 3-sentence TLDRs.',
  },
  {
    icon: Shield,
    title: 'Safety Alerts',
    description: 'Verified safety reports with SMS alerts for genuine emergencies only.',
  },
  {
    icon: Calendar,
    title: 'Event Planning',
    description: 'Coordinate block parties, garden cleanups, and meetups with RSVP and contribution tracking.',
  },
];

const stats = [
  { value: '$12,400', label: 'Saved per neighborhood/year' },
  { value: '350+', label: 'Tools shared monthly' },
  { value: '92%', label: 'Decisions reached consensus' },
  { value: '4.8/5', label: 'Neighbor satisfaction' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <TreePine className="h-7 w-7 text-leaf-600" />
              <span className="font-heading text-xl font-bold text-text-primary">
                NeighborDAO
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center rounded-[var(--radius-button)] bg-leaf-600 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight">
            Your neighborhood,{' '}
            <span className="text-leaf-600">organized.</span>
          </h1>
          <p className="mt-6 mx-auto max-w-2xl text-lg text-text-secondary leading-relaxed">
            NeighborDAO replaces chaotic group chats with AI-powered neighborhood
            coordination. Save money, share resources, make decisions together.
          </p>

          {/* Address search (visual — not functional yet) */}
          <div className="mt-10 mx-auto max-w-xl">
            <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-border bg-surface p-2 shadow-[var(--shadow-warm)]">
              <MapPin className="ml-2 h-5 w-5 text-text-muted flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your address to find your neighborhood..."
                className="flex-1 border-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                disabled
              />
              <Link
                href="/signup"
                className="rounded-[var(--radius-button)] bg-leaf-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-700 transition-colors whitespace-nowrap"
              >
                Find My Neighborhood
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Everything your neighborhood needs
            </h2>
            <p className="mt-3 text-text-secondary">
              From saving money to making decisions, NeighborDAO has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6 hover:shadow-[var(--shadow-warm)] transition-shadow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-leaf-50 mb-4">
                  <feature.icon className="h-6 w-6 text-leaf-600" />
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 bg-leaf-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-extrabold text-white">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-leaf-200">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-text-primary">
              Get started in 3 steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: MapPin, title: 'Find Your Neighborhood', desc: 'Enter your address and join or create your neighborhood community.' },
              { step: '2', icon: Users, title: 'Invite Neighbors', desc: 'Share the link with neighbors. The more who join, the more you save.' },
              { step: '3', icon: DollarSign, title: 'Start Saving', desc: 'Organize group orders, share resources, and coordinate as a community.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-earth-100 text-earth-700 font-heading text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-leaf-600">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-white">
            Ready to organize your neighborhood?
          </h2>
          <p className="mt-4 text-lg text-leaf-100">
            Join thousands of neighborhoods already saving money and building community.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-button)] bg-white px-6 py-3 text-base font-bold text-leaf-700 hover:bg-leaf-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <TreePine className="h-5 w-5 text-leaf-600" />
              <span className="font-heading text-sm font-bold text-text-primary">
                NeighborDAO
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-text-secondary">
              <span>About</span>
              <span>Pricing</span>
              <span>Blog</span>
              <span>Privacy</span>
              <span>Terms</span>
            </div>
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} NeighborDAO. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
