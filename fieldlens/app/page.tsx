import Link from 'next/link';
import { Wrench, Camera, BookOpen, TrendingUp, Shield, HardHat } from 'lucide-react';

const features = [
  {
    icon: <HardHat className="h-6 w-6" />,
    title: 'AI Coaching Sessions',
    description: 'Get real-time guidance while on the job. Start a session, snap photos, and receive instant feedback.',
  },
  {
    icon: <Camera className="h-6 w-6" />,
    title: 'Photo Analysis',
    description: 'Snap a photo of your work. AI identifies tools, checks safety compliance, and reviews technique.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Safety Checks',
    description: 'Automated safety audits on every photo. Catch code violations before the inspector does.',
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: 'Trade Guides',
    description: 'Step-by-step guides for plumbing, electrical, HVAC, carpentry, and welding tasks.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Skill Tracking',
    description: 'Track your progress from apprentice to master. Earn milestones as your skills grow.',
  },
  {
    icon: <Wrench className="h-6 w-6" />,
    title: 'Multi-Trade Support',
    description: 'Plumbing, electrical, HVAC, carpentry, and welding — all in one app.',
  },
];

const stats = [
  { value: '6', label: 'Trade Specialties' },
  { value: '500+', label: 'Guided Tasks' },
  { value: '< 30s', label: 'Photo Analysis' },
  { value: '24/7', label: 'AI Mentorship' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-safety-500">
              <Wrench className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">FieldLens</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-safety-500 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-safety-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 bg-safety-500/10 text-safety-500 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <HardHat className="h-3.5 w-3.5" />
          Built for tradespeople
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary leading-tight max-w-3xl mx-auto">
          Your AI mentor on every job site
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          FieldLens uses AI to coach plumbers, electricians, and HVAC techs with real-time photo analysis, safety checks, and skill tracking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-safety-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-safety-600 transition-colors text-base"
          >
            Start Free Mentorship
          </Link>
          <Link
            href="/login"
            className="text-safety-500 font-medium px-6 py-3 rounded-lg border border-border hover:bg-surface-secondary transition-colors text-base"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-safety-500">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-safety-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center mb-4">
          Everything a tradesperson needs
        </h2>
        <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
          From on-site coaching to skill progression, FieldLens is your complete AI-powered trade companion.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-surface-secondary p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-safety-500/10 text-safety-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface-secondary border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Ready to level up your trade skills?
          </h2>
          <p className="text-text-secondary mb-6">
            Join thousands of tradespeople using AI to work smarter and safer on every job.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-safety-500 text-white font-medium px-8 py-3 rounded-lg hover:bg-safety-600 transition-colors text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2025 FieldLens. All rights reserved.</span>
          <div className="flex gap-4">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
