import Link from 'next/link';
import { Shield, ScanLine, Search, FileText, Bell, FolderLock } from 'lucide-react';

const features = [
  {
    icon: <ScanLine className="h-6 w-6" />,
    title: 'Document Scanner',
    description: 'Scan IDs, pay stubs, and tax forms. AI extracts key data instantly.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Eligibility Finder',
    description: 'Discover 25+ federal and state benefits you may qualify for.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Application Tracker',
    description: 'Track every application from draft to approval with step-by-step guidance.',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Smart Reminders',
    description: 'Never miss a deadline with push notifications for renewals and deadlines.',
  },
  {
    icon: <FolderLock className="h-6 w-6" />,
    title: 'Secure Vault',
    description: 'Store sensitive documents with encryption. Share securely when applying.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Bilingual Support',
    description: 'Full English and Spanish support throughout the entire experience.',
  },
];

const stats = [
  { value: '25+', label: 'Benefit Programs' },
  { value: '$12K', label: 'Avg. Annual Value' },
  { value: '2 min', label: 'Eligibility Check' },
  { value: '100%', label: 'Free to Use' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-trust-600">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary font-heading">GovPass</span>
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
              className="bg-trust-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-trust-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 bg-civic-50 text-civic-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <Shield className="h-3.5 w-3.5" />
          Free for everyone
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary font-heading leading-tight max-w-3xl mx-auto">
          Find benefits you qualify for in minutes
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          GovPass uses AI to scan your documents, check eligibility across 25+ programs, and guide you through every application step by step.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-trust-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-trust-700 transition-colors text-base"
          >
            Check My Eligibility
          </Link>
          <Link
            href="/login"
            className="text-trust-600 font-medium px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-base"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-trust-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white font-heading">{stat.value}</p>
                <p className="text-sm text-trust-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading text-center mb-4">
          Everything you need to access benefits
        </h2>
        <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
          From document scanning to application tracking, GovPass simplifies the entire benefits process.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-white p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-trust-50 text-trust-600 mb-4">
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
            Ready to find your benefits?
          </h2>
          <p className="text-text-secondary mb-6">
            It takes less than 2 minutes to check your eligibility. Available in English and Spanish.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-trust-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-trust-700 transition-colors text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2025 GovPass. All rights reserved.</span>
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
