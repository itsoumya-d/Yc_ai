'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const proposalStyles = [
  { id: 'formal', label: 'Formal & Corporate', description: 'Professional tone with structured sections and executive summary.' },
  { id: 'consultative', label: 'Consultative', description: 'Problem-focused, emphasizes understanding of client needs.' },
  { id: 'creative', label: 'Creative & Bold', description: 'Visually engaging with a strong brand voice and story.' },
  { id: 'concise', label: 'Short & Concise', description: 'Minimal fluff — key info only, fast to read and decide.' },
];

export default function OnboardingStep2() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [style, setStyle] = useState<string | null>(null);

  function handleContinue() {
    if (!companyName.trim()) return;
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboarding_company', JSON.stringify({ companyName, website, industry, style }));
    }
    router.push('/onboarding/step-3');
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Step 2 of 3</div>
        <CardTitle className="text-2xl">Tell us about your company</CardTitle>
        <CardDescription>This helps us personalize your proposals and branding.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          <Input
            id="companyName"
            label="Company Name"
            placeholder="Acme Agency"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
          />
          <Input
            id="website"
            label="Website (optional)"
            type="url"
            placeholder="https://yourcompany.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Input
            id="industry"
            label="Industry (optional)"
            placeholder="e.g. Marketing, Software, Consulting"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">Preferred Proposal Style</p>
          <div className="space-y-2">
            {proposalStyles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={cn(
                  'w-full flex items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-150',
                  style === s.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]'
                )}
              >
                <div className={cn('mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center', style === s.id ? 'border-brand-600 bg-brand-600' : 'border-[var(--muted-foreground)]')}>
                  {style === s.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className={cn('font-semibold text-sm', style === s.id ? 'text-brand-700' : 'text-[var(--foreground)]')}>{s.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step-1')}>
            Back
          </Button>
          <Button className="flex-1" disabled={!companyName.trim()} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
