'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toggleCourseComplete } from '@/lib/actions/learning';
import { useToast } from '@/components/ui/toast';
import { CheckCircle, Circle, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Course } from '@/types/database';

interface CourseCardProps {
  course: Course;
  onToggle?: () => void;
}

const difficultyVariant: Record<Course['difficulty'], 'default' | 'secondary' | 'destructive'> = {
  beginner: 'default',
  intermediate: 'secondary',
  advanced: 'destructive',
};

export function CourseCard({ course, onToggle }: CourseCardProps) {
  const { showToast } = useToast();

  const handleToggle = async () => {
    const result = await toggleCourseComplete(course.id, !course.is_completed);
    if (result.error) {
      showToast(result.error, 'error');
    } else {
      showToast(course.is_completed ? 'Marked as incomplete' : 'Course completed!', 'success');
      onToggle?.();
    }
  };

  return (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg border transition-colors',
        course.is_completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      )}
    >
      <button
        onClick={handleToggle}
        className="mt-0.5 flex-shrink-0 text-gray-400 hover:text-indigo-600 transition-colors"
        title={course.is_completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {course.is_completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className={cn('text-sm font-semibold', course.is_completed ? 'line-through text-gray-400' : 'text-gray-900')}>
              {course.title}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">{course.provider}</p>
          </div>
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 text-indigo-500 hover:text-indigo-700"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge variant={difficultyVariant[course.difficulty]}>{course.difficulty}</Badge>
          <Badge variant="outline">{course.skill_category}</Badge>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {course.duration_hours}h
          </div>
          {course.is_free && (
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <DollarSign className="w-3 h-3" />
              Free
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
