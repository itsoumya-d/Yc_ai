'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ChevronDown, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import posthog from 'posthog-js';

interface ChecklistStep {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

const STEPS: ChecklistStep[] = [
  { id: 'add-client', title: 'Add your first client', description: 'Save client details for quick proposal creation.', href: '/clients', cta: 'Add client' },
  { id: 'create-proposal', title: 'Create your first proposal', description: 'Generate a winning proposal in minutes with AI.', href: '/proposals/new', cta: 'Create proposal' },
  { id: 'add-template', title: 'Browse content templates', description: 'Use pre-written content blocks to speed up proposals.', href: '/content-library', cta: 'Browse templates' },
  { id: 'send-proposal', title: 'Send a proposal', description: 'Share your proposal with a client link.', href: '/proposals', cta: 'Send proposal' },
  { id: 'complete-profile', title: 'Complete your profile', description: 'Add your logo and company details.', href: '/settings/profile', cta: 'Edit profile' },
];

const STORAGE_KEY = 'proposalpilot_checklist_done';
const DISMISS_KEY = 'proposalpilot_checklist_dismissed';

function getCompleted(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
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
      transition={{ duration: 0.3, delay: 0.4 }}
      className="mb-8 rounded-xl border border-border bg-card overflow-hidden"
    >
      <div
        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-foreground">Getting started with ProposalPilot</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{completed.size}/{STEPS.length} complete</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                className="p-1 rounded text-muted-foreground hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', collapsed && '-rotate-90')} />
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border border-t border-border">
              {STEPS.map((step) => {
                const isDone = completed.has(step.id);
                return (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-start gap-4 px-6 py-4 transition-colors',
                      isDone ? 'opacity-60' : 'hover:bg-muted/20'
                    )}
                  >
                    <button
                      onClick={() => handleComplete(step.id)}
                      className="mt-0.5 shrink-0 text-muted-foreground hover:text-green-500 transition-colors"
                      aria-label="Mark complete"
                    >
                      {isDone ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', isDone ? 'line-through text-muted-foreground' : 'text-foreground')}>
                        {step.title}
                      </p>
                      {!isDone && <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>}
                    </div>
                    {!isDone && (
                      <Link
                        href={step.href}
                        onClick={() => handleComplete(step.id)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity"
                      >
                        {step.cta}<ArrowRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
