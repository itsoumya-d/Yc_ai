'use client';
import { useAppStore } from '@/stores/app-store';
import { BookOpen, Clock, DollarSign, Star, Play, CheckCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseStatus } from '@/types';

const STATUS_LABELS: Record<CourseStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default function LearningPage() {
  const { courses, updateCourse } = useAppStore();

  const startCourse = (id: string) => updateCourse(id, { status: 'in_progress', progress: 5 });
  const completeCourse = (id: string) => updateCourse(id, { status: 'completed', progress: 100 });

  const totalHours = courses.reduce((s, c) => s + c.duration_hours, 0);
  const completedHours = courses.filter((c) => c.status === 'completed').reduce((s, c) => s + c.duration_hours, 0);
  const totalCost = courses.filter((c) => c.cost > 0).reduce((s, c) => s + c.cost, 0);

  return (
    <div className="p-8 max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Learning Plan</h1>
        <p className="text-sm text-text-secondary mt-1">Curated courses to close your skills gaps</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Hours', value: `${completedHours}/${totalHours}h`, icon: Clock },
          { label: 'Courses', value: `${courses.filter(c => c.status === 'completed').length}/${courses.length}`, icon: BookOpen },
          { label: 'Total Cost', value: totalCost === 0 ? 'Free!' : `$${totalCost}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-tertiary">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overall progress bar */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-text-primary">Overall Completion</p>
          <p className="text-sm font-bold text-primary">{Math.round((completedHours / totalHours) * 100)}%</p>
        </div>
        <div className="h-3 rounded-full bg-surface overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${(completedHours / totalHours) * 100}%` }} />
        </div>
      </div>

      {/* Courses */}
      <div className="space-y-3">
        {courses.map((course) => (
          <div key={course.id} className={cn('rounded-2xl border p-5 transition-all', course.status === 'completed' ? 'border-green-200 bg-green-50/50' : course.status === 'in_progress' ? 'border-primary/30 bg-primary/5' : 'border-border bg-card')}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{course.title}</h3>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', course.status === 'completed' ? 'bg-green-100 text-green-700' : course.status === 'in_progress' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary')}>
                    {STATUS_LABELS[course.status]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-tertiary">
                  <span>{course.provider}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration_hours}h</span>
                  <span>·</span>
                  <span>{course.cost === 0 ? 'Free' : `$${course.cost}`}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{course.rating}</span>
                </div>
                <p className="mt-1 text-xs text-primary font-medium">Skill: {course.skill_name}</p>
              </div>
              <div className="flex gap-2">
                {course.status === 'not_started' && (
                  <button onClick={() => startCourse(course.id)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark transition">
                    <Play className="h-3 w-3" />Start
                  </button>
                )}
                {course.status === 'in_progress' && (
                  <button onClick={() => completeCourse(course.id)} className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition">
                    <CheckCircle className="h-3 w-3" />Complete
                  </button>
                )}
                {course.status === 'completed' && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">
                    <CheckCircle className="h-3 w-3" />Done
                  </div>
                )}
              </div>
            </div>
            {course.status === 'in_progress' && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-text-tertiary mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
