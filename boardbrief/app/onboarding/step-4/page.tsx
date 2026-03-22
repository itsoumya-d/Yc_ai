'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ArrowRight } from 'lucide-react';

const MEETING_FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As needed'];
const COMMITTEES = ['Audit', 'Compensation', 'Nominations', 'Risk', 'Strategy', 'ESG'];
const DOCUMENT_FORMATS = [
  { id: 'pdf', label: 'PDF', desc: 'Standard PDF board packs' },
  { id: 'slides', label: 'Slides', desc: 'PowerPoint / Google Slides' },
  { id: 'word', label: 'Word', desc: 'Word documents & memos' },
  { id: 'mixed', label: 'Mixed', desc: 'Multiple formats combined' },
];

export default function OnboardingStep4Page() {
  const router = useRouter();
  const [frequency, setFrequency] = useState('Monthly');
  const [committees, setCommittees] = useState<string[]>([]);
  const [docFormat, setDocFormat] = useState('pdf');
  const [loading, setLoading] = useState(false);

  function toggleCommittee(c: string) {
    setCommittees(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function handleNext() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    router.push('/onboarding/step-5');
  }

  return (
    <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-navy-100">
        <div className="h-full bg-gold-500 transition-all duration-500" style={{ width: '80%' }} />
      </div>
      <div className="p-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-gold-600 mb-2">Step 4 of 5</p>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">Board preferences</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">Configure how your board operates</p>

        <div className="space-y-6">
          {/* Meeting frequency */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Meeting Frequency</label>
            <div className="flex flex-wrap gap-2">
              {MEETING_FREQUENCIES.map(f => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    frequency === f
                      ? 'border-navy-800 bg-navy-800 text-white'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-navy-400'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Committees */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Committees (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {COMMITTEES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCommittee(c)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    committees.includes(c)
                      ? 'border-gold-500 bg-gold-50 text-gold-800'
                      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-gold-400'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Document formats */}
          <div>
            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Primary Document Format</label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_FORMATS.map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setDocFormat(fmt.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    docFormat === fmt.id
                      ? 'border-navy-800 bg-navy-50'
                      : 'border-[var(--border)] hover:border-navy-300'
                  }`}
                >
                  <p className={`text-sm font-semibold ${docFormat === fmt.id ? 'text-navy-800' : 'text-[var(--foreground)]'}`}>{fmt.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{fmt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/onboarding/step-3')}
              className="flex items-center gap-1 px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-navy-800 hover:bg-navy-900 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {loading ? 'Saving…' : 'Continue'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
