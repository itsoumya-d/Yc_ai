import Link from 'next/link';
import { ArrowRight, Target, TrendingUp, BookOpen, Users, Star, CheckCircle, Zap, BarChart3, Award } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-root">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">SkillBridge</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-text-secondary hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm text-text-secondary hover:text-primary transition-colors">How It Works</Link>
            <Link href="#pricing" className="text-sm text-text-secondary hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm py-2">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Career Navigation
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary md:text-6xl">
            Your skills are worth
            <span className="text-primary"> more than you think</span>
          </h1>
          <p className="mb-10 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            SkillBridge analyzes your experience, identifies hidden transferable skills, and maps your fastest path to a new career — all powered by AI and real labor market data.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-accent text-base px-8 py-3">
              Start Free Assessment
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-outline text-base px-8 py-3">
              See Demo Dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-tertiary">No credit card required · Takes 5 minutes · 100% free to start</p>
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-primary/5 py-12 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { value: '85M', label: 'Jobs being automated by 2030' },
              { value: '$28K', label: 'Avg income loss during transition' },
              { value: '4 mo', label: 'Avg time to transition with SkillBridge' },
              { value: '95%', label: 'Users find transferable skills they missed' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-primary">{value}</p>
                <p className="mt-1 text-xs text-text-secondary">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">Everything you need to change careers</h2>
            <p className="mt-3 text-text-secondary">From skills analysis to your first day in a new role — we guide every step</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BarChart3, title: 'Skills Intelligence', desc: 'Upload your resume or answer questions. Our AI identifies every transferable skill you have — including ones you didn\'t know were valuable.' },
              { icon: TrendingUp, title: 'Career Path Mapping', desc: 'See which careers match your skills, ranked by salary potential, growth outlook, and how quickly you can be ready.' },
              { icon: BookOpen, title: 'Personalized Learning Plans', desc: 'Close your skills gaps with curated courses from free providers. Learn exactly what you need, nothing you don\'t.' },
              { icon: Award, title: 'AI Resume Rewriter', desc: 'Our AI rewrites your resume to highlight transferable skills in the language of your target industry — without exaggerating.' },
              { icon: Users, title: 'Mentor Matching', desc: 'Connect with people who made the same career transition you\'re planning. Learn from their real experience.' },
              { icon: Target, title: 'Progress Tracking', desc: 'Track every milestone from assessment to job offer. Celebrate progress and stay motivated throughout your journey.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-primary/5 py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">How SkillBridge works</h2>
            <p className="mt-3 text-text-secondary">From uncertainty to your new career in 4 simple steps</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {[
              { step: '01', title: 'Upload your resume or answer questions', desc: 'Tell us about your work history, skills, and what you enjoy. Takes 5-10 minutes.' },
              { step: '02', title: 'Discover your transferable skills', desc: 'Our AI maps your skills to a standard taxonomy and identifies hidden strengths.' },
              { step: '03', title: 'Explore personalized career paths', desc: 'See careers ranked by match score, salary, and how fast you can be ready.' },
              { step: '04', title: 'Follow your learning plan & get hired', desc: 'Close skill gaps, rewrite your resume, and connect with employers who want you.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">{step}</div>
                <div>
                  <h3 className="font-semibold text-text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">Simple, honest pricing</h2>
            <p className="mt-3 text-text-secondary">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Free', price: '$0', period: 'forever', features: ['Skills assessment', '3 career paths', 'Basic job matching', 'Community forums'], cta: 'Get started', primary: false },
              { name: 'Navigator', price: '$14.99', period: '/month', features: ['Unlimited career paths', 'AI resume rewriter', 'Full learning plans', 'Full job matching', 'Progress tracking'], cta: 'Start free trial', primary: true },
              { name: 'Pro', price: '$29.99', period: '/month', features: ['Everything in Navigator', 'Mentor matching', 'Interview prep', 'Salary negotiation', 'Priority support'], cta: 'Start free trial', primary: false },
            ].map(({ name, price, period, features, cta, primary }) => (
              <div key={name} className={`rounded-2xl border p-6 ${primary ? 'border-primary bg-primary/5 ring-2 ring-primary/30' : 'border-border bg-card'}`}>
                {primary && <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">MOST POPULAR</div>}
                <h3 className="font-bold text-text-primary">{name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-text-primary">{price}</span>
                  <span className="text-sm text-text-tertiary">{period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-border text-text-primary hover:bg-surface'}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">Start your transition today</h2>
          <p className="mt-3 text-primary-foreground/80">Join thousands of workers who discovered their transferable skills and found new careers they love.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg hover:bg-primary-foreground transition-colors">
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-text-tertiary">© 2025 SkillBridge. <em>Because your skills are worth more than you think.</em></p>
      </footer>
    </div>
  );
}
