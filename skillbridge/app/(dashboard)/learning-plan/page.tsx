import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, ExternalLink, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import type { LearningPlan, LearningItem, LearningStatus } from '@/types/database';
import { updateItemStatus } from '@/lib/actions/learning';

async function getLearningData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { plan: null, items: [] };

  const { data: plan } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!plan) return { plan: null, items: [] };

  const { data: items } = await supabase
    .from('learning_items')
    .select('*')
    .eq('plan_id', plan.id)
    .order('order_index', { ascending: true });

  return { plan: plan as LearningPlan, items: (items ?? []) as LearningItem[] };
}

const STATUS_ORDER: LearningStatus[] = ['in_progress', 'not_started', 'completed'];

function StatusBadge({ status }: { status: LearningStatus }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
        <CheckCircle2 className="w-3 h-3" /> Completed
      </span>
    );
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full font-medium">
        <Clock className="w-3 h-3" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">
      <Circle className="w-3 h-3" /> Not Started
    </span>
  );
}

function ItemToggle({ item }: { item: LearningItem }) {
  async function toggle() {
    'use server';
    const nextStatus: LearningStatus =
      item.status === 'not_started' ? 'in_progress' :
      item.status === 'in_progress' ? 'completed' :
      'not_started';
    await updateItemStatus(item.id, nextStatus);
  }

  return (
    <form action={toggle}>
      <button
        type="submit"
        className="text-xs px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors"
      >
        {item.status === 'not_started' ? 'Start' : item.status === 'in_progress' ? 'Mark Done' : 'Reset'}
      </button>
    </form>
  );
}

export default async function LearningPlanPage() {
  const { plan, items } = await getLearningData();

  const progressPct = plan && plan.total_courses > 0
    ? Math.round((plan.completed_courses / plan.total_courses) * 100)
    : 0;

  const sortedItems = [...items].sort((a, b) => {
    return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Learning Plan</h1>
        <p className="text-gray-500 mt-1">Your personalized upskilling roadmap to your new career.</p>
      </div>

      {!plan ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-sky-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No learning plan yet</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            First explore your career paths, then generate a personalized learning plan with AI.
          </p>
          <Link
            href="/career-paths"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-lg text-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" /> Explore Career Paths
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Plan summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{plan.career_title}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {plan.total_courses} courses · {plan.estimated_weeks} weeks estimated
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-sky-600">{progressPct}%</div>
                <div className="text-xs text-gray-400">complete</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{plan.completed_courses} completed</span>
                <span>{plan.total_courses} total</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-sky-500 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Learning items */}
          <div className="space-y-3">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border p-4 flex items-start gap-4 transition-all ${
                  item.status === 'completed' ? 'border-green-200 opacity-75' :
                  item.status === 'in_progress' ? 'border-sky-300 shadow-sm' :
                  'border-gray-200'
                }`}
              >
                <div className="mt-0.5">
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : item.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-sky-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`font-medium text-sm ${item.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{item.provider}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">{item.skill_covered}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{item.duration_hours}h</span>
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <ItemToggle item={item} />
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
                      >
                        <ExternalLink className="w-3 h-3" /> Open Course
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
