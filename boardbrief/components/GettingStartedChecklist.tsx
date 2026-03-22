'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const STEPS: ChecklistStep[] = [
  {
    id: 'add-members',
    title: 'Add board members',
    description: 'Invite directors and officers to collaborate on board governance.',
    href: '/board-members',
    cta: 'Add members',
  },
  {
    id: 'schedule-meeting',
    title: 'Schedule your first meeting',
    description: 'Create your first board meeting and build an agenda.',
    href: '/meetings/new',
    cta: 'Schedule meeting',
  },
  {
    id: 'upload-doc',
    title: 'Upload a document',
    description: 'Add foundational documents like articles of incorporation or bylaws.',
    href: '/documents',
    cta: 'Upload document',
  },
  {
    id: 'create-resolution',
    title: 'Draft a resolution',
    description: 'Record board decisions formally with a resolution.',
    href: '/resolutions',
    cta: 'Create resolution',
  },
  {
    id: 'explore-analytics',
    title: 'Review your analytics',
    description: 'Track board performance, meeting frequency, and action item completion.',
    href: '/analytics',
    cta: 'View analytics',
  },
];

const STORAGE_KEY = 'boardbrief_checklist_done';
const DISMISS_KEY = 'boardbrief_checklist_dismissed';

function getCompleted(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveCompleted(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function GettingStartedChecklist() {
  const [completed, setCompleted] = React.useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);

  React.useEffect(() => {
    setCompleted(getCompleted());
    setDismissed(localStorage.getItem(DISMISS_KEY) === 'true');
    setMounted(true);
  }, []);

  // Auto-detect completed steps from DB
  React.useEffect(() => {
    async function detectProgress() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const checks = await Promise.allSettled([
          supabase.from('board_members').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('meetings').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('documents').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('resolutions').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        ]);

        const ids = ['add-members', 'schedule-meeting', 'upload-doc', 'create-resolution'];
        const newCompleted = new Set(getCompleted());
        checks.forEach((result, i) => {
          if (result.status === 'fulfilled' && (result.value.count ?? 0) > 0) {
            newCompleted.add(ids[i]);
          }
        });
        setCompleted(newCompleted);
        saveCompleted(newCompleted);
      } catch { /* ok */ }
    }
    if (mounted) detectProgress();
  }, [mounted]);

  React.useEffect(() => {
    if (showCelebration) {
      const t = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showCelebration]);

  const handleComplete = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveCompleted(next);
      try { posthog.capture("onboarding_step_completed", { step_id: id }); } catch {}
      if (next.size === STEPS.length) {
        try { posthog.capture("onboarding_completed", {}); } catch {}
        setShowCelebration(true);
      }
      return next;
    });
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, 'true');
  };

  const progress = Math.round((completed.size / STEPS.length) * 100);
  const allDone = completed.size === STEPS.length;

  if (!mounted || dismissed) return null;
  if (showCelebration) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-8 text-center"
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-sm font-bold text-green-800 dark:text-green-300">Setup complete!</h3>
        <p className="text-xs text-green-600 dark:text-green-400 mt-1">You are all set. Invite your team to collaborate.</p>
      </motion.div>
    );
  }
  if (allDone) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="mb-8 rounded-xl border border-border bg-card overflow-hidden shadow-card"
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer select-none hover:bg-muted/30 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-foreground">
              Getting started with BoardBrief
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {completed.size}/{STEPS.length} complete
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform duration-200',
                  collapsed && '-rotate-90'
                )}
              />
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border border-t border-border">
              {STEPS.map((step, i) => {
                const isDone = completed.has(step.id);
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={cn(
                      'flex items-start gap-4 px-6 py-4 transition-colors',
                      isDone ? 'opacity-60' : 'hover:bg-muted/20'
                    )}
                  >
                    <button
                      onClick={() => handleComplete(step.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-green-500 transition-colors"
                      aria-label={isDone ? 'Completed' : 'Mark complete'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                      )}>
                        {step.title}
                      </p>
                      {!isDone && (
                        <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                      )}
                    </div>
                    {!isDone && (
                      <Link
                        href={step.href}
                        onClick={() => handleComplete(step.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-navy-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-900 transition-colors"
                      >
                        {step.cta}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
