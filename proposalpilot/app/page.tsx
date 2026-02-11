import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, FileText, Users, Sparkles, BarChart3, Blocks } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-6 h-6 text-blue-600" />
            <span className="font-heading text-xl font-bold text-[var(--foreground)]">ProposalPilot</span>
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
            Win More Business with<br /><span className="text-blue-600">AI-Powered Proposals</span>
          </h1>
          <p className="mt-6 text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Create professional, compelling proposals in minutes. Let AI handle the writing while you focus on closing deals.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/signup"><Button size="lg">Start Free Trial</Button></Link>
            <Link href="/login"><Button variant="outline" size="lg">Sign In</Button></Link>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, title: 'Proposal Builder', desc: 'Create structured proposals with sections, pricing, and timelines in a clean editor.' },
              { icon: Users, title: 'Client Management', desc: 'Keep track of your clients, their industries, and past proposals in one place.' },
              { icon: Sparkles, title: 'AI Generation', desc: 'Generate proposal sections from a brief using AI. Write faster, win more.' },
              { icon: Blocks, title: 'Content Library', desc: 'Save and reuse content blocks like case studies, bios, and methodologies.' },
              { icon: BarChart3, title: 'Pipeline Overview', desc: 'Track proposal status, pipeline value, and win rates on your dashboard.' },
              { icon: Send, title: 'Send & Track', desc: 'Mark proposals as sent and track their journey from draft to won.' },
            ].map((f) => (
              <Card key={f.title} className="p-6">
                <f.icon className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-heading text-lg font-semibold text-[var(--foreground)]">{f.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">{f.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-[var(--muted-foreground)]">
          ProposalPilot — AI-powered proposal platform for agencies & consultancies.
        </div>
      </footer>
    </div>
  );
}
