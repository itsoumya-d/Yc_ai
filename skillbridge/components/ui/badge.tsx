import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'teal' | 'orange' | 'green' | 'amber' | 'red' | 'blue' | 'gold' | 'outline';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700 border-stone-200',
  teal: 'bg-teal-50 text-teal-800 border-teal-200',
  orange: 'bg-sunrise-50 text-sunrise-800 border-sunrise-200',
  green: 'bg-green-50 text-green-800 border-green-200',
  amber: 'bg-amber-50 text-amber-800 border-amber-200',
  red: 'bg-red-50 text-red-800 border-red-200',
  blue: 'bg-blue-50 text-blue-800 border-blue-200',
  gold: 'bg-amber-50 text-amber-900 border-amber-300',
  outline: 'bg-transparent text-stone-600 border-stone-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
