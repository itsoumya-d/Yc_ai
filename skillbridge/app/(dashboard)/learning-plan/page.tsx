'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/learning/course-card';
import { useToast } from '@/components/ui/toast';
import { getLearningPlans, deleteLearningPlan } from '@/lib/actions/learning';
import { Loader2, BookOpen, Trash2, Target } from 'lucide-react';
import Link from 'next/link';
import type { LearningPlan, Course } from '@/types/database';

type PlanWithCourses = LearningPlan & { courses: Course[] };

export default function LearningPlanPage() {
  const [plans, setPlans] = useState<PlanWithCourses[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPlans = async () => {
    const { data } = await getLearningPlans();
    setPlans(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const handleDelete = async (planId: string) => {
    if (!confirm('Delete this learning plan and all its courses?')) return;
    setDeleting(planId);
    const { error } = await deleteLearningPlan(planId);
    if (error) {
      showToast(error, 'error');
    } else {
      showToast('Learning plan deleted', 'success');
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Plans"
        description="Track your progress through personalized learning paths."
        action={
          <Link href="/careers">
            <Button variant="outline">
              <Target className="w-4 h-4" />
              Browse Careers
            </Button>
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : plans.length > 0 ? (
        <div className="space-y-6">
          {plans.map((plan) => {
            const sortedCourses = [...plan.courses].sort((a, b) => a.order_index - b.order_index);
            return (
              <Card key={plan.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle>{plan.title}</CardTitle>
                      {plan.description && <CardDescription>{plan.description}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{plan.progress}%</p>
                        <p className="text-xs text-gray-400">complete</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(plan.id)}
                        disabled={deleting === plan.id}
                        className="text-gray-400 hover:text-red-500"
                      >
                        {deleting === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    <Progress value={plan.progress} color="green" size="md" />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>
                        {sortedCourses.filter((c) => c.is_completed).length} of {sortedCourses.length} courses complete
                      </span>
                      <span>{plan.estimated_weeks} weeks estimated</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-2">
                  {sortedCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onToggle={fetchPlans} />
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No learning plans yet</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md">
            Visit Career Paths to explore career options and create a personalized learning plan.
          </p>
          <Link href="/careers">
            <Button className="mt-4">
              <Target className="w-4 h-4" />
              Explore Careers
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
