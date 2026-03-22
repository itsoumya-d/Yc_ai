'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const EMERGENCY_VETS = [
  { id: 'find', label: 'Find vets near me', emoji: '📍' },
  { id: 'add', label: "I'll add my vet manually", emoji: '✏️' },
  { id: 'skip', label: 'Skip for now', emoji: '⏭️' },
];

export default function Step5Page() {
  const router = useRouter();
  const [emergencyOption, setEmergencyOption] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [shareWithFamily, setShareWithFamily] = useState(true);

  const canFinish = emergencyOption !== '';

  const handleFinish = () => {
    router.push('/onboarding/complete');
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="text-3xl mb-2">🏥</div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">Emergency contacts</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Be prepared for any situation</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Emergency vet contact</label>
          <div className="space-y-2">
            {EMERGENCY_VETS.map(opt => (
              <button key={opt.id} onClick={() => setEmergencyOption(opt.id)}
                className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${emergencyOption === opt.id ? 'border-brand-500 bg-brand-50' : 'border-[var(--border)]'}`}>
                <span className="text-xl">{opt.emoji}</span>
                <span className={`text-sm font-medium ${emergencyOption === opt.id ? 'text-brand-700' : 'text-[var(--foreground)]'}`}>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {emergencyOption === 'add' && (
          <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">Vet clinic name</label>
              <input value={vetName} onChange={e => setVetName(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-brand-500"
                placeholder="e.g. Happy Paws Animal Hospital" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">Phone number</label>
              <input value={vetPhone} onChange={e => setVetPhone(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm outline-none focus:border-brand-500"
                placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Share with family members</p>
            <p className="text-xs text-[var(--muted-foreground)]">Allow household to see emergency contacts</p>
          </div>
          <button onClick={() => setShareWithFamily(!shareWithFamily)}
            className={`relative w-11 h-6 rounded-full transition-colors ${shareWithFamily ? 'bg-brand-600' : 'bg-[var(--border)]'}`}>
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${shareWithFamily ? 'left-[22px]' : 'left-[2px]'}`} />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => router.push('/onboarding/step-4')}
            className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
            Back
          </button>
          <button onClick={handleFinish} disabled={!canFinish}
            className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
            Complete Setup 🐾
          </button>
        </div>
      </div>
    </div>
  );
}
