'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedStatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
  index?: number;
}

export function AnimatedStatCard({
  title,
  value,
  icon,
  trend,
  description,
  className,
  index = 0,
}: AnimatedStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 10px -6px rgba(0, 0, 0, 0.06)',
        transition: { duration: 0.2 },
      }}
      className={cn(
        'rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)] transition-colors',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{title}</p>
        {icon && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.2, type: 'spring', bounce: 0.4 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
          >
            {icon}
          </motion.div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 + 0.15 }}
          className="font-heading text-2xl font-bold text-[var(--foreground)]"
        >
          {value}
        </motion.p>
        {trend && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.3, type: 'spring' }}
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              trend.isPositive
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            )}
          >
            <svg
              className={cn('mr-0.5 h-3 w-3', !trend.isPositive && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
            {Math.abs(trend.value).toFixed(1)}%
          </motion.span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>
      )}
    </motion.div>
  );
}
