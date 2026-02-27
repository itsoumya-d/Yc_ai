import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ClipboardCheck,
  Map,
  GraduationCap,
  Briefcase,
  FileText,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Lightbulb,
  Target,
  Brain,
  Heart,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Top Nav */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm font-heading">SB</span>
            </div>
            <span className="text-lg font-bold text-stone-900 font-heading">SkillBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 text-center">
        <h1 className="text-4xl font-bold text-stone-900 font-heading sm:text-5xl lg:text-6xl leading-tight">
          Your skills are worth more
          <br />
          <span className="text-teal-600">than you think.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 leading-relaxed">
          SkillBridge uses AI to discover your transferable skills, map them to growing careers,
          and guide your transition step by step.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <Button variant="primary" size="lg">
              <Sparkles className="h-5 w-5" />
              Start Your Free Assessment
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="outline" size="lg">See How It Works</Button>
          </a>
        </div>
        <p className="mt-4 text-sm text-stone-400">
          No credit card required. Takes 10 minutes.
        </p>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-stone-900 font-heading text-center sm:text-4xl">
            How It Works
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                icon: <ClipboardCheck className="h-8 w-8 text-teal-600" />,
                title: 'Tell us about your experience',
                description: 'Upload your resume or answer a guided questionnaire. Our AI identifies your transferable skills.',
              },
              {
                step: '2',
                icon: <Map className="h-8 w-8 text-sunrise-500" />,
                title: 'Discover your career matches',
                description: 'See careers ranked by how well your skills transfer. Real salary data and growth projections included.',
              },
              {
                step: '3',
                icon: <GraduationCap className="h-8 w-8 text-green-600" />,
                title: 'Start your transformation',
                description: 'Get a personalized learning plan, AI-rewritten resume, and matched job listings.',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-stone-50 flex items-center justify-center">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-600 text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-stone-900 font-heading">
                  {item.title}
                </h3>
                <p className="mt-2 text-stone-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-stone-900 font-heading text-center sm:text-4xl">
            Everything you need to change careers
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Brain className="h-6 w-6" />, title: 'AI Skills Analysis', description: 'We find skills you didn\'t know you had', color: 'text-teal-600 bg-teal-50' },
              { icon: <Target className="h-6 w-6" />, title: 'Personalized Career Paths', description: 'Not generic advice. Paths matched to YOUR skills', color: 'text-sunrise-600 bg-sunrise-50' },
              { icon: <GraduationCap className="h-6 w-6" />, title: 'Free Learning Plans', description: 'Curated courses from free and paid sources', color: 'text-green-600 bg-green-50' },
              { icon: <Briefcase className="h-6 w-6" />, title: 'Smart Job Matching', description: 'Jobs scored by how well your skills transfer', color: 'text-blue-600 bg-blue-50' },
              { icon: <FileText className="h-6 w-6" />, title: 'AI Resume Rewriter', description: 'Your experience, reframed for your new career', color: 'text-purple-600 bg-purple-50' },
              { icon: <Heart className="h-6 w-6" />, title: 'Mentor Support', description: 'Learn from people who\'ve made the same transition', color: 'text-red-500 bg-red-50' },
            ].map((feature) => (
              <Card key={feature.title} hover>
                <div className={`h-10 w-10 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-stone-900 font-heading">{feature.title}</h3>
                <p className="mt-1 text-sm text-stone-500">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-stone-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { stat: '85M', label: 'Jobs at risk from automation' },
            { stat: '72%', label: 'Average skills match found' },
            { stat: '4 mo', label: 'Average transition time' },
            { stat: '92%', label: 'User satisfaction rate' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold text-teal-400 font-heading">{item.stat}</p>
              <p className="mt-1 text-sm text-stone-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-stone-900 font-heading sm:text-4xl">
            Ready to discover what you&apos;re capable of?
          </h2>
          <p className="mt-4 text-lg text-stone-500">
            Your skills are more valuable than you realize. Let us show you.
          </p>
          <div className="mt-8">
            <Link href="/signup">
              <Button variant="primary" size="lg">
                <Sparkles className="h-5 w-5" />
                Start Your Free Assessment
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-sm text-stone-400">
            No credit card required. Takes 10 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">SB</span>
            </div>
            <span className="text-sm text-stone-500">SkillBridge</span>
          </div>
          <p className="text-sm text-stone-400">
            Your skills are worth more than you think.
          </p>
        </div>
      </footer>
    </div>
  );
}
