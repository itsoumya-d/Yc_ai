import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  TrendingUp,
  Brain,
  AlertTriangle,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Users,
  Building2,
} from 'lucide-react';

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-violet-600">DealRoom</span>
            </Link>

            {/* Nav actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-violet-700 active:bg-violet-800 transition-colors"
              >
                Get Started Free
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-b from-violet-50 to-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative blobs */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-32 w-[600px] h-[600px] rounded-full bg-violet-100 opacity-40 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-24 w-[400px] h-[400px] rounded-full bg-violet-200 opacity-30 blur-3xl pointer-events-none"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Sales Intelligence
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight mb-6">
            Close More Deals with{' '}
            <span className="text-violet-600">AI Intelligence</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            DealRoom scores every deal 0–100 using AI, predicts churn risk before
            it&apos;s too late, and surfaces the exact next action to move each deal
            forward.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-violet-600 text-white text-base font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 active:bg-violet-800 transition-colors shadow-lg shadow-violet-200"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-base font-semibold px-6 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors bg-white">
              Watch Demo
            </button>
          </div>

          {/* Stats row */}
          <div className="inline-grid grid-cols-3 divide-x divide-gray-200 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {[
              { value: '2.3×', label: 'Win Rate' },
              { value: '31%', label: 'Faster Sales Cycles' },
              { value: '89%', label: 'Forecast Accuracy' },
            ].map(({ value, label }) => (
              <div key={label} className="px-8 py-5 text-center">
                <p className="text-2xl font-extrabold text-violet-600">{value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Problem */}
          <div className="bg-white border border-red-100 rounded-2xl p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              <AlertTriangle className="w-3.5 h-3.5" />
              The Problem
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sales teams are flying blind
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Sales teams lose{' '}
              <span className="font-semibold text-red-600">67% of deals</span> due to
              poor timing and lack of visibility. Reps can&apos;t tell which deals need
              attention, which are at risk, and what action will actually move the needle
              — until it&apos;s too late.
            </p>
            <ul className="space-y-3">
              {[
                'No early warning when deals go cold',
                'Gut-feel forecasts that miss the mark',
                'Reps spend hours updating CRM instead of selling',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs">
                    ✕
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution */}
          <div className="bg-violet-600 rounded-2xl p-8 shadow-sm text-white">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-5 uppercase tracking-wide">
              <CheckCircle className="w-3.5 h-3.5" />
              The Solution
            </div>
            <h2 className="text-2xl font-bold mb-4">
              AI that tells you exactly what to do next
            </h2>
            <p className="text-violet-100 leading-relaxed mb-6">
              DealRoom reads every interaction — emails, calls, meetings, CRM notes —
              and gives your team a real-time health score plus the precise next action
              for every deal in your pipeline.
            </p>
            <ul className="space-y-3">
              {[
                'Real-time deal health scores updated automatically',
                'Churn alerts 14 days before a deal goes dark',
                'AI-recommended next actions for every rep',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-violet-100">
                  <CheckCircle className="mt-0.5 w-4 h-4 flex-shrink-0 text-violet-300" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Everything your team needs to win
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="group border border-gray-200 rounded-2xl p-7 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-600 transition-colors">
                <Brain className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI Deal Scoring</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Every deal gets a 0–100 score updated in real-time based on activities,
                communication patterns, and historical win data. Know instantly which
                deals need your attention.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group border border-gray-200 rounded-2xl p-7 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-600 transition-colors">
                <AlertTriangle className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Churn Risk Alerts</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Get alerted 14 days before a deal goes dark, with specific reasons and
                recommended interventions. Never lose another deal to silence again.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group border border-gray-200 rounded-2xl p-7 hover:border-violet-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 bg-violet-100 rounded-xl flex items-center justify-center mb-5 group-hover:bg-violet-600 transition-colors">
                <BarChart3 className="w-5 h-5 text-violet-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Revenue Forecasting</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Weighted pipeline forecasts that account for deal health, not just stage
                probability. Commit to board-ready numbers your leadership can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Customer Stories
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Loved by revenue teams
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed mb-6">
                &ldquo;DealRoom helped us identify 3 at-risk enterprise deals before they
                churned. Saved $480K in ARR in a single quarter.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Sarah K.</p>
                  <p className="text-xs text-gray-500">VP Sales at Acme</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />
                ))}
              </div>
              <blockquote className="text-gray-700 leading-relaxed mb-6">
                &ldquo;Our forecast accuracy went from 61% to 89% in the first quarter.
                The board stopped questioning our numbers entirely.&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Marcus T.</p>
                  <p className="text-xs text-gray-500">CRO at Nexus Labs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-violet-600 text-sm font-semibold uppercase tracking-widest mb-3">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-gray-500 text-base">
              No long-term contracts. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {/* Starter */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Starter
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">$79</span>
                  <span className="text-gray-500 mb-1">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Up to 5 users</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['5 users', '100 deals', 'Basic AI scoring', 'Email support'].map(
                  (feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      {feat}
                    </li>
                  )
                )}
              </ul>
              <Link
                href="/login"
                className="block text-center border border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Growth — most popular */}
            <div className="border-2 border-violet-600 rounded-2xl p-8 flex flex-col relative shadow-lg shadow-violet-100">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </span>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-violet-600 uppercase tracking-wide mb-2">
                  Growth
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">$249</span>
                  <span className="text-gray-500 mb-1">/mo</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Up to 25 users</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '25 users',
                  'Unlimited deals',
                  'Full AI suite',
                  'Email alerts',
                  'Churn risk alerts',
                  'Revenue forecasting',
                  'Priority support',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-violet-600 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block text-center bg-violet-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-700 active:bg-violet-800 transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Enterprise */}
            <div className="border border-gray-200 rounded-2xl p-8 flex flex-col bg-gray-50">
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Enterprise
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">Custom</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Unlimited users</p>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  'Unlimited users',
                  'API access',
                  'Custom AI models',
                  'Dedicated support',
                  'SSO & SCIM',
                  'Custom integrations',
                  'SLA guarantee',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-violet-500 flex-shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:sales@dealroom.ai"
                className="block text-center border border-gray-300 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-white transition-colors bg-white"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-700 via-violet-600 to-violet-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-5 leading-tight">
            Your deals are telling you something.
            <br />
            Are you listening?
          </h2>
          <p className="text-violet-200 text-base mb-9 max-w-xl mx-auto leading-relaxed">
            Join hundreds of revenue teams using DealRoom to forecast accurately, act
            faster, and close more deals with AI-driven intelligence.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-violet-700 text-base font-bold px-7 py-3.5 rounded-xl hover:bg-violet-50 active:bg-violet-100 transition-colors shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-4 text-violet-300 text-xs">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold text-lg">DealRoom</span>
              </Link>
              <p className="text-sm leading-relaxed text-gray-500">
                AI-powered sales intelligence for modern revenue teams.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white text-sm font-semibold mb-4">Product</p>
              <ul className="space-y-2.5 text-sm">
                {['Features', 'Pricing', 'Integrations', 'Changelog'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-white text-sm font-semibold mb-4">Company</p>
              <ul className="space-y-2.5 text-sm">
                {['About', 'Blog', 'Careers', 'Press'].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-white text-sm font-semibold mb-4">Legal</p>
              <ul className="space-y-2.5 text-sm">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Security'].map(
                  (link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-white transition-colors">
                        {link}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">
              &copy; {new Date().getFullYear()} DealRoom, Inc. All rights reserved.
            </p>
            <p className="text-xs text-gray-600">
              Built for revenue teams who close.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
