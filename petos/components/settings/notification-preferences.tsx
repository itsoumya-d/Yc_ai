'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { getNotificationPreferences, updateNotificationPreferences } from '@/lib/actions/notifications';
import type { NotificationPreferences as NotifPrefs } from '@/types/database';

const prefItems = [
  { key: 'notify_appointments' as const, label: 'Appointment Reminders', description: 'Get notified about upcoming vet appointments' },
  { key: 'notify_medications' as const, label: 'Medication Reminders', description: 'Reminders for medication refills and schedules' },
  { key: 'notify_health_alerts' as const, label: 'Health Alerts', description: 'Important health-related notifications' },
];

export function NotificationPreferences() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotifPrefs>({
    notify_appointments: true,
    notify_medications: true,
    notify_health_alerts: true,
  });
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const result = await getNotificationPreferences();
      if (result.data) {
        setPrefs(result.data);
      }
      setLoaded(true);
    }
    load();
  }, []);

  function handleToggle(key: keyof NotifPrefs) {
    const newValue = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: newValue }));

    startTransition(async () => {
      const result = await updateNotificationPreferences({ [key]: newValue });
      if (result.error) {
        // Revert on error
        setPrefs((prev) => ({ ...prev, [key]: !newValue }));
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
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
          {prefItems.map((pref) => (
            <div key={pref.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{pref.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{pref.description}</p>
              </div>
              <input
                type="checkbox"
                checked={prefs[pref.key]}
                disabled={!loaded || isPending}
                onChange={() => handleToggle(pref.key)}
                className="h-4 w-4 rounded border-[var(--input)] text-brand-600 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
