'use client';

import React from 'react';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: { value: string; positive: boolean };
  className?: string;
  index?: number;
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

export function StatCard({ label, value, icon: Icon, description, trend, className, index = 0, animateValue = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -3, boxShadow: '0 12px 28px -6px rgba(0,0,0,0.12)', transition: { duration: 0.18 } }}
      className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-card)]', className)}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">{label}</p>
        {Icon && (
          <motion.div
            initial={{ scale: 0, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.4, delay: index * 0.08 + 0.2 }}
            className="text-[var(--muted-foreground)]"
          >
            <Icon className="w-5 h-5" />
          </motion.div>
        )}
      </div>
      <motion.p
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.15 }}
        className="mt-2 text-2xl font-bold text-[var(--foreground)]"
      >
        {animateValue && typeof value === 'number' ? (
          <AnimatedNumber value={value} />
        ) : (
          value
        )}
      </motion.p>
      {description && <p className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</p>}
      {trend && (
        <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </motion.div>
  );
}
