import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, TrendingUp, CheckCircle, BookOpen } from 'lucide-react';
import type { CareerMatch } from '@/types/database';

interface CareerCardProps {
  career: CareerMatch;
  onCreatePlan?: (career: CareerMatch) => void;
}

const difficultyConfig = {
  easy: { variant: 'success' as const, label: 'Easy Transition' },
  medium: { variant: 'warning' as const, label: 'Moderate Transition' },
  hard: { variant: 'destructive' as const, label: 'Challenging Transition' },
};

export function CareerCard({ career, onCreatePlan }: CareerCardProps) {
  const difficulty = difficultyConfig[career.difficulty];

  return (
    <Card hover className="flex flex-col">
      <CardContent className="pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{career.career_title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{career.description}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-indigo-600">{career.match_score}%</div>
            <div className="text-xs text-gray-400">match</div>
          </div>
        </div>

        {/* Match progress */}
        <Progress value={career.match_score} className="mb-4" size="md" />

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant={difficulty.variant}>{difficulty.label}</Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="truncate">
              ${career.salary_range.min.toLocaleString()}–${career.salary_range.max.toLocaleString()}/yr
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>{career.time_to_transition}</span>
          </div>
        </div>

        {/* Transferable skills */}
        {career.transferable_skills.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              <p className="text-xs font-medium text-gray-500">Transferable skills</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {career.transferable_skills.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="success">{skill}</Badge>
              ))}
              {career.transferable_skills.length > 4 && (
                <Badge variant="outline">+{career.transferable_skills.length - 4} more</Badge>
              )}
            </div>
          </div>
        )}

        {/* Skills to learn */}
        {career.skills_to_learn.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <p className="text-xs font-medium text-gray-500">Skills to learn</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {career.skills_to_learn.slice(0, 4).map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action */}
        {onCreatePlan && (
          <div className="mt-auto pt-4 border-t border-gray-100">
            <Button onClick={() => onCreatePlan(career)} className="w-full" size="sm">
              <BookOpen className="w-4 h-4" />
              Create Learning Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
