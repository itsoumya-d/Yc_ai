'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import type { User, Subscription } from '@/types/database';

interface SettingsPageProps {
  profile: User | null;
  subscription: Subscription | null;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
};

const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  starter: 20,
  pro: 100,
  business: 999999,
};

export function SettingsPage({ profile, subscription }: SettingsPageProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState('');
  const [openingPortal, setOpeningPortal] = useState(false);

  const [businessName, setBusinessName] = useState(profile?.business_name ?? '');
  const [businessEmail, setBusinessEmail] = useState(profile?.business_email ?? '');
  const [businessPhone, setBusinessPhone] = useState(profile?.business_phone ?? '');
  const [businessAddress, setBusinessAddress] = useState(profile?.business_address ?? '');
  const [defaultNotes, setDefaultNotes] = useState(profile?.default_notes ?? '');
  const [defaultTerms, setDefaultTerms] = useState(profile?.default_terms ?? '');

  const currentPlan = subscription?.plan ?? 'free';
  const isActiveSub = subscription?.status === 'active' || subscription?.status === 'trialing';

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: businessName,
        business_email: businessEmail,
        business_phone: businessPhone,
        business_address: businessAddress,
        default_notes: defaultNotes,
        default_terms: defaultTerms,
      }),
    });

    setSaving(false);

    if (res.ok) {
      toast({ title: 'Settings saved', variant: 'success' });
    } else {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  const handleConnectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/connect', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error', description: 'Could not start Stripe onboarding.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error connecting to Stripe', variant: 'destructive' });
    } finally {
      setConnectingStripe(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    setUpgradingPlan(plan);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error', description: 'Could not start checkout.', variant: 'destructive' });
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
      const data = await res.json();
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
    <div>
      <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Manage your account, branding, and integrations.
      </p>

      <div className="mt-8 space-y-6">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Your business details shown on invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Business Name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business LLC"
                />
                <Input
                  label="Business Email"
                  type="email"
                  value={businessEmail}
                  onChange={(e) => setBusinessEmail(e.target.value)}
                  placeholder="billing@yourbusiness.com"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Phone"
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
                <Input
                  label="Address"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Invoice Defaults */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Defaults</CardTitle>
            <CardDescription>Default notes and terms for new invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Default Notes"
              value={defaultNotes}
              onChange={(e) => setDefaultNotes(e.target.value)}
              placeholder="Thank you for your business!"
              rows={3}
            />
            <Textarea
              label="Default Terms"
              value={defaultTerms}
              onChange={(e) => setDefaultTerms(e.target.value)}
              placeholder="Payment is due within 30 days of invoice date."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Subscription & Billing */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription & Billing</CardTitle>
            <CardDescription>Manage your InvoiceAI subscription plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current plan */}
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {PLAN_NAMES[currentPlan] ?? 'Free'} Plan
                  </p>
                  {subscription?.status && (
                    <Badge
                      variant={
                        subscription.status === 'active' ? 'paid'
                          : subscription.status === 'trialing' ? 'viewed'
                          : subscription.status === 'past_due' ? 'overdue'
                          : 'sent'
                      }
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {PLAN_LIMITS[currentPlan] === 999999
                    ? 'Unlimited invoices per month'
                    : `Up to ${PLAN_LIMITS[currentPlan]} invoices per month`}
                </p>
                {subscription?.current_period_end && isActiveSub && (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Renews {new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                )}
              </div>
              {isActiveSub && currentPlan !== 'free' && (
                <Button variant="outline" onClick={handleManageBilling} disabled={openingPortal}>
                  {openingPortal ? 'Opening...' : 'Manage Billing'}
                </Button>
              )}
            </div>

            {/* Upgrade options — show if on free or no active subscription */}
            {(!isActiveSub || currentPlan === 'free') && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { key: 'starter', label: 'Starter', price: '$9/mo', invoices: '20 invoices/mo', highlight: false },
                  { key: 'pro', label: 'Pro', price: '$29/mo', invoices: '100 invoices/mo', highlight: true },
                  { key: 'business', label: 'Business', price: '$79/mo', invoices: 'Unlimited invoices', highlight: false },
                ].map((tier) => (
                  <div
                    key={tier.key}
                    className={`relative rounded-lg border p-4 ${tier.highlight ? 'border-green-500 bg-green-50' : 'border-[var(--border)]'}`}
                  >
                    {tier.highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
                        Popular
                      </span>
                    )}
                    <p className="font-semibold text-[var(--foreground)]">{tier.label}</p>
                    <p className="mt-1 text-xl font-bold text-[var(--foreground)]">{tier.price}</p>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">{tier.invoices}</p>
                    <Button
                      className="mt-3 w-full"
                      size="sm"
                      variant={tier.highlight ? 'default' : 'outline'}
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

        {/* Stripe Connect Integration */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
            <CardDescription>Connect Stripe to accept online payments from clients.</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.stripe_connect_onboarded ? (
              <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                <div>
                  <p className="font-medium text-green-700">Stripe Connected</p>
                  <p className="text-sm text-green-600">
                    You can accept payments from your clients.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
                <div>
                  <p className="font-medium">Connect Stripe</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Accept credit card payments directly from your invoices.
                  </p>
                </div>
                <Button onClick={handleConnectStripe} disabled={connectingStripe}>
                  {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
