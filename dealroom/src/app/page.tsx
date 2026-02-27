import Link from 'next/link';
import { ArrowRight, Brain, TrendingUp, Zap, Target, BarChart3, MessageSquare, CheckCircle, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-root">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-bg-root/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Brain className="h-4 w-4 text-white" /></div>
            <span className="text-lg font-bold text-text-primary">DealRoom</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm py-2">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />AI-Powered Sales Intelligence
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary md:text-6xl">
            The AI that closes<br /><span className="text-primary">your deals for you</span>
          </h1>
          <p className="mb-10 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            DealRoom predicts which deals will close, surfaces at-risk opportunities before they stall, and recommends the exact next action for every rep — in real time.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-win text-base px-8 py-3">
              Close More Deals <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-outline text-base px-8 py-3">View Live Demo</Link>
          </div>
          <p className="mt-4 text-sm text-text-tertiary">Free 14-day trial · No credit card · Works with Salesforce, HubSpot, Pipedrive</p>
        </div>
      </section>

      <section className="bg-card border-y border-border py-12 px-6">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            { value: '28%', label: 'Of rep time is actual selling' },
            { value: '67%', label: 'Deals lost to "no decision"' },
            { value: '3.2×', label: 'Pipeline-to-quota ratio needed' },
            { value: '+31%', label: 'Win rate with DealRoom AI' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">AI that works while you sell</h2>
            <p className="mt-3 text-text-secondary">Continuous deal intelligence, not just a CRM</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Target, title: 'Deal Scoring', desc: 'Every deal gets a real-time AI score (0-100) based on engagement signals, sentiment, timeline risk, and competitive activity.' },
              { icon: Brain, title: 'Next Best Action', desc: 'AI recommends the single most impactful action for each rep on each deal — email the CFO, schedule a POC, escalate to your champion.' },
              { icon: MessageSquare, title: 'AI Follow-Up Writer', desc: 'Generate personalized follow-up emails for any deal in seconds. Tone-matched to your conversation history and buying stage.' },
              { icon: BarChart3, title: 'Pipeline Forecasting', desc: 'Commit/Best Case/Won forecasting with AI confidence intervals. Stop relying on gut feel for your board deck numbers.' },
              { icon: TrendingUp, title: 'Rep Coaching', desc: 'Identify coaching opportunities by comparing rep behavior to winning patterns. What\'s your top rep doing that others aren\'t?' },
              { icon: CheckCircle, title: 'CRM Auto-Update', desc: 'AI updates your CRM automatically from emails, calls, and meetings. Reps spend time selling, not logging.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card border-y border-border py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-12">Simple pricing, massive ROI</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Starter', price: '$49', period: '/user/mo', features: ['Up to 10 reps', 'Deal scoring', 'Pipeline view', 'Basic forecasting'], primary: false },
              { name: 'Growth', price: '$99', period: '/user/mo', features: ['Unlimited reps', 'AI next best action', 'Follow-up writer', 'Rep coaching', 'CRM sync'], primary: true },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Growth', 'Dedicated AI model', 'Custom integrations', 'SLA', 'Onboarding CSM'], primary: false },
            ].map(({ name, price, period, features, primary }) => (
              <div key={name} className={`rounded-xl border p-6 ${primary ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-bg-root'}`}>
                {primary && <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">MOST POPULAR</div>}
                <h3 className="font-bold text-text-primary">{name}</h3>
                <div className="mt-2 mb-4"><span className="text-3xl font-bold text-text-primary">{price}</span><span className="text-sm text-text-tertiary">{period}</span></div>
                <ul className="mb-6 space-y-2">
                  {features.map(f => <li key={f} className="flex items-center gap-2 text-sm text-text-secondary"><CheckCircle className="h-4 w-4 text-win shrink-0" />{f}</li>)}
                </ul>
                <Link href="/signup" className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-border text-text-primary hover:bg-card'}`}>
                  Start Free Trial
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">Stop losing deals you should win</h2>
          <p className="mt-3 text-primary-dark text-white/80">Join 500+ B2B sales teams using DealRoom to hit quota consistently.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg hover:bg-gray-100 transition">
            Start Closing More Deals <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-text-tertiary">© 2025 DealRoom. AI that closes deals.</p>
      </footer>
    </div>
  );
}
