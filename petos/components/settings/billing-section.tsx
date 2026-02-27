'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';

interface Subscription {
  plan: string;
  status: string;
  current_period_end: string | null;
  pet_limit: number;
}

interface BillingSectionProps {
  subscription: Subscription | null;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium',
};

export function BillingSection({ subscription }: BillingSectionProps) {
  const { toast } = useToast();
  const [upgradingPlan, setUpgradingPlan] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);

  const currentPlan = subscription?.plan ?? 'free';
  const isActiveSub = subscription?.status === 'active' || subscription?.status === 'trialing';

  const handleUpgrade = async (plan: string) => {
    setUpgradingPlan(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error', description: data.error ?? 'Could not start checkout.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error starting checkout', variant: 'destructive' });
    } finally {
      setUpgradingPlan('');
    }
  };

  const handleManageBilling = async () => {
    setOpeningPortal(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error', description: 'Could not open billing portal.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error opening billing portal', variant: 'destructive' });
    } finally {
      setOpeningPortal(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
        <CardDescription>Manage your PetOS plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current plan status */}
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
          <div>
            <p className="font-medium">{PLAN_NAMES[currentPlan] ?? 'Free'} Plan</p>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {subscription?.pet_limit === 999999
                ? 'Unlimited pets'
                : `Up to ${subscription?.pet_limit ?? 3} pets`}
            </p>
            {subscription?.current_period_end && isActiveSub && (
              <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          {isActiveSub && currentPlan !== 'free' && (
            <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={openingPortal}>
              {openingPortal ? 'Opening...' : 'Manage'}
            </Button>
          )}
        </div>

        {/* Upgrade options */}
        {(!isActiveSub || currentPlan === 'free') && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: 'basic', label: 'Basic', price: '$7.99/mo', pets: 'Up to 5 pets', features: 'AI symptom analysis + medication reminders' },
              { key: 'premium', label: 'Premium', price: '$14.99/mo', pets: 'Unlimited pets', features: 'Everything + telehealth + priority support' },
            ].map((tier) => (
              <div
                key={tier.key}
                className={`rounded-lg border p-4 ${tier.key === 'premium' ? 'border-blue-500 bg-blue-50' : 'border-[var(--border)]'}`}
              >
                <p className="font-semibold">{tier.label}</p>
                <p className="mt-0.5 text-lg font-bold">{tier.price}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{tier.pets}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{tier.features}</p>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  variant={tier.key === 'premium' ? 'default' : 'outline'}
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={upgradingPlan === tier.key}
                >
                  {upgradingPlan === tier.key ? 'Redirecting...' : `Upgrade to ${tier.label}`}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
