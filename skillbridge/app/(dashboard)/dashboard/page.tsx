import { createServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTopCareerMatches } from '@/lib/actions/careers';
import { getAssessment } from '@/lib/actions/assessment';
import Link from 'next/link';
import { ArrowRight, Zap, Target, BookOpen, Briefcase, ClipboardList } from 'lucide-react';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const { data: assessment } = await getAssessment();
  const { data: topCareers } = await getTopCareerMatches(3);
  const { data: learningPlans } = await supabase
    .from('learning_plans')
    .select('*, courses(is_completed)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const activePlan = learningPlans?.[0];
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  const difficultyVariant = (d: string): 'success' | 'warning' | 'destructive' => {
    if (d === 'easy') return 'success';
    if (d === 'medium') return 'warning';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        description="Here's an overview of your career transition progress."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Skill Score</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{assessment?.skill_score ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <Progress value={assessment?.skill_score ?? 0} className="mt-3" size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Career Matches</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{topCareers?.length ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">AI-matched career paths</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Learning Progress</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activePlan?.progress ?? 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={activePlan?.progress ?? 0} color="green" className="mt-3" size="sm" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Skills Assessed</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{assessment?.skills?.length ?? 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Skills in your profile</p>
          </CardContent>
        </Card>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Career Matches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Career Matches</CardTitle>
                <Link href="/careers" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="divide-y divide-gray-50">
              {topCareers && topCareers.length > 0 ? (
                topCareers.map((career) => (
                  <div key={career.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{career.career_title}</h3>
                          <Badge variant={difficultyVariant(career.difficulty)}>{career.difficulty}</Badge>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{career.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">{career.time_to_transition} transition</span>
                          <span className="text-xs text-gray-400">
                            ${career.salary_range.min.toLocaleString()}–${career.salary_range.max.toLocaleString()}/yr
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-2xl font-bold text-indigo-600">{career.match_score}%</span>
                        <p className="text-xs text-gray-400">match</p>
                      </div>
                    </div>
                    <Progress value={career.match_score} className="mt-2" size="sm" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No career matches yet</p>
                  <Link href="/assessment" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">
                    Complete your assessment
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Next Step + Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Learning Step</CardTitle>
            </CardHeader>
            <CardContent>
              {activePlan ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{activePlan.title}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{activePlan.progress}%</span>
                    </div>
                    <Progress value={activePlan.progress} color="green" size="md" />
                  </div>
                  <Link
                    href="/learning-plan"
                    className="mt-4 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Continue learning <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No active learning plan</p>
                  <Link href="/learning-plan" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-1 inline-block">
                    Create a plan
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: '/assessment', label: 'Update Skills', icon: ClipboardList },
                { href: '/careers', label: 'Explore Careers', icon: Target },
                { href: '/jobs', label: 'Find Jobs', icon: Briefcase },
                { href: '/resume', label: 'Rewrite Resume', icon: Zap },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                    {action.label}
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-gray-400" />
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
