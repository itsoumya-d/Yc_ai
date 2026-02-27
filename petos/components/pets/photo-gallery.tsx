'use client';

import { useState, useRef, useTransition, useCallback } from 'react';
import { cn, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { createClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhotoAnalysis {
  condition_score: number;
  observations:    string[];
  recommendations: string[];
  overall_health:  'excellent' | 'good' | 'fair' | 'concerning';
  weight_estimate: string | null;
}

export interface PetPhoto {
  id:           string;
  pet_id:       string;
  user_id:      string;
  storage_path: string;
  url:          string;
  category:     string;
  caption:      string | null;
  ai_analysis:  PhotoAnalysis | null;
  taken_at:     string | null;
  created_at:   string;
}

type PhotoCategory = 'general' | 'vet_visit' | 'progress' | 'fun';

interface PhotoGalleryProps {
  petId:      string;
  petName:    string;
  petContext?: { species: string; breed: string | null };
  initialPhotos?: PetPhoto[];
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<PhotoCategory, { label: string; color: string }> = {
  general:   { label: 'General',   color: 'bg-gray-100 text-gray-700'   },
  vet_visit: { label: 'Vet Visit', color: 'bg-blue-100 text-blue-700'   },
  progress:  { label: 'Progress',  color: 'bg-green-100 text-green-700' },
  fun:       { label: 'Fun',       color: 'bg-pink-100 text-pink-700'   },
};

const BCS_LABEL: Record<number, string> = {
  1: 'Emaciated', 2: 'Very Thin', 3: 'Thin', 4: 'Underweight',
  5: 'Ideal',     6: 'Slightly Overweight', 7: 'Overweight',
  8: 'Obese',     9: 'Severely Obese',
};

const HEALTH_COLOR: Record<string, string> = {
  excellent: 'bg-green-100 text-green-800',
  good:      'bg-blue-100 text-blue-800',
  fair:      'bg-yellow-100 text-yellow-800',
  concerning:'bg-red-100 text-red-800',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PhotoGallery({
  petId,
  petName,
  petContext,
  initialPhotos = [],
  className,
}: PhotoGalleryProps) {
  const { toast }   = useToast();
  const supabase    = createClient();

  const [photos,    setPhotos]    = useState<PetPhoto[]>(initialPhotos);
  const [lightbox,  setLightbox]  = useState<PetPhoto | null>(null);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filter,    setFilter]    = useState<PhotoCategory | 'all'>('all');
  const [caption,   setCaption]   = useState('');
  const [category,  setCategory]  = useState<PhotoCategory>('general');
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = filter === 'all' ? photos : photos.filter((p) => p.category === filter);

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max 10 MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast({ title: 'Not authenticated', variant: 'destructive' }); return; }

      const ext  = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${petId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('pet-photos')
        .upload(path, file);

      if (uploadErr) { toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' }); return; }

      const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(path);

      const { data: record, error: dbErr } = await supabase
        .from('pet_photos')
        .insert({
          pet_id: petId, user_id: user.id,
          storage_path: path, url: urlData.publicUrl,
          category, caption: caption || null,
          taken_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (dbErr) { toast({ title: 'Database error', description: dbErr.message, variant: 'destructive' }); return; }

      setPhotos((prev) => [record as PetPhoto, ...prev]);
      setCaption('');
      toast({ title: 'Photo uploaded', variant: 'success' });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  // ── AI Analysis ────────────────────────────────────────────────────────────

  const handleAnalyze = useCallback(async (photo: PetPhoto) => {
    setAnalyzing(photo.id);
    try {
      const res  = await fetch('/api/ai/analyze-pet-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: photo.url, petId, photoId: photo.id, petContext }),
      });
      const json = await res.json() as { data?: PhotoAnalysis; error?: string };
      if (!res.ok || json.error) {
        toast({ title: 'Analysis failed', description: json.error, variant: 'destructive' });
        return;
      }
      const analysis = json.data!;
      setPhotos((prev) => prev.map((p) => p.id === photo.id ? { ...p, ai_analysis: analysis } : p));
      if (lightbox?.id === photo.id) setLightbox((prev) => prev ? { ...prev, ai_analysis: analysis } : prev);
      toast({ title: 'Analysis complete', variant: 'success' });
    } catch {
      toast({ title: 'Analysis failed', variant: 'destructive' });
    } finally {
      setAnalyzing(null);
    }
  }, [petId, petContext, lightbox, toast]);

  // ── Delete ─────────────────────────────────────────────────────────────────

  async function handleDelete(photo: PetPhoto) {
    if (!confirm('Delete this photo?')) return;
    startTransition(async () => {
      await supabase.storage.from('pet-photos').remove([photo.storage_path]);
      await supabase.from('pet_photos').delete().eq('id', photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      if (lightbox?.id === photo.id) setLightbox(null);
      toast({ title: 'Photo deleted', variant: 'success' });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={cn('space-y-5', className)}>
      {/* Upload bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Caption</label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Optional…"
                  className="block w-full rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PhotoCategory)}
                  className="block rounded-lg border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([v, { label }]) => (
                    <option key={v} value={v}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Button
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="whitespace-nowrap"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading…
                  </span>
                ) : '📷 Upload Photo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(CATEGORY_CONFIG)] as const).map((cat) => {
          const count = cat === 'all' ? photos.length : photos.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filter === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              )}
            >
              {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat as PhotoCategory].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-4xl">📷</p>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            No photos yet. Upload one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((photo) => (
            <div key={photo.id} className="group relative overflow-hidden rounded-xl">
              <button
                className="block aspect-square w-full overflow-hidden rounded-xl bg-[var(--muted)]"
                onClick={() => setLightbox(photo)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption ?? `${petName} photo`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              </button>

              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-xl p-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="flex justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                    disabled={isPending}
                    className="rounded-md bg-red-600/90 p-1 text-white hover:bg-red-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', CATEGORY_CONFIG[photo.category as PhotoCategory]?.color ?? 'bg-gray-100 text-gray-700')}>
                    {CATEGORY_CONFIG[photo.category as PhotoCategory]?.label ?? photo.category}
                  </span>
                  {photo.ai_analysis ? (
                    <span className="rounded-md bg-green-600/90 px-2 py-0.5 text-[10px] text-white">
                      BCS {photo.ai_analysis.condition_score}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAnalyze(photo); }}
                      disabled={analyzing === photo.id}
                      className="rounded-md bg-brand-600/90 px-2 py-0.5 text-[10px] text-white hover:bg-brand-700"
                    >
                      {analyzing === photo.id ? '…' : '✨ Analyze'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-[var(--card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2 text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="flex-1 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.url}
                alt={lightbox.caption ?? 'Pet photo'}
                className="max-h-[90vh] w-full object-contain"
              />
            </div>

            {/* Side panel */}
            <div className="w-72 shrink-0 space-y-4 overflow-y-auto p-5">
              <div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', CATEGORY_CONFIG[lightbox.category as PhotoCategory]?.color ?? 'bg-gray-100 text-gray-700')}>
                  {CATEGORY_CONFIG[lightbox.category as PhotoCategory]?.label ?? lightbox.category}
                </span>
                {lightbox.caption && (
                  <p className="mt-2 text-sm text-[var(--foreground)]">{lightbox.caption}</p>
                )}
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {formatDate(lightbox.taken_at ?? lightbox.created_at)}
                </p>
              </div>

              {lightbox.ai_analysis ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[var(--foreground)]">AI Assessment</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', HEALTH_COLOR[lightbox.ai_analysis.overall_health] ?? '')}>
                      {lightbox.ai_analysis.overall_health}
                    </span>
                  </div>

                  {/* BCS */}
                  <div className="rounded-lg bg-[var(--muted)] p-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[var(--muted-foreground)]">Body Condition Score</span>
                      <span className="text-2xl font-bold text-[var(--foreground)]">
                        {lightbox.ai_analysis.condition_score}
                        <span className="text-xs font-normal text-[var(--muted-foreground)]">/9</span>
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {BCS_LABEL[lightbox.ai_analysis.condition_score] ?? ''}
                    </p>
                    <div className="mt-2 flex gap-0.5">
                      {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                        <div
                          key={n}
                          className={cn(
                            'h-1.5 flex-1 rounded-full',
                            n <= lightbox.ai_analysis!.condition_score
                              ? n <= 3 ? 'bg-yellow-500' : n <= 6 ? 'bg-green-500' : 'bg-red-500'
                              : 'bg-[var(--border)]'
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  {lightbox.ai_analysis.observations.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold">Observations</p>
                      <ul className="space-y-1">
                        {lightbox.ai_analysis.observations.map((obs, i) => (
                          <li key={i} className="flex gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="mt-0.5 shrink-0 text-brand-500">•</span>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lightbox.ai_analysis.recommendations.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs font-semibold">Recommendations</p>
                      <ul className="space-y-1">
                        {lightbox.ai_analysis.recommendations.map((rec, i) => (
                          <li key={i} className="flex gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="mt-0.5 shrink-0 text-green-500">✓</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[var(--border)] p-4 text-center">
                  <p className="text-xs text-[var(--muted-foreground)]">No AI analysis yet</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    disabled={analyzing === lightbox.id}
                    onClick={() => handleAnalyze(lightbox)}
                  >
                    {analyzing === lightbox.id ? 'Analyzing…' : '✨ Run Analysis'}
                  </Button>
                </div>
              )}

              <div className="border-t border-[var(--border)] pt-3">
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  disabled={isPending}
                  onClick={() => handleDelete(lightbox)}
                >
                  Delete Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
