'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const BRAND_COLORS = ['#6366F1', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];
const FONT_OPTIONS = ['Inter (Modern)', 'Playfair Display (Elegant)', 'Roboto (Professional)', 'Montserrat (Bold)'];

export default function Step4Page() {
  const router = useRouter();
  const [brandColor, setBrandColor] = useState('#6366F1');
  const [font, setFont] = useState('Inter (Modern)');
  const [logoOption, setLogoOption] = useState<'upload' | 'initials' | 'none'>('initials');
  const [initials, setInitials] = useState('PP');

  return (
    <Card>
      <CardHeader>
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 mb-2">
          Step 4 of 5
        </div>
        <CardTitle>Proposal branding</CardTitle>
        <CardDescription>Customize how your proposals look to clients</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Brand color</label>
          <div className="flex flex-wrap gap-2">
            {BRAND_COLORS.map(c => (
              <button key={c} onClick={() => setBrandColor(c)}
                className="h-9 w-9 rounded-full transition-transform hover:scale-110"
                style={{ backgroundColor: c, outline: brandColor === c ? `3px solid ${c}` : 'none', outlineOffset: '2px' }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Font style</label>
          <div className="grid grid-cols-2 gap-2">
            {FONT_OPTIONS.map(f => (
              <button key={f} onClick={() => setFont(f)}
                className={`rounded-xl border-2 px-4 py-2.5 text-sm transition-all text-left ${font === f ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">Logo</label>
          <div className="flex gap-2 mb-3">
            {[
              { id: 'initials' as const, label: 'Use initials' },
              { id: 'upload' as const, label: 'Upload logo' },
              { id: 'none' as const, label: 'No logo' },
            ].map(opt => (
              <button key={opt.id} onClick={() => setLogoOption(opt.id)}
                className={`flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-all ${logoOption === opt.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}>
                {opt.label}
              </button>
            ))}
          </div>
          {logoOption === 'initials' && (
            <input value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 3))} maxLength={3}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="PP" />
          )}
          {logoOption === 'upload' && (
            <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted-foreground)]">
              Click to upload PNG or SVG (max 2MB)
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step-3')}>Back</Button>
          <Button className="flex-1" onClick={() => router.push('/onboarding/step-5')}>Continue</Button>
        </div>
      </CardContent>
    </Card>
  );
}
