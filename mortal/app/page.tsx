import Link from 'next/link';
import { Heart, FolderLock, Globe, Leaf, Scale, Shield, Timer, Users } from 'lucide-react';

const features = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: 'Wishes Documentation',
    description: 'AI-guided capture of funeral, medical, and personal wishes with gentle, thoughtful prompts.',
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: 'Digital Asset Inventory',
    description: 'Catalog all your online accounts, subscriptions, and digital property in one secure place.',
  },
  {
    icon: <FolderLock className="h-6 w-6" />,
    title: 'Encrypted Document Vault',
    description: 'Store wills, insurance policies, and sensitive documents with bank-grade encryption.',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Trusted Contacts',
    description: 'Assign roles and permissions so the right people have access when it matters most.',
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: 'Legal Templates',
    description: 'Generate state-specific legal documents with AI assistance and professional templates.',
  },
  {
    icon: <Timer className="h-6 w-6" />,
    title: 'Dead Man\'s Switch',
    description: 'Periodic check-ins with configurable escalation ensure your plans activate when needed.',
  },
];

const stats = [
  { value: '100%', label: 'Encrypted' },
  { value: '6', label: 'Planning Areas' },
  { value: '5 min', label: 'To Get Started' },
  { value: '24/7', label: 'AI Guidance' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600">
              <Leaf className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary font-heading">Mortal</span>
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
              className="bg-sage-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 bg-sage-50 text-sage-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <Shield className="h-3.5 w-3.5" />
          Private and secure
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary font-heading leading-tight max-w-3xl mx-auto">
          Plan with peace of mind
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          Mortal helps you document your wishes, secure your digital legacy, and protect the people you love. Thoughtful planning, made simple.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-sage-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-sage-700 transition-colors text-base"
          >
            Start Your Plan
          </Link>
          <Link
            href="/login"
            className="text-sage-600 font-medium px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-base"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-sage-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white font-heading">{stat.value}</p>
                <p className="text-sm text-sage-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading text-center mb-4">
          Everything you need to plan ahead
        </h2>
        <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
          From documenting your wishes to securing your digital legacy, Mortal guides you through every aspect of end-of-life planning.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-50 text-sage-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-heading font-semibold text-text-primary mb-1">{feature.title}</h3>
              <p className="text-sm text-text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-text-primary font-heading mb-3">
            Ready to plan with peace of mind?
          </h2>
          <p className="text-text-secondary mb-6">
            It takes less than 5 minutes to get started. Your loved ones will thank you.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-sage-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-sage-700 transition-colors text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2025 Mortal. All rights reserved.</span>
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
