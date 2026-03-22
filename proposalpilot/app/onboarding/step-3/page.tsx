'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileUp, LayoutTemplate, ArrowRight } from 'lucide-react';

const templateCategories = [
  { id: 'agency_services', label: 'Agency Services', description: 'Digital marketing, design, or creative services.' },
  { id: 'software_dev', label: 'Software Development', description: 'Custom software, apps, or technical projects.' },
  { id: 'consulting', label: 'Consulting & Strategy', description: 'Business strategy, audits, or advisory services.' },
  { id: 'freelance', label: 'Freelance Project', description: 'Simple, single-person project proposal.' },
];

type PickMode = 'template' | 'upload' | null;

export default function OnboardingStep3() {
  const router = useRouter();
  const [mode, setMode] = useState<PickMode>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  function handleFinish() {
    router.push('/onboarding/step-4');
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="text-xs font-semibold text-brand-600 uppercase tracking-wide mb-1">Step 3 of 3</div>
        <CardTitle className="text-2xl">Set up your first proposal</CardTitle>
        <CardDescription>Pick a template to start or upload an existing sample proposal for AI to learn from.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setMode('template'); setSelectedTemplate(null); }}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all duration-150',
              mode === 'template'
                ? 'border-brand-600 bg-brand-50'
                : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]'
            )}
          >
            <LayoutTemplate className={cn('h-7 w-7', mode === 'template' ? 'text-brand-600' : 'text-[var(--muted-foreground)]')} />
            <span className={cn('text-sm font-semibold', mode === 'template' ? 'text-brand-700' : 'text-[var(--foreground)]')}>Pick a Template</span>
            <span className="text-xs text-[var(--muted-foreground)] text-center">Choose from industry-specific templates</span>
          </button>
          <button
            onClick={() => setMode('upload')}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all duration-150',
              mode === 'upload'
                ? 'border-brand-600 bg-brand-50'
                : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300 hover:bg-[var(--accent)]'
            )}
          >
            <FileUp className={cn('h-7 w-7', mode === 'upload' ? 'text-brand-600' : 'text-[var(--muted-foreground)]')} />
            <span className={cn('text-sm font-semibold', mode === 'upload' ? 'text-brand-700' : 'text-[var(--foreground)]')}>Upload Sample</span>
            <span className="text-xs text-[var(--muted-foreground)] text-center">Upload a past proposal for AI to learn your style</span>
          </button>
        </div>

        {mode === 'template' && (
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium text-[var(--foreground)]">Choose a starting template:</p>
            {templateCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedTemplate(cat.id)}
                className={cn(
                  'w-full flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                  selectedTemplate === cat.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-brand-300'
                )}
              >
                <div className={cn('mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center', selectedTemplate === cat.id ? 'border-brand-600 bg-brand-600' : 'border-[var(--muted-foreground)]')}>
                  {selectedTemplate === cat.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[var(--foreground)]">{cat.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{cat.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === 'upload' && (
          <div className="rounded-xl border-2 border-dashed border-[var(--border)] p-8 text-center mt-2">
            <FileUp className="h-8 w-8 text-[var(--muted-foreground)] mx-auto mb-2" />
            <p className="text-sm text-[var(--muted-foreground)]">Drag & drop a PDF or Word doc here</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Or click to browse files</p>
            <Button variant="outline" size="sm" className="mt-3">Browse Files</Button>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => router.push('/onboarding/step-2')}>
            Back
          </Button>
          <Button
            className="flex-1 gap-2"
            disabled={mode === null || (mode === 'template' && !selectedTemplate)}
            onClick={handleFinish}
          >
            Finish Setup <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <button
          onClick={() => router.push('/dashboard')}
          className="w-full text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Skip for now
        </button>
      </CardContent>
    </Card>
  );
}
