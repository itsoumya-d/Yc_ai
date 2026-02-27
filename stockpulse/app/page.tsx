import Link from 'next/link';
import { Box, ScanBarcode, Package, ShoppingCart, AlertTriangle, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: <ScanBarcode className="h-6 w-6" />,
    title: 'AI Scanner',
    description: 'Scan shelves with your camera. AI identifies products and counts stock instantly.',
  },
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Inventory Tracking',
    description: 'Real-time stock levels across all locations with automatic reorder alerts.',
  },
  {
    icon: <ShoppingCart className="h-6 w-6" />,
    title: 'Purchase Orders',
    description: 'Create and track orders from suppliers. Auto-generate restock orders from alerts.',
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: 'Smart Alerts',
    description: 'Get notified before you run out. Low stock, expiration, and reorder notifications.',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Analytics',
    description: 'Track usage patterns, waste, and trends to optimize your purchasing decisions.',
  },
  {
    icon: <Box className="h-6 w-6" />,
    title: 'Multi-Location',
    description: 'Manage inventory across multiple storage areas, kitchens, and retail floors.',
  },
];

const stats = [
  { value: '10x', label: 'Faster Counts' },
  { value: '30%', label: 'Less Waste' },
  { value: '< 2 min', label: 'Per Scan' },
  { value: '99%', label: 'Accuracy' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a' }}>
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-600">
              <Box className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary font-heading">StockPulse</span>
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
              className="bg-electric-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-electric-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-1.5 bg-electric-600/10 text-electric-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <ScanBarcode className="h-3.5 w-3.5" />
          AI-Powered Inventory
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary font-heading leading-tight max-w-3xl mx-auto">
          Stop counting by hand. Scan with AI.
        </h1>
        <p className="text-lg text-text-secondary mt-4 max-w-xl mx-auto">
          StockPulse uses AI to scan your shelves, track inventory in real-time, and alert you before you run out of anything.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link
            href="/signup"
            className="bg-electric-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-electric-700 transition-colors text-base"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="text-electric-400 font-medium px-6 py-3 rounded-lg border border-border hover:bg-surface transition-colors text-base"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-electric-600">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl sm:text-3xl font-bold text-white font-heading">{stat.value}</p>
                <p className="text-sm text-electric-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary font-heading text-center mb-4">
          Everything you need to manage stock
        </h2>
        <p className="text-text-secondary text-center max-w-xl mx-auto mb-12">
          From scanning shelves to generating purchase orders, StockPulse automates your entire inventory workflow.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-surface p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-electric-600/10 text-electric-400 mb-4">
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
            Ready to automate your inventory?
          </h2>
          <p className="text-text-secondary mb-6">
            Set up in under 5 minutes. No hardware required - just your phone camera.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-electric-600 text-white font-medium px-8 py-3 rounded-lg hover:bg-electric-700 transition-colors text-base"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between text-xs text-text-muted">
          <span>&copy; 2025 StockPulse. All rights reserved.</span>
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
