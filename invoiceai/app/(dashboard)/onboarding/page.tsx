'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClientAction } from '@/lib/actions/clients';

const STEPS = [
  { title: 'Business Info', description: 'Tell us about your business' },
  { title: 'Invoice Defaults', description: 'Set your default invoice settings' },
  { title: 'First Client', description: 'Add your first client' },
  { title: 'Payments', description: 'Connect Stripe to accept payments' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);

  // Handle Stripe Connect return
  useEffect(() => {
    if (searchParams.get('stripe') === 'complete') {
      setStep(3);
      setStripeConnected(true);
      toast({ title: 'Stripe connected successfully!', variant: 'success' });
    }
  }, [searchParams, toast]);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  // Step 2: Invoice Defaults
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(30);
  const [brandColor, setBrandColor] = useState('#059669');
  const [defaultNotes, setDefaultNotes] = useState('Thank you for your business!');
  const [defaultTerms, setDefaultTerms] = useState('Payment is due within 30 days of invoice date.');

  // Step 3: First Client
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');

  // Step 4: Stripe
  const [connectingStripe, setConnectingStripe] = useState(false);

  const saveBusinessInfo = async () => {
    setSaving(true);
    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_name: businessName,
        business_email: businessEmail,
        business_phone: businessPhone,
        business_address: businessAddress,
      }),
    });
    setSaving(false);

    if (res.ok) {
      setStep(1);
    } else {
      toast({ title: 'Error saving business info', variant: 'destructive' });
    }
  };

  const saveDefaults = async () => {
    setSaving(true);
    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        default_currency: defaultCurrency,
        default_payment_terms: defaultPaymentTerms,
        brand_color: brandColor,
        default_notes: defaultNotes,
        default_terms: defaultTerms,
      }),
    });
    setSaving(false);

    if (res.ok) {
      setStep(2);
    } else {
      toast({ title: 'Error saving defaults', variant: 'destructive' });
    }
  };

  const saveClient = async () => {
    if (!clientName.trim() || !clientEmail.trim()) {
      toast({ title: 'Name and email are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const result = await createClientAction({
      name: clientName.trim(),
      email: clientEmail.trim(),
      company: clientCompany.trim() || undefined,
    });
    setSaving(false);

    if (result.success) {
      toast({ title: 'Client added!', variant: 'success' });
      setStep(3);
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const connectStripe = async () => {
    setConnectingStripe(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnTo: 'onboarding' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'Error starting Stripe onboarding', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error connecting to Stripe', variant: 'destructive' });
    } finally {
      setConnectingStripe(false);
    }
  };

  const completeOnboarding = async () => {
    setSaving(true);
    await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ onboarding_completed: true }),
    });
    setSaving(false);
    toast({ title: 'Welcome to InvoiceAI!', variant: 'success' });
    router.push('/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-[var(--foreground)]">
          Welcome to InvoiceAI
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Let&apos;s get you set up in just a few steps.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    i < step
                      ? 'bg-brand-600 text-white'
                      : i === step
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}
                >
                  {i < step ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="mt-1 text-xs text-[var(--muted-foreground)]">{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    i < step ? 'bg-brand-600' : 'bg-[var(--muted)]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Your business details will appear on all invoices you send.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business Name *"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your Business LLC"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Business Email"
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                placeholder="billing@yourbusiness.com"
              />
              <Input
                label="Phone"
                type="tel"
                value={businessPhone}
                onChange={(e) => setBusinessPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Input
              label="Address"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              placeholder="123 Main St, City, State ZIP"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={saveBusinessInfo} disabled={saving || !businessName.trim()}>
                {saving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Defaults</CardTitle>
            <CardDescription>
              These will be pre-filled on every new invoice. You can always change them later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Default Currency
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                  <option value="INR">INR - Indian Rupee</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                  Payment Terms (days)
                </label>
                <select
                  value={defaultPaymentTerms}
                  onChange={(e) => setDefaultPaymentTerms(Number(e.target.value))}
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)]"
                >
                  <option value={7}>Net 7</option>
                  <option value={14}>Net 14</option>
                  <option value={15}>Net 15</option>
                  <option value={30}>Net 30</option>
                  <option value={45}>Net 45</option>
                  <option value={60}>Net 60</option>
                  <option value={90}>Net 90</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                Brand Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border)]"
                />
                <span className="text-sm text-[var(--muted-foreground)]">
                  Used in invoice templates and the payment portal
                </span>
              </div>
            </div>
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
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={saveDefaults} disabled={saving}>
                {saving ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Your First Client</CardTitle>
            <CardDescription>
              Add a client so you can start sending invoices right away.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Client Name *"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="John Smith"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email *"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <Input
                label="Company"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Skip
                </Button>
                <Button onClick={saveClient} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Client & Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Accept Payments</CardTitle>
            <CardDescription>
              Connect Stripe to let clients pay invoices online with credit card. You can always set this up later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[var(--border)] p-6 text-center">
              {stripeConnected ? (
                <>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="mt-3 font-medium text-[var(--foreground)]">
                    Stripe Connected
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    You&apos;re all set to accept online payments.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
                    <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                    </svg>
                  </div>
                  <h3 className="mt-3 font-medium text-[var(--foreground)]">
                    Connect Stripe
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Accept credit card payments directly from your invoices.
                  </p>
                  <Button onClick={connectStripe} disabled={connectingStripe} className="mt-4">
                    {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                  </Button>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={completeOnboarding} disabled={saving}>
                {saving ? 'Finishing...' : 'Finish Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
