'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, ChevronRight } from 'lucide-react';

const ROLES = [
  { id: 'board_member', label: 'Board Member', description: 'Participate in board meetings and vote on resolutions' },
  { id: 'company_secretary', label: 'Company Secretary', description: 'Manage governance, minutes, and compliance' },
  { id: 'ceo', label: 'CEO / Executive Director', description: 'Oversee operations and report to the board' },
  { id: 'cfo', label: 'CFO / Finance Director', description: 'Present financial reports and manage board pack financials' },
];

export default function OnboardingStep1Page() {
  const router = useRouter();
  const [role, setRole] = useState('');

  function handleContinue() {
    if (!role) return;
    sessionStorage.setItem('onboarding_role', role);
    router.push('/onboarding/step-2');
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-navy-100">
        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: '33%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-1">Step 1 of 3</p>
        <Briefcase className="h-8 w-8 text-gold-500 mb-3" />
        <h1 className="font-heading text-2xl font-bold text-navy-900 mb-1">What is your role?</h1>
        <p className="text-sm text-navy-500 mb-6">This helps us tailor your BoardBrief experience.</p>
        <div className="space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                role === r.id
                  ? 'border-gold-500 bg-gold-50'
                  : 'border-gray-200 hover:border-navy-300'
              }`}
            >
              <div className="font-semibold text-navy-900">{r.label}</div>
              <div className="text-xs text-navy-500 mt-0.5">{r.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!role}
            className="flex items-center gap-1.5 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 disabled:opacity-40"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
