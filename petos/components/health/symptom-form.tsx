'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { createSymptom } from '@/lib/actions/symptoms';
import type { Pet } from '@/types/database';
import { useAiStream } from '@/lib/hooks/useAiStream';
import { Sparkles, Loader2, StopCircle } from 'lucide-react';

interface SymptomFormProps {
  pets: Pet[];
  onSuccess?: () => void;
}

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild - Minor discomfort' },
  { value: 'moderate', label: 'Moderate - Noticeable issue' },
  { value: 'severe', label: 'Severe - Significant concern' },
  { value: 'emergency', label: 'Emergency - Requires immediate attention' },
];

export function SymptomForm({ pets, onSuccess }: SymptomFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [symptomText, setSymptomText] = useState('');
  const [selectedPetId, setSelectedPetId] = useState('');
  const [showAiCheck, setShowAiCheck] = useState(false);
  const { generate, streaming, text: aiText, error: aiError, cancel: cancelAi, reset: resetAi } = useAiStream();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createSymptom(formData);

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Symptom submitted for analysis', variant: 'success' });
    setLoading(false);
    onSuccess?.();
  }

  const selectedPet = pets.find((p) => p.id === selectedPetId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pet_id" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Which pet?
        </label>
        <select
          id="pet_id"
          name="pet_id"
          required
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
          className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          <option value="">Select a pet</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="description" className="block text-sm font-medium text-[var(--foreground)]">
            Describe the symptoms
          </label>
          <button
            type="button"
            onClick={() => { setShowAiCheck(!showAiCheck); resetAi(); }}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            AI Health Check
          </button>
        </div>
        <Textarea
          id="description"
          name="description"
          value={symptomText}
          onChange={(e) => setSymptomText(e.target.value)}
          label=""
          placeholder="My pet has been lethargic, not eating well, and has a slight cough for the past 2 days..."
          rows={4}
          required
        />
      </div>

      {/* AI Health Check Panel */}
      {showAiCheck && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span className="text-sm font-semibold text-[var(--foreground)]">AI Health Check</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Get AI-powered insights based on your pet&apos;s symptoms. Always consult a veterinarian for medical decisions.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() =>
                generate(
                  `My ${selectedPet ? `${selectedPet.species} named ${selectedPet.name}` : 'pet'} has these symptoms: ${symptomText || 'not described yet'}. What could be the possible causes and what should I monitor?`,
                  selectedPet ? `Pet: ${selectedPet.name}, Species: ${selectedPet.species}` : undefined
                )
              }
              disabled={streaming || !symptomText.trim()}
              className="flex-1"
            >
              {streaming ? (
                <>
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3 w-3" />
                  Analyze Symptoms
                </>
              )}
            </Button>
            {streaming && (
              <Button type="button" size="sm" variant="outline" onClick={cancelAi}>
                <StopCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
          {(aiText || streaming) && (
            <div className="rounded-lg border border-[var(--input)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] whitespace-pre-wrap max-h-64 overflow-y-auto">
              {aiText}
              {streaming && <span className="inline-block w-0.5 h-4 bg-brand-500 ml-0.5 animate-pulse align-middle" />}
            </div>
          )}
          {aiError && <p className="text-xs text-red-500">{aiError}</p>}
          {aiText && !streaming && (
            <Button type="button" size="sm" variant="ghost" className="text-xs" onClick={resetAi}>
              Clear
            </Button>
          )}
        </div>
      )}

      <div>
        <label htmlFor="severity" className="mb-1 block text-sm font-medium text-[var(--foreground)]">
          Severity
        </label>
        <select
          id="severity"
          name="severity"
          required
          className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        >
          {SEVERITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Input
        id="photo_url"
        name="photo_url"
        label="Photo URL (optional)"
        placeholder="https://..."
      />

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Analyzing...' : 'Analyze Symptoms with AI'}
      </Button>
    </form>
  );
}
