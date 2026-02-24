import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            {/* Compass icon — inline SVG to avoid any icon-package dependency */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0EA5E9"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span className="text-xl font-bold text-sky-500 tracking-tight">SkillBridge</span>
          </Link>

          {/* Nav actions */}
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors px-3 py-2 rounded-lg"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* ─── Hero ───────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-teal-50 pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-100 opacity-50 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-teal-100 opacity-50 blur-3xl pointer-events-none"
          />

          <div className="relative max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-sky-600 bg-sky-100 rounded-full px-3 py-1 mb-6">
                  AI-Powered Career Transitions
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 mb-6">
                  Your Next Career is{' '}
                  <span className="text-sky-500">3 Steps</span> Away
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
                  SkillBridge analyzes your current skills, finds the highest-match careers, and
                  builds you a personalized 90-day learning plan — powered by AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 text-base font-semibold bg-sky-500 hover:bg-sky-600 text-white px-7 py-3.5 rounded-xl shadow-md transition-colors"
                  >
                    Discover My Career Paths
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 text-base font-semibold border-2 border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-600 px-7 py-3.5 rounded-xl transition-colors"
                  >
                    See How It Works
                  </a>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#0EA5E9"
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Join <strong className="text-slate-700">12,000+</strong> professionals who&apos;ve made successful career transitions
                </p>
              </div>

              {/* Step diagram placeholder */}
              <div className="relative flex flex-col gap-4">
                {/* Diagram card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6 text-center">
                    Your Journey in 3 Steps
                  </p>

                  {/* Step 1 */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-sky-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Skills Assessment</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Share your background, skills &amp; goals in 5 minutes
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {['Python', 'Project Mgmt', 'SQL', 'Leadership'].map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2.5 py-0.5 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="ml-5 w-px h-6 bg-gradient-to-b from-sky-300 to-teal-300" />

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">Career Matches</p>
                      <p className="text-sm text-slate-500 mt-0.5">AI surfaces your top 5 career paths</p>
                      <div className="mt-2 space-y-1.5">
                        {[
                          { role: 'Product Manager', pct: 88, color: 'bg-sky-500' },
                          { role: 'Data Analyst', pct: 82, color: 'bg-teal-500' },
                          { role: 'Solutions Engineer', pct: 74, color: 'bg-sky-400' },
                        ].map(({ role, pct, color }) => (
                          <div key={role} className="flex items-center gap-2 text-xs">
                            <span className="w-32 text-slate-600 font-medium truncate">{role}</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${color} rounded-full`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-700">{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Connector */}
                  <div className="ml-5 w-px h-6 bg-gradient-to-b from-teal-300 to-sky-400" />

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Learning Plan</p>
                      <p className="text-sm text-slate-500 mt-0.5">90-day roadmap with curated milestones</p>
                      <div className="mt-2 grid grid-cols-3 gap-1.5">
                        {['Week 1–4', 'Week 5–8', 'Week 9–12'].map((w, i) => (
                          <div key={w} className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                            <p className="text-xs font-semibold text-sky-600">{w}</p>
                            <div className="mt-1 space-y-0.5">
                              {Array.from({ length: 3 }).map((_, j) => (
                                <div
                                  key={j}
                                  className={`h-1.5 rounded-full ${i > j ? 'bg-sky-400' : 'bg-slate-200'}`}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating trust badge */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="#22c55e"
                      className="w-5 h-5"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Free to start</p>
                    <p className="text-xs text-slate-500">No credit card required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Social proof bar ────────────────────────────────────────── */}
        <section className="bg-slate-50 border-y border-slate-100 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { label: 'Career paths discovered', value: '48,000+' },
              { label: 'Successful transitions', value: '12,000+' },
              { label: 'Avg salary increase', value: '$28K' },
              { label: 'Learning plans created', value: '31,000+' },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-sky-500">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── How It Works ────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                Simple Process
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                How SkillBridge Works
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
                From your first input to a fully personalized career roadmap — in minutes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-sky-200 via-teal-200 to-sky-200"
              />

              {[
                {
                  num: '01',
                  title: 'Tell Us Your Story',
                  sub: '5 min',
                  body: 'Enter your current role, skills, and career goals. Our AI captures the full picture of your professional background.',
                  color: 'bg-sky-500',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                },
                {
                  num: '02',
                  title: 'AI Finds Your Best Paths',
                  sub: 'Instant',
                  body: 'Get 5 personalized career paths scored by match %, salary uplift, and transition time — ranked for your unique profile.',
                  color: 'bg-teal-500',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  ),
                },
                {
                  num: '03',
                  title: 'Follow Your Learning Plan',
                  sub: '90 days',
                  body: 'Curated courses, certifications, and milestones built specifically for your target role. Track progress every step of the way.',
                  color: 'bg-sky-600',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ),
                },
              ].map(({ num, title, sub, body, color, icon }) => (
                <div key={num} className="relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-8 flex flex-col items-center text-center">
                  <div className={`w-14 h-14 rounded-2xl ${color} text-white flex items-center justify-center mb-5 shadow-lg`}>
                    {icon}
                  </div>
                  <span className="text-4xl font-black text-slate-100 absolute top-4 right-5 select-none">
                    {num}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
                  <span className="text-xs font-semibold text-sky-500 bg-sky-50 rounded-full px-2.5 py-0.5 mb-3">
                    {sub}
                  </span>
                  <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Career Examples ─────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-50 to-teal-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                Real Transitions
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                See What&apos;s Possible
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
                SkillBridge has helped thousands of professionals make bold moves. Here are a few examples.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  from: 'Software Engineer',
                  to: 'Product Manager',
                  match: 88,
                  salary: '+$24K',
                  time: '4–6 months',
                  fromColor: 'bg-violet-100 text-violet-700',
                  toColor: 'bg-sky-100 text-sky-700',
                },
                {
                  from: 'Teacher',
                  to: 'UX Designer',
                  match: 76,
                  salary: '+$41K',
                  time: '6–8 months',
                  fromColor: 'bg-amber-100 text-amber-700',
                  toColor: 'bg-teal-100 text-teal-700',
                },
                {
                  from: 'Accountant',
                  to: 'Data Analyst',
                  match: 82,
                  salary: '+$18K',
                  time: '3–5 months',
                  fromColor: 'bg-slate-100 text-slate-700',
                  toColor: 'bg-sky-100 text-sky-700',
                },
              ].map(({ from, to, match, salary, time, fromColor, toColor }) => (
                <div
                  key={`${from}-${to}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4"
                >
                  {/* Transition arrow */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold rounded-full px-3 py-1 ${fromColor}`}>
                      {from}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="#94a3b8"
                      className="w-4 h-4 shrink-0"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className={`text-xs font-semibold rounded-full px-3 py-1 ${toColor}`}>
                      {to}
                    </span>
                  </div>

                  {/* Match bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-500 font-medium">Skill match</span>
                      <span className="text-sm font-bold text-sky-600">{match}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                        style={{ width: `${match}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Salary boost</p>
                      <p className="text-base font-extrabold text-green-600">{salary}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Transition time</p>
                      <p className="text-base font-extrabold text-slate-700">{time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Features ────────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                Everything You Need
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                Built to Get You Hired
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
                Every feature is designed around one goal: a successful career transition.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'AI-Powered Skill Gap Analysis',
                  body: 'Know exactly what you need to learn and in what order. No guesswork — just a clear, prioritized path.',
                  gradient: 'from-sky-400 to-sky-600',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="11" y1="8" x2="11" y2="14" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  ),
                },
                {
                  title: 'Resume Rewriter',
                  body: 'Your resume gets automatically rewritten and tailored for your target role using AI — ready to send in minutes.',
                  gradient: 'from-teal-400 to-teal-600',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  ),
                },
                {
                  title: 'Progress Tracking',
                  body: 'Track course completion and milestone achievements. Celebrate wins with streak counters and progress dashboards.',
                  gradient: 'from-sky-500 to-teal-500',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7" aria-hidden="true">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                  ),
                },
              ].map(({ title, body, gradient, icon }) => (
                <div
                  key={title}
                  className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-200 p-8 flex flex-col gap-5"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}>
                    {icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                Success Stories
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                Real People. Real Transitions.
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    'I went from nurse to healthcare UX designer in 8 months. SkillBridge made it feel achievable.',
                  name: 'Jennifer L.',
                  role: 'Nurse → Healthcare UX Designer',
                  avatar: 'JL',
                  avatarColor: 'bg-teal-500',
                },
                {
                  quote:
                    "The AI matched me to data science — a field I'd never considered. Now I'm earning 40% more.",
                  name: 'David R.',
                  role: 'Marketing Analyst → Data Scientist',
                  avatar: 'DR',
                  avatarColor: 'bg-sky-500',
                },
              ].map(({ quote, name, role, avatar, avatarColor }) => (
                <div
                  key={name}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-6"
                >
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#FBBF24" className="w-4 h-4" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote mark */}
                  <blockquote className="text-slate-700 text-base leading-relaxed font-medium italic">
                    &ldquo;{quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                    <div
                      className={`w-10 h-10 rounded-full ${avatarColor} text-white text-sm font-bold flex items-center justify-center shrink-0`}
                    >
                      {avatar}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{name}</p>
                      <p className="text-xs text-slate-500">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Pricing ─────────────────────────────────────────────────── */}
        <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-500">
                Transparent Pricing
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">
                Start Free, Scale When Ready
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
                No credit card required. Upgrade only when you&apos;re ready to accelerate.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              {/* Free */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Free
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">$0</span>
                    <span className="text-slate-400 text-sm mb-1">/mo</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Get started in minutes</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Career skills assessment',
                    '2 career path matches',
                    'Basic 90-day learning plan',
                    'Community support',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#0EA5E9" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup"
                  className="mt-auto inline-flex items-center justify-center text-sm font-semibold border-2 border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-600 px-5 py-2.5 rounded-xl transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro — highlighted */}
              <div className="rounded-2xl border-2 border-sky-500 bg-white p-8 flex flex-col gap-6 shadow-xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-sky-500 text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-sky-500 mb-2">
                    Pro
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">$29</span>
                    <span className="text-slate-400 text-sm mb-1">/mo</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">For serious career changers</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Everything in Free',
                    'All 5+ career path matches',
                    'Full personalized learning plan',
                    'AI resume rewriter',
                    'Progress tracking & milestones',
                    'Priority email support',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#0EA5E9" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/signup?plan=pro"
                  className="mt-auto inline-flex items-center justify-center text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl transition-colors shadow-md"
                >
                  Start Pro Free for 7 Days
                </Link>
              </div>

              {/* Teams */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Teams
                  </p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-slate-900">$99</span>
                    <span className="text-slate-400 text-sm mb-1">/mo</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">For L&amp;D and HR teams</p>
                </div>
                <ul className="space-y-3 flex-1">
                  {[
                    'Everything in Pro',
                    'Up to 20 team members',
                    'Team analytics dashboard',
                    'Manager oversight tools',
                    'Bulk onboarding',
                    'Dedicated account manager',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#0EA5E9" className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-auto inline-flex items-center justify-center text-sm font-semibold border-2 border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-600 px-5 py-2.5 rounded-xl transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8">
              All prices in USD. Cancel anytime. Billed monthly. Annual billing saves 20%.
            </p>
          </div>
        </section>

        {/* ─── CTA Banner ──────────────────────────────────────────────── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-500 to-teal-500">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
              Start your career transformation today
              <br />
              <span className="text-sky-100 font-semibold text-2xl sm:text-3xl">
                — it&apos;s free.
              </span>
            </h2>
            <p className="text-sky-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of professionals who&apos;ve already discovered their next career. No credit card, no commitment.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 text-base font-bold bg-white text-sky-600 hover:bg-sky-50 px-8 py-4 rounded-xl shadow-lg transition-colors"
            >
              Get Started for Free
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <p className="mt-5 text-sky-100 text-sm opacity-80">
              No credit card required &bull; Free forever plan available &bull; Cancel anytime
            </p>
          </div>
        </section>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8 mb-10">
            {/* Brand */}
            <div className="flex flex-col items-center sm:items-start gap-2">
              <Link href="/" className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
                <span className="text-lg font-bold text-white">SkillBridge</span>
              </Link>
              <p className="text-sm text-slate-500">AI-powered career transitions</p>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-3 text-sm">
              {[
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Sign In', href: '/login' },
                { label: 'Get Started', href: '/signup' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-slate-400 hover:text-sky-400 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center sm:text-left">
            <p className="text-xs text-slate-600">
              &copy; 2025 SkillBridge, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
