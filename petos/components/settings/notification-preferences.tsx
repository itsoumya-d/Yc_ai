'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bell, BellOff, Loader2 } from 'lucide-react';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function NotificationPreferences() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [requesting, setRequesting] = useState(false);
  const [prefs, setPrefs] = useState({
    appointment_reminders: true,
    medication_reminders: true,
    health_alerts: true,
  });

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // Load saved preferences
    const saved = localStorage.getItem('notification-prefs');
    if (saved) {
      try { setPrefs(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  async function requestPermission() {
    if (!('Notification' in window)) return;
    setRequesting(true);

    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);

      if (result === 'granted') {
        // Show a test notification
        const registration = await navigator.serviceWorker?.ready;
        if (registration) {
          registration.showNotification('PetOS Notifications Enabled', {
            body: 'You\'ll now receive reminders for appointments, medications, and health alerts.',
            icon: '/icons/icon-192.svg',
            tag: 'welcome',
          });
        }
      }
    } catch (err) {
      console.error('Notification permission error:', err);
    }

    setRequesting(false);
  }

  function togglePref(key: keyof typeof prefs) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    localStorage.setItem('notification-prefs', JSON.stringify(updated));
  }

  const prefItems = [
    { id: 'appointment_reminders' as const, label: 'Appointment Reminders', description: 'Get notified about upcoming vet appointments' },
    { id: 'medication_reminders' as const, label: 'Medication Reminders', description: 'Reminders for medication refills and schedules' },
    { id: 'health_alerts' as const, label: 'Health Alerts', description: 'Important health-related notifications' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what notifications you receive.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {/* Permission status */}
          {permission === 'unsupported' && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <BellOff className="w-4 h-4 flex-shrink-0" />
              <span>Push notifications are not supported in this browser.</span>
            </div>
          )}

          {permission === 'denied' && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <BellOff className="w-4 h-4 flex-shrink-0" />
              <span>Notifications are blocked. Please enable them in your browser settings.</span>
            </div>
          )}

          {permission === 'default' && (
            <div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Enable push notifications to stay updated.</span>
              </div>
              <Button size="sm" onClick={requestPermission} disabled={requesting}>
                {requesting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Bell className="w-4 h-4 mr-1" />}
                {requesting ? 'Requesting...' : 'Enable'}
              </Button>
            </div>
          )}

          {permission === 'granted' && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <Bell className="w-4 h-4 flex-shrink-0" />
              <span>Push notifications are enabled.</span>
            </div>
          )}

          {/* Notification type toggles */}
          {prefItems.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{pref.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{pref.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[pref.id]}
                onClick={() => togglePref(pref.id)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                  prefs[pref.id] ? 'bg-[var(--color-brand-500)]' : 'bg-[var(--muted)]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
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
