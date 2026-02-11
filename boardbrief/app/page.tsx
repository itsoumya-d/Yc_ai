import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Calendar, Users, CheckSquare, Sparkles, Vote, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-gold-500" />
            <span className="font-heading text-xl font-bold text-[var(--foreground)]">BoardBrief</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost">Log In</Button></Link>
            <Link href="/signup"><Button>Get Started</Button></Link>
          </div>
        </div>
      </header>
      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="font-heading text-5xl font-bold text-[var(--foreground)] tracking-tight">
            Prepare for Board Meetings<br /><span className="text-gold-500">with AI</span>
          </h1>
          <p className="mt-6 text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            The AI-powered governance platform for startup founders. Manage meetings, track resolutions, and never miss an action item.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg">Start Free</Button></Link>
            <Link href="/login"><Button variant="outline" size="lg">Sign In</Button></Link>
          </div>
        </section>
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Calendar, title: 'Meeting Management', desc: 'Schedule, prepare, and track board meetings with AI-generated agendas.' },
              { icon: Users, title: 'Board Directory', desc: 'Manage board members, their roles, and voting rights in one place.' },
              { icon: CheckSquare, title: 'Action Tracking', desc: 'Never lose track of action items. Assign, prioritize, and follow up.' },
              { icon: Vote, title: 'Resolutions', desc: 'Draft and track board resolutions with formal vote tallying.' },
              { icon: Sparkles, title: 'AI Assistance', desc: 'Generate agendas, meeting summaries, and resolution drafts with AI.' },
              { icon: BarChart3, title: 'Governance Dashboard', desc: 'See your governance health at a glance with key metrics and upcoming items.' },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="w-8 h-8 text-gold-500 mb-3" />
                <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--muted-foreground)]">BoardBrief — Governance made simple for startup founders.</div>
      </footer>
    </div>
  );
}
