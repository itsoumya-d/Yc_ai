'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Sparkles } from 'lucide-react';

const SUMMARY_STYLES = [
  { id: 'brief', label: 'Brief', desc: '1–2 paragraph executive summary' },
  { id: 'detailed', label: 'Detailed', desc: 'Full analysis with key points' },
  { id: 'bullets', label: 'Bullets', desc: 'Concise bullet-point format' },
  { id: 'narrative', label: 'Narrative', desc: 'Story-driven boardroom style' },
];

export default function OnboardingStep5Page() {
  const router = useRouter();
  const [summaryStyle, setSummaryStyle] = useState('brief');
  const [autoSummarise, setAutoSummarise] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleFinish() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    router.push('/onboarding/complete');
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-navy-100">
        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: '100%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600 mb-2">Step 5 of 5 — Almost live!</p>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">AI assistant setup</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">Tune how BoardBrief&apos;s AI works for you</p>

        <div className="space-y-6">
          {/* Summary style */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Preferred Summary Style</label>
            <div className="grid grid-cols-2 gap-2">
              {SUMMARY_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSummaryStyle(s.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    summaryStyle === s.id
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-[var(--border)] hover:border-gold-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${summaryStyle === s.id ? 'text-gold-800' : 'text-[var(--foreground)]'}`}>{s.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle: Auto-summarise */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Auto-summarise documents</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">AI instantly summarises uploaded board packs</p>
            </div>
            <button
              onClick={() => setAutoSummarise(!autoSummarise)}
              className={`relative w-11 h-6 rounded-full transition-colors ${autoSummarise ? 'bg-gold-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${autoSummarise ? 'left-[22px]' : 'left-[2px]'}`} />
            </button>
          </div>

          {/* Toggle: Email digest */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Weekly email digest</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Receive a weekly summary of upcoming meetings</p>
            </div>
            <button
              onClick={() => setEmailDigest(!emailDigest)}
              className={`relative w-11 h-6 rounded-full transition-colors ${emailDigest ? 'bg-gold-500' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${emailDigest ? 'left-[22px]' : 'left-[2px]'}`} />
            </button>
          </div>

          {/* Meeting reminder */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
              Meeting prep reminder: <span className="text-gold-700">{reminderDays} day{reminderDays !== 1 ? 's' : ''} before</span>
            </label>
            <input
              type="range"
              min={1}
              max={7}
              value={reminderDays}
              onChange={e => setReminderDays(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>1 day</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/onboarding/step-4')}
              className="flex items-center gap-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <Sparkles size={16} />
              {loading ? 'Setting up…' : 'Go to BoardBrief'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
