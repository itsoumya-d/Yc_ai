'use client';

import * as React from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  /** Stagger delay index (0, 1, 2, 3…) */
  index?: number;
  /** If true, animates numeric value from 0 to target on mount */
  animateValue?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => {
    if (value >= 1000) return Math.round(v).toLocaleString();
    return v % 1 === 0 ? Math.round(v) : v.toFixed(1);
  });

  React.useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] });
      return controls.stop;
    }
  }, [inView, value, motionValue]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  className,
  index = 0,
  animateValue = false,
}: StatCardProps) {
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{
        y: -3,
        boxShadow: '0 12px 28px -6px rgba(0,0,0,0.12), 0 4px 10px -4px rgba(0,0,0,0.08)',
        transition: { duration: 0.18 },
      }}
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.08 + 0.2,
              type: 'spring',
              bounce: 0.4,
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 dark:bg-navy-800"
          >
            <Icon className="w-5 h-5 text-navy-600 dark:text-navy-300" />
          </motion.div>
        )}
      </div>
      <div className="mt-3">
        <motion.p
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: index * 0.08 + 0.15 }}
          className="text-2xl font-bold tracking-tight text-foreground font-data"
        >
          {animateValue && isNumeric ? <AnimatedNumber value={value as number} /> : value}
        </motion.p>
        {(description || trend) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.08 + 0.3 }}
            className="mt-1 flex items-center gap-1.5"
          >
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                  trend.isPositive
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
