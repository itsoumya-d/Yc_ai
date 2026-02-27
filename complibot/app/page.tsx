import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Shield, CheckSquare, FileText, BarChart3, Lock, Zap } from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white font-heading">CompliBot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-blue-300 text-sm mb-6">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered Compliance Automation
          </div>
          <h1 className="font-heading text-5xl font-bold text-white tracking-tight leading-tight">
            Compliance without the <span className="text-blue-400">chaos</span>
          </h1>
          <p className="mt-6 text-xl text-slate-400 max-w-2xl mx-auto">
            CompliBot automates SOC 2, GDPR, HIPAA, and ISO 27001 compliance. AI generates policies,
            tracks controls, and keeps you audit-ready — all in one platform.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 font-semibold rounded-xl transition-colors text-base"
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Multi-Framework Support',
                desc: 'SOC 2, GDPR, HIPAA, and ISO 27001 — manage all frameworks in a single workspace.',
                color: 'text-blue-400',
                bg: 'bg-blue-900/30',
              },
              {
                icon: Zap,
                title: 'AI Policy Generator',
                desc: 'Generate comprehensive, audit-ready policy documents in seconds with GPT-4.',
                color: 'text-purple-400',
                bg: 'bg-purple-900/30',
              },
              {
                icon: CheckSquare,
                title: 'Controls Checklist',
                desc: 'Track implementation status of every control across your enabled frameworks.',
                color: 'text-green-400',
                bg: 'bg-green-900/30',
              },
              {
                icon: FileText,
                title: 'Evidence Collection',
                desc: 'Organize audit evidence by control and framework for streamlined audits.',
                color: 'text-yellow-400',
                bg: 'bg-yellow-900/30',
              },
              {
                icon: BarChart3,
                title: 'Compliance Dashboard',
                desc: 'Real-time compliance scores and gap analysis across all your frameworks.',
                color: 'text-orange-400',
                bg: 'bg-orange-900/30',
              },
              {
                icon: Lock,
                title: 'Task Management',
                desc: 'Track remediation tasks, assign owners, and set due dates to close gaps fast.',
                color: 'text-red-400',
                bg: 'bg-red-900/30',
              },
            ].map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-slate-800 bg-slate-800/50">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-slate-500">
          CompliBot — AI Compliance Automation for modern teams.
        </div>
      </footer>
    </div>
  );
}
