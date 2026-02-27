'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TemplateName = 'classic' | 'minimal' | 'modern' | 'bold';
export type FontFamily   = 'Inter' | 'Georgia' | 'Playfair Display' | 'Montserrat';

export interface DesignerSettings {
  template:   TemplateName;
  brandColor: string;
  font:       FontFamily;
  logoUrl:    string | null;
}

interface TemplateDesignerProps {
  initialTemplate?:   TemplateName;
  initialBrandColor?: string;
  initialFont?:       FontFamily;
  initialLogoUrl?:    string | null;
  onSave?:            (settings: DesignerSettings) => Promise<void>;
  className?:         string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TEMPLATES: { id: TemplateName; label: string; description: string }[] = [
  { id: 'classic', label: 'Classic', description: 'Traditional professional layout' },
  { id: 'minimal', label: 'Minimal', description: 'Clean with generous whitespace'  },
  { id: 'modern',  label: 'Modern',  description: 'Bold sidebar accent'              },
  { id: 'bold',    label: 'Bold',    description: 'High-contrast attention-grabbing' },
];

const FONTS: FontFamily[] = ['Inter', 'Georgia', 'Playfair Display', 'Montserrat'];

const PRESET_COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#db2777',
  '#ea580c', '#0891b2', '#1d4ed8', '#374151',
];

function isValidHex(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
}

// ─── Mini preview card ────────────────────────────────────────────────────────

