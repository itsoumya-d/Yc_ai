import Link from 'next/link';
import {
  Shield,
  FileSearch,
  TrendingUp,
  Network,
  BarChart3,
  Lock,
  ArrowRight,
  Scale,
} from 'lucide-react';

const features = [
  {
    icon: FileSearch,
    title: 'AI Document Analysis',
    description: 'Ingest invoices, contracts, and payment records with OCR. AI extracts entities, amounts, and relationships automatically.',
  },
  {
    icon: TrendingUp,
    title: 'Fraud Pattern Detection',
    description: 'Detect overbilling, duplicate billing, phantom vendors, and 5 more fraud patterns with statistical confidence scoring.',
  },
  {
    icon: Network,
    title: 'Entity Network Mapping',
    description: 'Visualize connections between people, organizations, payments, and contracts to uncover hidden relationships.',
  },
  {
    icon: BarChart3,
    title: "Benford's Law Analysis",
    description: 'Apply statistical tests including digit frequency analysis to identify anomalous billing patterns.',
  },
  {
    icon: Scale,
    title: 'Evidence Timeline',
    description: 'Build chronological evidence chains linking documents, payments, and communications for case building.',
  },
  {
    icon: Lock,
    title: 'Attorney-Client Security',
    description: 'End-to-end encryption, per-case access controls, and comprehensive audit trails for legal privilege protection.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-border-muted px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="legal-heading text-lg text-text-primary">ClaimForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-text-on-color transition-colors hover:bg-primary-hover"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-muted px-3 py-1">
            <Shield className="h-3.5 w-3.5 text-primary-light" />
            <span className="text-xs font-medium text-primary-light">False Claims Act Intelligence</span>
          </div>
          <h1 className="legal-heading mb-6 text-5xl leading-tight text-text-primary">
            Detect Fraud.<br />Build Cases.<br />Recover Losses.
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-text-secondary">
            AI-powered investigation platform that analyzes documents, detects fraud patterns,
            and builds evidence packages for False Claims Act cases.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-text-on-color transition-colors hover:bg-primary-hover"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-border-default px-6 py-3 font-medium text-text-secondary transition-colors hover:bg-bg-surface"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border-muted px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="legal-heading mb-12 text-center text-2xl text-text-primary">
            Investigation Intelligence
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border-default bg-bg-surface p-6 transition-all hover:border-border-emphasis hover:shadow-2"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary-muted p-2.5">
                  <f.icon className="h-5 w-5 text-primary-light" />
                </div>
                <h3 className="legal-heading mb-2 text-sm text-text-primary">{f.title}</h3>
                <p className="text-sm leading-relaxed text-text-secondary">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-muted px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-text-tertiary">
            <Shield className="h-4 w-4" />
            <span className="text-xs">ClaimForge v0.1.0</span>
          </div>
          <span className="text-xs text-text-tertiary">SOC 2 Type II Compliant</span>
        </div>
      </footer>
    </div>
  );
}
