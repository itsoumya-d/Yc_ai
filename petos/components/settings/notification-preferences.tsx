'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function NotificationPreferences() {
  const prefs = [
    { id: 'appointment_reminders', label: 'Appointment Reminders', description: 'Get notified about upcoming vet appointments' },
    { id: 'medication_reminders', label: 'Medication Reminders', description: 'Reminders for medication refills and schedules' },
    { id: 'health_alerts', label: 'Health Alerts', description: 'Important health-related notifications' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what notifications you receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prefs.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{pref.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{pref.description}</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-[var(--input)] text-brand-600 focus:ring-brand-500"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
