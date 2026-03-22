'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REMINDER_TYPES = [
  { id: 'feeding', label: 'Feeding schedule', emoji: '🍽️' },
  { id: 'medication', label: 'Medication reminders', emoji: '💊' },
  { id: 'vet', label: 'Vet appointments', emoji: '🏥' },
  { id: 'grooming', label: 'Grooming sessions', emoji: '✂️' },
  { id: 'walks', label: 'Walk reminders', emoji: '🦮' },
  { id: 'training', label: 'Training sessions', emoji: '🎓' },
];

const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'As needed'];

export default function Step4Page() {
  const router = useRouter();
  const [selectedReminders, setSelectedReminders] = useState<string[]>(['feeding', 'vet']);
  const [defaultFrequency, setDefaultFrequency] = useState('Daily');
  const [enablePushNotifs, setEnablePushNotifs] = useState(true);
  const [enableEmailDigest, setEnableEmailDigest] = useState(false);

  const toggleReminder = (id: string) => {
    setSelectedReminders(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="text-3xl mb-2">🔔</div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Set up reminders</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Never miss an important care moment</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Reminder types</label>
          <div className="grid grid-cols-2 gap-2">
            {REMINDER_TYPES.map(r => {
              const active = selectedReminders.includes(r.id);
              return (
                <button key={r.id} onClick={() => toggleReminder(r.id)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all ${active ? 'border-brand-500 bg-brand-50' : 'border-[var(--border)]'}`}>
                  <span className="text-lg">{r.emoji}</span>
                  <span className={`text-sm font-medium ${active ? 'text-brand-700' : 'text-[var(--muted-foreground)]'}`}>{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Default frequency</label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map(f => (
              <button key={f} onClick={() => setDefaultFrequency(f)}
                className={`rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${defaultFrequency === f ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Push notifications', sub: 'Get alerts on your device', state: enablePushNotifs, toggle: () => setEnablePushNotifs(!enablePushNotifs) },
            { label: 'Weekly email digest', sub: 'Summary of upcoming care tasks', state: enableEmailDigest, toggle: () => setEnableEmailDigest(!enableEmailDigest) },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.sub}</p>
              </div>
              <button onClick={item.toggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${item.state ? 'bg-brand-600' : 'bg-[var(--border)]'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${item.state ? 'left-[22px]' : 'left-[2px]'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.push('/onboarding/step-3')}
            className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
            Back
          </button>
          <button onClick={() => router.push('/onboarding/step-5')}
            className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
