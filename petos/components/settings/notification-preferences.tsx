'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { saveNotificationPrefs, type NotificationPrefs } from '@/lib/actions/settings';

const PREFS_CONFIG = [
  { id: 'appointment_reminders' as const, label: 'Appointment Reminders', description: 'Get notified 24 hours before upcoming vet appointments' },
  { id: 'medication_reminders' as const, label: 'Medication Reminders', description: 'Alerts when medications need to be refilled (7 days before)' },
  { id: 'health_alerts' as const, label: 'Health Alerts', description: 'Important health-related notifications and AI symptom alerts' },
  { id: 'vaccine_due' as const, label: 'Vaccine Due Alerts', description: 'Reminders when vaccinations are coming due or overdue' },
  { id: 'weekly_summary' as const, label: 'Weekly Summary', description: "A weekly recap of your pets' health activities and upcoming events" },
];

interface NotificationPreferencesProps {
  initialPrefs?: NotificationPrefs;
}

export function NotificationPreferences({ initialPrefs }: NotificationPreferencesProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [prefs, setPrefs] = useState<NotificationPrefs>(
    initialPrefs ?? {
      appointment_reminders: true,
      medication_reminders: true,
      health_alerts: true,
      vaccine_due: true,
      weekly_summary: false,
    }
  );

  function handleToggle(key: keyof NotificationPrefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    startTransition(async () => {
      const result = await saveNotificationPrefs(updated);
      if (result.error) {
        setPrefs(prefs);
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Preferences saved', variant: 'success' });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what notifications you receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PREFS_CONFIG.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{pref.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[pref.id]}
                disabled={isPending}
                onClick={() => handleToggle(pref.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 ${
                  prefs[pref.id] ? 'bg-brand-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    prefs[pref.id] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
