'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionDef {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
}

interface EmptyStateProps {
  /** LucideIcon component or emoji string */
  icon?: LucideIcon | string;
  /** Background color for the icon container (when using LucideIcon) */
  iconColor?: string;
  title: string;
  description?: string;
  action?: ActionDef;
  secondaryAction?: ActionDef;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_MAP = {
  sm: { py: 'py-10', iconWrap: 'h-12 w-12', iconSize: 'h-5 w-5', emoji: 'text-4xl', title: 'text-base', desc: 'text-xs' },
  md: { py: 'py-16', iconWrap: 'h-16 w-16', iconSize: 'h-7 w-7', emoji: 'text-5xl', title: 'text-lg', desc: 'text-sm' },
  lg: { py: 'py-24', iconWrap: 'h-20 w-20', iconSize: 'h-9 w-9', emoji: 'text-6xl', title: 'text-xl', desc: 'text-base' },
};

function ActionButton({
  label,
  onClick,
  href,
  icon,
  variant,
}: ActionDef & { variant: 'primary' | 'secondary' }) {
  const cls = cn(
    'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all active:scale-95',
    variant === 'primary'
      ? 'bg-navy-800 text-white hover:bg-navy-900 shadow-sm'
      : 'border border-border bg-background text-foreground hover:bg-muted'
  );

  const content = (
    <>
      {icon ?? (variant === 'primary' && <Plus className="h-4 w-4" />)}
      {label}
    </>
  );

  if (href) {
    return <Link href={href} className={cls}>{content}</Link>;
  }
  return (
    <button onClick={onClick} type="button" className={cls}>{content}</button>
  );
}

export function EmptyState({
  icon,
  iconColor = 'bg-navy-100 dark:bg-navy-800',
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className,
}: EmptyStateProps) {
  const s = SIZE_MAP[size];
  const isComponent = icon && typeof icon !== 'string';
  const IconComponent = isComponent ? (icon as LucideIcon) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn('flex flex-col items-center justify-center text-center', s.py, className)}
    >
      {/* Icon */}
      {icon && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: 'spring', bounce: 0.3 }}
          className="mb-5"
        >
          {IconComponent ? (
            <div className={cn('flex items-center justify-center rounded-2xl', s.iconWrap, iconColor)}>
              <IconComponent className={cn(s.iconSize, 'text-navy-600 dark:text-navy-300')} />
            </div>
          ) : (
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className={cn('select-none', s.emoji)}
              role="img"
              aria-label={title}
            >
              {icon as string}
            </motion.span>
          )}
        </motion.div>
      )}

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={cn('font-semibold text-foreground mb-2', s.title)}
      >
        {title}
      </motion.h3>

      {description && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn('text-muted-foreground max-w-sm leading-relaxed', s.desc, (action || secondaryAction) ? 'mb-6' : '')}
        >
          {description}
        </motion.p>
      )}

      {(action || secondaryAction) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {action && <ActionButton {...action} variant="primary" />}
          {secondaryAction && <ActionButton {...secondaryAction} variant="secondary" />}
        </motion.div>
      )}
    </motion.div>
  );
}
