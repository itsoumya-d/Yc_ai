'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { useTranslations } from 'next-intl';
import type { User } from '@/types/database';

interface SettingsPageProps {
  profile: User | null;
}

type Tab = 'general' | 'branding' | 'billing' | 'email' | 'notifications';

const tabs: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'branding', label: 'Branding' },
  { id: 'billing', label: 'Billing' },
  { id: 'email', label: 'Email Templates' },
  { id: 'notifications', label: 'Notifications' },
];

const PLAN_DETAILS = {
  free: { name: 'Free', price: '$0/mo', invoiceLimit: 5, features: ['5 invoices/month', 'AI drafting (3/mo)', 'Basic templates'] },
  pro: { name: 'Pro', price: '$12.99/mo', invoiceLimit: null, features: ['Unlimited invoices', 'Unlimited AI drafting', 'Payment reminders', 'All templates'] },
  business: { name: 'Business', price: '$24.99/mo', invoiceLimit: null, features: ['Everything in Pro', 'Cash flow forecasting', 'Team features (5 members)', 'Priority support'] },
};

export function SettingsPage({ profile }: SettingsPageProps) {
  const { toast } = useToast();
  const t = useTranslations('settings');
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  // General tab state
  const [businessName, setBusinessName] = useState(profile?.business_name ?? '');
  const [businessEmail, setBusinessEmail] = useState(profile?.business_email ?? '');
  const [businessPhone, setBusinessPhone] = useState(profile?.business_phone ?? '');
  const [businessAddress, setBusinessAddress] = useState(profile?.business_address ?? '');
  const [defaultNotes, setDefaultNotes] = useState(profile?.default_notes ?? '');
  const [defaultTerms, setDefaultTerms] = useState(profile?.default_terms ?? '');
  const [invoiceNumberFormat, setInvoiceNumberFormat] = useState(profile?.invoice_number_format ?? 'INV-{number}');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(String(profile?.default_payment_terms ?? 30));
  const [defaultCurrency, setDefaultCurrency] = useState(profile?.default_currency ?? 'USD');

  // Branding tab state
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url ?? '');
  const [brandColor, setBrandColor] = useState(profile?.brand_color ?? '#16a34a');
  const [defaultTemplate, setDefaultTemplate] = useState(profile?.default_template ?? 'classic');

  // Notification preferences (stored in metadata)
  const notifMeta = (profile?.metadata?.notifications as Record<string, boolean>) ?? {};
  const [notifInvoicePaid, setNotifInvoicePaid] = useState(notifMeta.invoice_paid ?? true);
  const [notifReminderSent, setNotifReminderSent] = useState(notifMeta.reminder_sent ?? true);
  const [notifWeeklySummary, setNotifWeeklySummary] = useState(notifMeta.weekly_summary ?? false);
  const [notifOverdue, setNotifOverdue] = useState(notifMeta.overdue_alerts ?? true);

  const handleSaveGeneral = async (e: React.FormEvent) => {
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
        invoice_number_format: invoiceNumberFormat,
        default_payment_terms: Number(defaultPaymentTerms),
        default_currency: defaultCurrency,
      }),
    });

    setSaving(false);
    if (res.ok) {
      toast({ title: 'Settings saved', variant: 'success' });
    } else {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        logo_url: logoUrl || null,
        brand_color: brandColor,
        default_template: defaultTemplate,
      }),
    });

    setSaving(false);
    if (res.ok) {
      toast({ title: 'Branding saved', variant: 'success' });
    } else {
      toast({ title: 'Error saving branding', variant: 'destructive' });
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);

    const res = await fetch('/api/settings/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metadata: {
          ...(profile?.metadata ?? {}),
          notifications: {
            invoice_paid: notifInvoicePaid,
            reminder_sent: notifReminderSent,
            weekly_summary: notifWeeklySummary,
            overdue_alerts: notifOverdue,
          },
        },
      }),
    });

    setSaving(false);
    if (res.ok) {
      toast({ title: 'Notification preferences saved', variant: 'success' });
    } else {
      toast({ title: 'Error saving preferences', variant: 'destructive' });
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

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">{t('title')}</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {t('description')}
      </p>

      {/* Tab Navigation */}
      <div className="mt-6 flex gap-1 overflow-x-auto rounded-lg bg-[var(--muted)] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {/* ── GENERAL TAB ── */}
        {activeTab === 'general' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Your business details shown on invoices.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-4">
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
                    {saving ? 'Saving...' : 'Save Business Info'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invoice Defaults</CardTitle>
                <CardDescription>Default values applied to every new invoice.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <Input
                        label="Invoice Number Format"
                        value={invoiceNumberFormat}
                        onChange={(e) => setInvoiceNumberFormat(e.target.value)}
                        placeholder="INV-{number}"
                      />
                      <p className="mt-1 text-xs text-[var(--muted-foreground)]">Use {'{number}'} as placeholder</p>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                        Default Payment Terms
                      </label>
                      <select
                        value={defaultPaymentTerms}
                        onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="0">Due on receipt</option>
                        <option value="7">Net 7</option>
                        <option value="14">Net 14</option>
                        <option value="30">Net 30</option>
                        <option value="45">Net 45</option>
                        <option value="60">Net 60</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                        Default Currency
                      </label>
                      <select
                        value={defaultCurrency}
                        onChange={(e) => setDefaultCurrency(e.target.value)}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="CAD">CAD — Canadian Dollar</option>
                        <option value="AUD">AUD — Australian Dollar</option>
                        <option value="JPY">JPY — Japanese Yen</option>
                      </select>
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
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Defaults'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── BRANDING TAB ── */}
        {activeTab === 'branding' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Visual Identity</CardTitle>
                <CardDescription>Customize how your invoices look to clients.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveBranding} className="space-y-6">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Logo URL
                    </label>
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      type="url"
                    />
                    {logoUrl && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={logoUrl}
                          alt="Logo preview"
                          className="h-12 w-auto rounded border border-[var(--border)] object-contain p-1"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <p className="text-xs text-[var(--muted-foreground)]">Logo preview</p>
                      </div>
                    )}
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
                        className="h-10 w-16 cursor-pointer rounded-lg border border-[var(--border)]"
                      />
                      <Input
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        placeholder="#16a34a"
                        className="w-36"
                      />
                    </div>
                    <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                      Used as accent color on invoices and the client payment portal.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
                      Default Invoice Template
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {(['classic', 'modern', 'minimal', 'bold', 'creative'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setDefaultTemplate(t)}
                          className={`rounded-lg border-2 p-3 text-center text-sm font-medium capitalize transition-colors ${
                            defaultTemplate === t
                              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Branding'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* ── BILLING TAB ── */}
        {activeTab === 'billing' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Manage your InvoiceAI subscription.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current plan badge */}
                  <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">Free Plan</p>
                      <p className="text-sm text-[var(--muted-foreground)]">5 invoices per month · $0/mo</p>
                    </div>
                  </div>

                  {/* Upgrade options */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {(['pro', 'business'] as const).map((plan) => {
                      const details = PLAN_DETAILS[plan];
                      return (
                        <div
                          key={plan}
                          className={`rounded-xl border-2 p-5 ${
                            plan === 'pro'
                              ? 'border-[var(--primary)]'
                              : 'border-[var(--border)]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-heading font-bold text-[var(--foreground)]">{details.name}</p>
                              <p className="font-amount text-2xl font-bold text-[var(--foreground)]">{details.price}</p>
                            </div>
                            {plan === 'pro' && (
                              <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                                Popular
                              </span>
                            )}
                          </div>
                          <ul className="mt-3 space-y-1.5">
                            {details.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                                <svg className="h-4 w-4 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button className="mt-4 w-full" variant={plan === 'pro' ? 'default' : 'outline'}>
                            Upgrade to {details.name}
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-[var(--muted-foreground)]">
                    Save 17% with annual billing &middot; Cancel anytime
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stripe payment integration */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Collection</CardTitle>
                <CardDescription>Connect Stripe to accept online payments from your clients.</CardDescription>
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
                        You can accept credit card and ACH payments from your clients.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4">
                    <div>
                      <p className="font-medium">Connect Stripe</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Accept credit cards and bank transfers directly from invoices.
                      </p>
                    </div>
                    <Button onClick={handleConnectStripe} disabled={connectingStripe}>
                      {connectingStripe ? 'Connecting...' : 'Connect Stripe'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── EMAIL TEMPLATES TAB ── */}
        {activeTab === 'email' && (
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Preview and customize the emails sent to your clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'Invoice Delivery',
                    description: 'Sent when you email an invoice to a client.',
                    preview: 'Hi {client_name},\n\nPlease find attached Invoice {invoice_number} for {amount}, due on {due_date}.\n\n{personal_message}\n\nBest regards,\n{business_name}',
                  },
                  {
                    title: 'Payment Reminder',
                    description: 'Sent as automated follow-up reminders.',
                    preview: 'Hi {client_name},\n\nThis is a friendly reminder that Invoice {invoice_number} for {amount} was due on {due_date}.\n\nPlease click below to pay.\n\nThank you,\n{business_name}',
                  },
                  {
                    title: 'Payment Receipt',
                    description: 'Sent automatically when a payment is received.',
                    preview: 'Hi {client_name},\n\nThank you! We received your payment of {amount} for Invoice {invoice_number}.\n\nA receipt is attached for your records.\n\n{business_name}',
                  },
                ].map((template) => (
                  <div key={template.title} className="rounded-lg border border-[var(--border)] p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{template.title}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">{template.description}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs">
                        Customize
                      </Button>
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--muted-foreground)]">
                      {template.preview}
                    </pre>
                  </div>
                ))}
                <p className="text-xs text-[var(--muted-foreground)]">
                  Template customization is available on the Pro plan. Variables like {'{client_name}'} are replaced automatically.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose which activity triggers an email notification to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    label: 'Invoice paid',
                    description: 'Get notified when a client pays an invoice.',
                    checked: notifInvoicePaid,
                    onChange: setNotifInvoicePaid,
                  },
                  {
                    label: 'Overdue alerts',
                    description: 'Get notified when an invoice becomes overdue.',
                    checked: notifOverdue,
                    onChange: setNotifOverdue,
                  },
                  {
                    label: 'Reminder sent',
                    description: 'Get notified when an automated reminder is delivered.',
                    checked: notifReminderSent,
                    onChange: setNotifReminderSent,
                  },
                  {
                    label: 'Weekly summary',
                    description: 'Receive a weekly report of outstanding invoices and revenue.',
                    checked: notifWeeklySummary,
                    onChange: setNotifWeeklySummary,
                  },
                ].map((pref) => (
                  <div
                    key={pref.label}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{pref.label}</p>
                      <p className="text-sm text-[var(--muted-foreground)]">{pref.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => pref.onChange(!pref.checked)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        pref.checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                      }`}
                      role="switch"
                      aria-checked={pref.checked}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          pref.checked ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <Button onClick={handleSaveNotifications} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
