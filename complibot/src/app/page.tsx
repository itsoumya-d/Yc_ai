import Link from 'next/link';
import { Shield, ArrowRight, CheckCircle, Zap, Lock, AlertTriangle, FileText, BarChart3, Settings } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-root">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">CompliBot</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-text-secondary hover:text-primary transition-colors">Features</Link>
            <Link href="#frameworks" className="text-sm text-text-secondary hover:text-primary transition-colors">Frameworks</Link>
            <Link href="#pricing" className="text-sm text-text-secondary hover:text-primary transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-primary transition-colors">Sign In</Link>
            <Link href="/signup" className="btn-primary text-sm py-2">Start Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            SOC 2 · GDPR · HIPAA · ISO 27001
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-text-primary md:text-6xl">
            Your AI compliance officer.<br />
            <span className="text-primary">6 weeks to SOC 2.</span>
          </h1>
          <p className="mb-10 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            CompliBot scans your infrastructure, identifies compliance gaps, generates all required policies, and guides your team to audit-ready — for 70% less than a compliance consultant.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/signup" className="btn-primary text-base px-8 py-3">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn-outline text-base px-8 py-3">
              View Live Demo
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-tertiary">14-day free trial · No credit card · SOC 2 Type I ready in 6 weeks</p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary/5 py-12 px-6 border-y border-border">
        <div className="mx-auto max-w-4xl grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            { value: '70%', label: 'Cheaper than consultants' },
            { value: '6 wks', label: 'To SOC 2 Type I readiness' },
            { value: '300+', label: 'Customers secured' },
            { value: '$0', label: 'Enterprise deals lost to compliance' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">Everything you need for compliance</h2>
            <p className="mt-3 text-text-secondary">From first scan to audit-ready in weeks, not months</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: BarChart3, title: 'Infrastructure Scanning', desc: 'Connect AWS, GCP, GitHub and identity providers. CompliBot scans your entire stack and maps it against compliance frameworks in minutes.' },
              { icon: AlertTriangle, title: 'Gap Analysis', desc: 'AI-powered analysis of your current state vs. target framework. Get a prioritized remediation plan with specific, actionable steps.' },
              { icon: FileText, title: 'Policy Generation', desc: 'AI generates all required policies customized to your actual stack — information security, access control, incident response, and more.' },
              { icon: CheckCircle, title: 'Task Management', desc: 'Assign remediation tasks to team members with due dates. Track progress toward compliance milestones in real-time.' },
              { icon: Lock, title: 'Evidence Collection', desc: 'Automated evidence collection for continuous monitoring. No more scrambling before audits — evidence is always up to date.' },
              { icon: Settings, title: 'Audit Room', desc: 'When your auditor arrives, share a secure portal with all evidence organized by control. Audits complete faster and cheaper.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all">
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

      {/* Frameworks */}
      <section id="frameworks" className="bg-surface py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">4 frameworks. One platform.</h2>
          <p className="text-text-secondary mb-12">Start with SOC 2. Add GDPR, HIPAA, or ISO 27001 as you grow.</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { name: 'SOC 2', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', desc: '64 controls. Type I or Type II.' },
              { name: 'GDPR', color: 'bg-cyan-100 text-cyan-700 border-cyan-200', desc: '40 requirements. EU data protection.' },
              { name: 'HIPAA', color: 'bg-green-100 text-green-700 border-green-200', desc: '45 standards. Healthcare data.' },
              { name: 'ISO 27001', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: '93 controls. International standard.' },
            ].map(({ name, color, desc }) => (
              <div key={name} className={`rounded-xl border p-5 ${color}`}>
                <p className="text-lg font-bold mb-1">{name}</p>
                <p className="text-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-text-primary">60-70% less than consultants</h2>
            <p className="mt-3 text-text-secondary">No sales process. No CSM required. Self-serve in 24 hours.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: 'Startup', price: '$299', period: '/month', features: ['1 framework', 'Up to 25 employees', 'Infrastructure scanning', 'Gap analysis + tasks', 'Policy generation', 'Email support'], cta: 'Start free trial', primary: false },
              { name: 'Growth', price: '$599', period: '/month', features: ['3 frameworks', 'Up to 100 employees', 'Everything in Startup', 'Evidence automation', 'Audit Room portal', 'Slack integration', 'Priority support'], cta: 'Start free trial', primary: true },
              { name: 'Enterprise', price: 'Custom', period: '', features: ['All 4 frameworks', 'Unlimited employees', 'Everything in Growth', 'SSO / SAML', 'Dedicated CSM', 'SLA guarantee', 'On-prem option'], cta: 'Contact Sales', primary: false },
            ].map(({ name, price, period, features, cta, primary }) => (
              <div key={name} className={`rounded-xl border p-6 ${primary ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20' : 'border-border bg-card'}`}>
                {primary && <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">MOST POPULAR</div>}
                <h3 className="font-bold text-text-primary">{name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-text-primary">{price}</span>
                  <span className="text-sm text-text-tertiary">{period}</span>
                </div>
                <ul className="mb-6 space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full rounded-lg py-2.5 text-center text-sm font-semibold transition ${primary ? 'bg-primary text-white hover:bg-primary-dark' : 'border border-border text-text-primary hover:bg-surface'}`}>
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
          <Shield className="h-12 w-12 text-white/80 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white">Stop losing enterprise deals to compliance</h2>
          <p className="mt-3 text-primary-foreground/80">Join 300+ startups who achieved compliance without a $200K consultant.</p>
          <Link href="/signup" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg hover:bg-primary-foreground transition">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-sm text-text-tertiary">© 2025 CompliBot. <em>No startup should lose a deal over a compliance checkbox.</em></p>
      </footer>
    </div>
  );
}
