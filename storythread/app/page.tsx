import Link from 'next/link';
import { Feather, BookOpen, Users, Globe, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="flex items-center gap-2 font-heading text-xl font-bold text-brand-600">
            <Feather className="h-5 w-5" />
            StoryThread
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[var(--foreground)] hover:text-brand-600">
              Sign in
            </Link>
            <Link href="/signup" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
          AI-Powered Fiction Writing
        </div>
        <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-6xl">
          Write stories that
          <br />
          <span className="text-brand-600">come alive</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
          Build rich characters, immersive worlds, and compelling narratives with AI-powered writing assistance. Your creative companion for fiction.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/signup" className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 sm:w-auto">
            Start Writing Free
          </Link>
          <Link href="/login" className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--accent)] sm:w-auto">
            Sign In
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: 'Story Manager', desc: 'Organize chapters, track progress, and manage your manuscripts in one place.' },
            { icon: Users, title: 'Character Bible', desc: 'Build detailed character profiles with personality, backstory, and voice notes.' },
            { icon: Globe, title: 'World Builder', desc: 'Create rich worlds with locations, lore, factions, and rules.' },
            { icon: Sparkles, title: 'AI Assistant', desc: 'Get intelligent writing suggestions, dialogue, and prose improvements.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
              <feature.icon className="h-8 w-8 text-brand-600" />
              <h3 className="mt-4 font-heading text-base font-semibold text-[var(--foreground)]">{feature.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[var(--border)] py-8">
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          StoryThread &mdash; Where stories begin.
        </p>
      </footer>
    </div>
  );
}
