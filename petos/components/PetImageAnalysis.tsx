'use client';

import { useState, useRef } from 'react';
import { analyzePetImage, PetSymptomAnalysis } from '@/lib/actions/image-analysis';
import { createClient } from '@/lib/supabase/client';
import {
  Camera, Loader2, AlertTriangle, CheckCircle2,
  Phone, Clock, Zap, Heart, ChevronRight
} from 'lucide-react';

interface PetImageAnalysisProps {
  petId: string;
  petSpecies: string;
  petBreed: string;
  petAge: number;
}

const severityConfig = {
  mild: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: CheckCircle2, label: 'Mild' },
  moderate: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', icon: Clock, label: 'Moderate' },
  severe: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: AlertTriangle, label: 'Severe' },
  emergency: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: Zap, label: 'Emergency' },
};

const urgencyLabels = {
  routine: 'Schedule at your convenience',
  soon: 'See a vet within 24-48 hours',
  urgent: 'See a vet today',
  emergency: 'Seek emergency veterinary care immediately',
};

export function PetImageAnalysis({ petId, petSpecies, petBreed, petAge }: PetImageAnalysisProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<PetSymptomAnalysis | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleImageSelect = (file: File) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError('');

    try {
      // Upload to Supabase storage
      const path = `${petId}/${Date.now()}_${image.name}`;
      await supabase.storage.from('pet-photos').upload(path, image);

      const result = await analyzePetImage(path, petId, petSpecies, petBreed, petAge, notes);

      if (result.success && result.data) {
        setAnalysis(result.data);
      } else {
        setError(result.error ?? 'Analysis failed');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const config = analysis ? severityConfig[analysis.severity] : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-100 dark:bg-rose-900/20 rounded-xl">
          <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">AI Symptom Check</h3>
          <p className="text-xs text-[var(--muted-foreground)]">Upload a photo for AI health analysis</p>
        </div>
      </div>

      {/* Image Upload */}
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
            aria-label="Upload pet photo for analysis"
          />
          <Camera className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Take a photo or upload from gallery
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Clear, well-lit photos of affected areas work best
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
            <img src={preview} alt="Pet photo for analysis" className="w-full h-full object-contain" />
            <button
              onClick={() => { setPreview(null); setImage(null); setAnalysis(null); }}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Describe what you're concerned about (e.g., 'limping for 2 days', 'redness around eye')..."
            rows={2}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-[var(--foreground)] resize-none focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-all active:scale-[0.97] disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                Analyze Symptoms
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && config && (
        <div className="space-y-4">
          {/* Severity Banner */}
          <div className={`flex items-center gap-3 p-4 ${config.bg} ${config.border} border rounded-xl`}>
            <config.icon className={`w-6 h-6 ${config.color} flex-shrink-0`} />
            <div>
              <p className={`font-semibold ${config.color}`}>{config.label} — {urgencyLabels[analysis.vetUrgency]}</p>
              {analysis.warningSign && analysis.warningMessage && (
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{analysis.warningMessage}</p>
              )}
            </div>
          </div>

          {/* Symptoms */}
          {analysis.symptoms.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Observed Symptoms</p>
              <div className="flex flex-wrap gap-2">
                {analysis.symptoms.map((s, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          {analysis.possibleConditions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Possible Conditions</p>
              <div className="space-y-2">
                {analysis.possibleConditions.map((cond, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-0.5 font-medium ${
                      cond.likelihood === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      cond.likelihood === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {cond.likelihood}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{cond.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{cond.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div>
            <p className="text-sm font-medium text-[var(--foreground)] mb-2">Recommendations</p>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--foreground)]">
                  <ChevronRight className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Home Care Tips */}
          {analysis.homeCareTips?.length > 0 && analysis.severity === 'mild' && (
            <div>
              <p className="text-sm font-medium text-[var(--foreground)] mb-2">Home Care Tips</p>
              <ul className="space-y-1.5">
                {analysis.homeCareTips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[var(--muted-foreground)]">
                    <ChevronRight className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Emergency CTA */}
          {(analysis.vetUrgency === 'emergency' || analysis.vetUrgency === 'urgent') && (
            <a
              href="tel:911"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all active:scale-[0.97]"
            >
              <Phone className="w-4 h-4" />
              Find Emergency Vet
            </a>
          )}

          <p className="text-xs text-[var(--muted-foreground)] text-center">
            AI analysis is not a substitute for professional veterinary diagnosis
          </p>
        </div>
      )}
    </div>
  );
}
