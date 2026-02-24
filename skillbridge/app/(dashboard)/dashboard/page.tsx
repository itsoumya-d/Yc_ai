import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ClipboardList, Map, BookOpen, FileText, ArrowRight, TrendingUp } from 'lucide-react';

async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const [profileResult, skillsResult, pathsResult, planResult] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('skills').select('id').eq('user_id', userId),
    supabase.from('career_paths').select('id').eq('user_id', userId),
    supabase.from('learning_plans').select('id, total_courses, completed_courses').eq('user_id', userId).single(),
  ]);

  const skillsCount = skillsResult.data?.length ?? 0;
  const pathsCount = pathsResult.data?.length ?? 0;
  const plan = planResult.data;
  const progressPct = plan && plan.total_courses > 0
    ? Math.round((plan.completed_courses / plan.total_courses) * 100)
    : 0;

  return {
    profile: profileResult.data,
    skillsCount,
    pathsCount,
    progressPct,
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { profile, skillsCount, pathsCount, progressPct } = await getDashboardData(user!.id);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'there';

  const stats = [
    {
      label: 'Skills Identified',
      value: skillsCount,
      icon: ClipboardList,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      label: 'Career Paths Found',
      value: pathsCount,
      icon: Map,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
    {
      label: 'Learning Progress',
      value: `${progressPct}%`,
      icon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  const quickActions = [
    {
      title: 'Start Assessment',
      description: 'Tell us about your experience and skills to get personalized career recommendations.',
      href: '/assessment',
      icon: ClipboardList,
      color: 'bg-sky-500',
    },
    {
      title: 'Explore Careers',
      description: 'Browse AI-matched career paths based on your transferable skills.',
      href: '/career-paths',
      icon: Map,
      color: 'bg-teal-500',
    },
    {
      title: 'Update Resume',
      description: 'Use AI to rewrite your resume for your target career path.',
      href: '/resume',
      icon: FileText,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {displayName}!
        </h1>
        <p className="text-gray-500 mt-1">
          {profile?.onboarding_completed
            ? "Here's your career transition overview."
            : 'Complete your assessment to get personalized career recommendations.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all hover:border-sky-200"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{action.description}</p>
                <div className="flex items-center gap-1 mt-3 text-sky-500 text-sm font-medium">
                  Get started <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Learning Plan shortcut */}
      <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Your Learning Plan</h3>
            <p className="text-sky-100 text-sm mt-1">
              {progressPct > 0
                ? `You're ${progressPct}% through your upskilling journey. Keep going!`
                : 'Generate a personalized learning plan based on your target career.'}
            </p>
          </div>
          <Link
            href="/learning-plan"
            className="flex items-center gap-2 bg-white text-sky-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-sky-50 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            View Plan
          </Link>
        </div>
        {progressPct > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-sky-100 mb-1">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="w-full bg-sky-400/50 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
