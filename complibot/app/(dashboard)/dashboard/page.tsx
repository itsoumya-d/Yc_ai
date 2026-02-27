import { createServerClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceScore } from '@/components/dashboard/compliance-score';
import { FrameworkProgress } from '@/components/dashboard/framework-progress';
import Link from 'next/link';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  BookOpen,
  ListTodo,
  FolderOpen,
} from 'lucide-react';
import type { Framework, Task, Control } from '@/types/database';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organizations(*)')
    .eq('id', user!.id)
    .single();

  const orgId = profile?.organization_id;

  let frameworks: Framework[] = [];
  let overdueTasks: Task[] = [];
  let criticalControls: Control[] = [];
  let openTasksCount = 0;
  let totalControls = 0;
  let implementedControls = 0;

  if (orgId) {
    const [fwRes, taskRes, controlRes] = await Promise.all([
      supabase.from('frameworks').select('*').eq('organization_id', orgId).eq('enabled', true),
      supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', orgId)
        .neq('status', 'completed')
        .lt('due_date', new Date().toISOString())
        .limit(5),
      supabase
        .from('controls')
        .select('*')
        .eq('organization_id', orgId)
        .eq('severity', 'critical')
        .neq('status', 'implemented')
        .limit(5),
    ]);

    frameworks = (fwRes.data ?? []) as Framework[];
    overdueTasks = (taskRes.data ?? []) as Task[];
    criticalControls = (controlRes.data ?? []) as Control[];

    const { count: openCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .neq('status', 'completed');
    openTasksCount = openCount ?? 0;

    const { data: allControls } = await supabase
      .from('controls')
      .select('status')
      .eq('organization_id', orgId);
    totalControls = allControls?.length ?? 0;
    implementedControls = allControls?.filter((c) => c.status === 'implemented').length ?? 0;
  }

  const overallScore = frameworks.length > 0
    ? Math.round(frameworks.reduce((sum, f) => sum + f.compliance_score, 0) / frameworks.length)
    : 0;

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good day, ${firstName}`}
        description="Your compliance overview at a glance."
      />

      {/* Score + Framework progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center py-6">
          <ComplianceScore score={overallScore} />
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Framework Progress</CardTitle>
              <Link href="/frameworks" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                Manage <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <FrameworkProgress frameworks={frameworks} />
            {frameworks.length === 0 && (
              <div className="text-center py-4">
                <Link href="/frameworks" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Enable your first framework
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{frameworks.length}</p>
                <p className="text-xs text-slate-500">Active Frameworks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {implementedControls}/{totalControls}
                </p>
                <p className="text-xs text-slate-500">Controls Implemented</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{openTasksCount}</p>
                <p className="text-xs text-slate-500">Open Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{criticalControls.length}</p>
                <p className="text-xs text-slate-500">Critical Gaps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Critical Control Gaps
              </CardTitle>
              <Link href="/controls" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalControls.length > 0 ? (
              criticalControls.map((control) => (
                <div key={control.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{control.title}</p>
                    <p className="text-xs text-slate-500">{control.control_id} · {control.category}</p>
                  </div>
                  <Badge variant="destructive">{control.status.replace('_', ' ')}</Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No critical gaps — great work!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                Overdue Tasks
              </CardTitle>
              <Link href="/tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.length > 0 ? (
              overdueTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    {task.due_date && (
                      <p className="text-xs text-red-500">
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={task.priority === 'critical' ? 'destructive' : task.priority === 'high' ? 'warning' : 'outline'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No overdue tasks!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
