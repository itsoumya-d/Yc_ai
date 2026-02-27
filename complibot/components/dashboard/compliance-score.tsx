'use client';

import { cn } from '@/lib/utils';

interface ComplianceScoreProps {
  score: number;
  className?: string;
}

export function ComplianceScore({ score, className }: ComplianceScoreProps) {
  const clampedScore = Math.min(Math.max(score, 0), 100);

  // Calculate SVG arc
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#22c55e', text: 'text-green-600', label: 'Excellent' };
    if (s >= 60) return { stroke: '#3b82f6', text: 'text-blue-600', label: 'Good' };
    if (s >= 40) return { stroke: '#f59e0b', text: 'text-yellow-600', label: 'Fair' };
    return { stroke: '#ef4444', text: 'text-red-600', label: 'Needs Work' };
  };

  const { stroke, text, label } = getColor(clampedScore);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 80 80)"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-4xl font-bold font-heading', text)}>{clampedScore}</span>
          <span className="text-sm text-slate-500">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <p className={cn('text-sm font-semibold', text)}>{label}</p>
        <p className="text-xs text-slate-400">Overall Compliance Score</p>
      </div>
    </div>
  );
}
