'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { CreditCard, Loader2, Zap, Building2, Briefcase } from 'lucide-react';

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  meeting_limit: number | null;
  stripe_customer_id: string | null;
}

interface BillingSectionProps {
  subscription: Subscription | null;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/mo',
    meetings: '25 meetings/mo',
    icon: Zap,
    color: 'text-blue-600',
    features: ['AI agenda generation', 'Whisper transcription', 'Minutes PDF export', 'Resolution voting'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$79',
    period: '/mo',
    meetings: '100 meetings/mo',
    icon: Briefcase,
    color: 'text-purple-600',
    features: ['Everything in Starter', 'Board member invites', 'Analytics dashboard', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    period: '/mo',
    meetings: 'Unlimited meetings',
    icon: Building2,
    color: 'text-emerald-600',
    features: ['Everything in Pro', 'Custom branding', 'SOC 2 compliance', 'Dedicated CSM'],
  },
];

export function BillingSection({ subscription }: BillingSectionProps) {
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const plan = subscription?.plan ?? 'free';
  const status = subscription?.status ?? 'inactive';
  const isActive = status === 'active' || status === 'trialing';

  async function handleUpgrade(planId: string) {
    setLoadingPlan(planId);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else toast({ title: data.error ?? 'Checkout failed', variant: 'destructive' });
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManage() {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else toast({ title: data.error ?? 'Portal failed', variant: 'destructive' });
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-5 h-5 text-[var(--foreground)]" />
        <h2 className="font-heading text-lg font-semibold text-[var(--foreground)]">Subscription & Billing</h2>
      </div>

      {isActive && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]/40 border border-[var(--border)] mb-6">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[var(--foreground)] capitalize">{plan} Plan</p>
              <Badge variant="success">Active</Badge>
            </div>
            {subscription?.current_period_end && (
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={handleManage} disabled={loadingPortal}>
            {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Billing'}
          </Button>
        </div>
      )}

      {!isActive && (
        <p className="text-sm text-[var(--muted-foreground)] mb-5">
          You&apos;re on the <strong>Free plan</strong> — limited to 5 meetings/month and basic AI features.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const Icon = p.icon;
          const isCurrent = plan === p.id && isActive;
          return (
            <div key={p.id} className={`rounded-lg border p-4 ${isCurrent ? 'border-blue-500 bg-blue-50/40' : 'border-[var(--border)]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span className="font-semibold text-[var(--foreground)]">{p.name}</span>
                {isCurrent && <Badge variant="info" className="ml-auto text-xs">Current</Badge>}
              </div>
              <div className="mb-3">
                <span className="text-2xl font-bold font-mono text-[var(--foreground)]">{p.price}</span>
                <span className="text-sm text-[var(--muted-foreground)]">{p.period}</span>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{p.meetings}</p>
              </div>
              <ul className="space-y-1 mb-4">
                {p.features.map((f) => (
                  <li key={f} className="text-xs text-[var(--muted-foreground)] flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className="w-full"
                variant={isCurrent ? 'outline' : 'default'}
                disabled={isCurrent || loadingPlan !== null}
                onClick={() => !isCurrent && handleUpgrade(p.id)}
              >
                {loadingPlan === p.id
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isCurrent ? 'Current Plan' : 'Upgrade'}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
