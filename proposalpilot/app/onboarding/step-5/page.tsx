'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'stripe', label: 'Stripe', desc: 'Accept payments on proposals', emoji: '💳', popular: true },
  { id: 'slack', label: 'Slack', desc: 'Get notified when proposals are viewed', emoji: '💬', popular: true },
  { id: 'hubspot', label: 'HubSpot', desc: 'Sync with your CRM', emoji: '🔶', popular: false },
  { id: 'zapier', label: 'Zapier', desc: 'Connect any tool', emoji: '⚡', popular: false },
  { id: 'gmail', label: 'Gmail', desc: 'Track email opens', emoji: '📧', popular: false },
  { id: 'calendar', label: 'Google Calendar', desc: 'Schedule follow-up meetings', emoji: '📅', popular: false },
];

export default function Step5Page() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  return (
    <Card>
      <CardHeader>
        <div className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 mb-2">
          Step 5 of 5 — Final step!
        </div>
        <CardTitle>Connect your tools</CardTitle>
        <CardDescription>Integrate ProposalPilot with your existing workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-3">
          {INTEGRATIONS.map(intg => {
            const active = selected.includes(intg.id);
            return (
              <button key={intg.id} onClick={() => toggle(intg.id)}
                className={`flex items-center justify-between rounded-xl border-2 p-3 text-left transition-all ${active ? 'border-brand-500 bg-brand-50' : 'border-[var(--border)] hover:border-brand-300'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{intg.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--foreground)]">{intg.label}</span>
                      {intg.popular && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Popular</span>}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{intg.desc}</p>
                  </div>
                </div>
                {active && <CheckCircle2 size={18} className="text-brand-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step-4')}>Back</Button>
          <Button className="flex-1" onClick={() => router.push('/onboarding/complete')}>
            {selected.length > 0 ? `Connect ${selected.length} tool${selected.length > 1 ? 's' : ''} & Finish` : 'Skip & Finish'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
