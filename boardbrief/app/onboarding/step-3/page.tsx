'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingStep3Page() {
  const router = useRouter();
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = sessionStorage.getItem('onboarding_role') ?? '';
        const companyName = sessionStorage.getItem('onboarding_company') ?? '';
        await supabase.from('profiles').upsert({
          id: user.id,
          role,
          company_name: companyName,
          onboarding_completed_at: new Date().toISOString(),
        });
      }
    } catch {
      // continue even if update fails
    }
    router.push('/onboarding/step-4');
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-navy-100">
        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: '100%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-navy-400 mb-1">Step 3 of 3</p>
        <Calendar className="h-8 w-8 text-gold-500 mb-3" />
        <h1 className="font-heading text-2xl font-bold text-navy-900 mb-1">Schedule your first meeting</h1>
        <p className="text-sm text-navy-500 mb-6">Set up your first board meeting or skip to explore the platform.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Meeting Title</label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="Q1 Board of Directors Meeting"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">Date</label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
            />
          </div>
          <div className="rounded-xl bg-navy-50 border border-navy-200 p-4 text-sm text-navy-700">
            <strong>Tip:</strong> You can also skip this step and create meetings from the dashboard after setup.
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/onboarding/step-2')}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleComplete}
              className="text-sm text-navy-500 hover:text-navy-700 transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400 disabled:opacity-40"
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