function TemplateCard({
  template,
  brandColor,
  font,
  selected,
  onClick,
}: {
  template:   (typeof TEMPLATES)[0];
  brandColor: string;
  font:       FontFamily;
  selected:   boolean;
  onClick:    () => void;
}) {
  const color  = isValidHex(brandColor) ? brandColor : '#16a34a';
  const fStyle = { fontFamily: `"${font}", sans-serif` } as React.CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative w-full rounded-xl border-2 text-left transition-all focus:outline-none',
        selected
          ? 'border-brand-500 shadow-md'
          : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
      )}
    >
      <div className="overflow-hidden rounded-lg">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-3" style={fStyle}>
          {template.id === 'bold' ? (
            <div className="flex items-start gap-2">
              <div className="h-10 w-1.5 rounded-full" style={{ backgroundColor: color }} />
              <div className="flex-1 space-y-1">
                <div className="h-2.5 w-20 rounded" style={{ backgroundColor: color }} />
                <div className="h-1.5 w-full rounded bg-gray-100" />
                <div className="h-1.5 w-4/5 rounded bg-gray-100" />
              </div>
            </div>
          ) : template.id === 'modern' ? (
            <div className="flex gap-2">
              <div className="w-1/3 rounded p-1.5" style={{ backgroundColor: `${color}18` }}>
                <div className="h-2 w-full rounded mb-1" style={{ backgroundColor: color }} />
                <div className="space-y-0.5">
                  <div className="h-1 w-full rounded bg-gray-200" />
                  <div className="h-1 w-3/4 rounded bg-gray-200" />
                </div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-3/4 rounded bg-gray-700" />
                <div className="h-1 w-full rounded bg-gray-100" />
                <div className="h-1 w-full rounded bg-gray-100" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-2 w-14 rounded" style={{ backgroundColor: color }} />
                <div className="h-2 w-10 rounded bg-gray-200" />
              </div>
              <div className="h-px bg-gray-100" />
              <div className="h-1 w-full rounded bg-gray-100" />
              <div className="h-1 w-4/5 rounded bg-gray-100" />
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between px-3 pb-2 pt-1">
        <div>
          <p className="text-xs font-semibold text-gray-800">{template.label}</p>
          <p className="text-[10px] text-gray-500">{template.description}</p>
        </div>
        {selected && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: color }}
          >
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TemplateDesigner({
  initialTemplate   = 'classic',
  initialBrandColor = '#16a34a',
  initialFont       = 'Inter',
  initialLogoUrl    = null,
  onSave,
  className,
}: TemplateDesignerProps) {
  const [template,    setTemplate]    = useState<TemplateName>(initialTemplate);
  const [brandColor,  setBrandColor]  = useState(initialBrandColor);
  const [font,        setFont]        = useState<FontFamily>(initialFont);
  const [logoUrl,     setLogoUrl]     = useState<string | null>(initialLogoUrl);
  const [uploading,   setUploading]   = useState(false);
  const [savedState,  setSavedState]  = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isPending,   startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const hasChanges =
    template   !== initialTemplate   ||
    brandColor !== initialBrandColor ||
    font       !== initialFont       ||
    logoUrl    !== initialLogoUrl;

  function handleColorInput(raw: string) {
    const v = raw.startsWith('#') ? raw : `#${raw}`;
    setBrandColor(v);
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      setLogoUrl(URL.createObjectURL(file));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!onSave) return;
    setSavedState('saving');
    startTransition(async () => {
      try {
        await onSave({ template, brandColor, font, logoUrl });
        setSavedState('saved');
        setTimeout(() => setSavedState('idle'), 2500);
      } catch {
        setSavedState('error');
        setTimeout(() => setSavedState('idle'), 3000);
      }
    });
  }

  const safeColor = isValidHex(brandColor) ? brandColor : '#16a34a';

  return (
    <div className={cn('space-y-8', className)}>
      {/* Template selector */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Template
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              brandColor={safeColor}
              font={font}
              selected={template === t.id}
              onClick={() => setTemplate(t.id)}
            />
          ))}
        </div>
      </section>

      {/* Brand color */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Brand Color
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={color}
              onClick={() => setBrandColor(color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1',
                brandColor === color ? 'scale-110 border-white shadow-md ring-2' : 'border-transparent'
              )}
              style={{ backgroundColor: color, outlineColor: color }}
            />
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1">
            <div
              className="h-5 w-5 rounded-full border border-[var(--border)]"
              style={{ backgroundColor: safeColor }}
            />
            <input
              type="text"
              value={brandColor}
              onChange={(e) => handleColorInput(e.target.value)}
              placeholder="#16a34a"
              maxLength={7}
              className="w-20 bg-transparent font-mono text-sm text-[var(--foreground)] focus:outline-none"
            />
          </div>
        </div>
        {!isValidHex(brandColor) && (
          <p className="mt-1 text-xs text-red-500">Enter a valid hex color (e.g. #1a2b3c)</p>
        )}
      </section>

      {/* Font */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Font Family
        </h3>
        <div className="flex flex-wrap gap-2">
          {FONTS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFont(f)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm transition-colors',
                font === f
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                  : 'border-[var(--border)] hover:border-[var(--muted-foreground)]'
              )}
              style={{ fontFamily: `"${f}", sans-serif` }}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Logo */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Business Logo
        </h3>
        <div className="flex items-start gap-4">
          {logoUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="Business logo"
                className="h-16 w-16 rounded-lg border border-[var(--border)] object-contain p-1"
              />
              <button
                type="button"
                onClick={() => { setLogoUrl(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:border-brand-400 hover:text-brand-500"
            >
              {uploading ? (
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              )}
            </button>
          )}
          <div>
            <p className="text-sm text-[var(--foreground)]">
              {logoUrl ? 'Logo uploaded' : 'Upload your business logo'}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              PNG, JPG, or SVG. Max 2MB. 512×512px recommended.
            </p>
            {!logoUrl && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-1.5 text-xs font-medium text-brand-600 hover:underline"
              >
                Choose file
              </button>
            )}
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
      </section>

      {/* Live preview */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--accent)] p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Live Preview
        </p>
        <div
          className="rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm"
          style={{ fontFamily: `"${font}", sans-serif` }}
        >
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded object-contain" />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded text-xs font-bold text-white"
                  style={{ backgroundColor: safeColor }}
                >
                  B
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-gray-800">Your Business</p>
                <p className="text-xs text-gray-400">hello@yourco.com</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Invoice</p>
              <p className="text-sm font-bold" style={{ color: safeColor }}>INV-0001</p>
            </div>
          </div>
          <div className="mb-3 h-px" style={{ backgroundColor: `${safeColor}33` }} />
          <div className="mb-3 space-y-1">
            {[['Design Services', '$1,200'], ['Development', '$3,500'], ['Consulting', '$800']].map(([label, amount]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-600">{label}</span>
                <span className="font-mono font-medium text-gray-800">{amount}</span>
              </div>
            ))}
          </div>
          <div
            className="flex justify-between pt-2"
            style={{ borderTop: `2px solid ${safeColor}` }}
          >
            <span className="text-sm font-bold text-gray-800">Total Due</span>
            <span className="text-sm font-bold" style={{ color: safeColor }}>$5,500.00</span>
          </div>
        </div>
      </section>

      {/* Save */}
      {onSave && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || savedState === 'saving' || isPending || !isValidHex(brandColor)}
            className="min-w-32"
          >
            {savedState === 'saving' ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : savedState === 'saved' ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Saved!
              </span>
            ) : (
              'Save Settings'
            )}
          </Button>
          {savedState === 'error' && (
            <p className="text-sm text-red-500">Failed to save. Try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
