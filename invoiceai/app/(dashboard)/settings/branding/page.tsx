'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Eye, Check, Palette, Image, Type, AlignLeft } from 'lucide-react';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Clean, professional layout with header logo and footer details.',
    preview: 'bg-white border-t-4',
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Minimalist design with bold typography and accent sidebar.',
    preview: 'bg-white border-l-4',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Simple one-column layout, no decorative elements.',
    preview: 'bg-gray-50',
  },
  {
    id: 'bold',
    name: 'Bold',
    desc: 'Full-color header bar with high-contrast text.',
    preview: 'bg-white',
  },
];

const PRESET_COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#dc2626',
  '#ea580c', '#ca8a04', '#0891b2', '#1d4ed8',
];

export default function BrandingPage() {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#16a34a');
  const [accentColor, setAccentColor] = useState('#0891b2');
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [footerText, setFooterText] = useState('Thank you for your business!');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--foreground)]">Branding</h1>
          <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">Customize how your invoices look to clients.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Logo */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Image size={15} className="text-[var(--muted-foreground)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Company Logo</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Appears in the invoice header sent to your clients.</p>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="flex flex-col items-center justify-center gap-2 w-36 h-24 border-2 border-dashed border-[var(--border)] rounded-xl hover:border-[var(--primary)] cursor-pointer transition-colors bg-[var(--muted)]/30">
                <Upload size={20} className="text-[var(--muted-foreground)]" />
                <span className="text-xs text-[var(--muted-foreground)] text-center">Drag & drop or click</span>
                <span className="text-[10px] text-[var(--muted-foreground)]">PNG, JPG, SVG — max 2MB</span>
              </div>
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo preview" className="h-20 w-auto rounded-lg border border-[var(--border)] object-contain p-2 bg-white" />
                  <button onClick={() => setLogoUrl('')} className="text-xs text-red-500 hover:text-red-700 transition-colors">Remove</button>
                </div>
              ) : (
                <div className="flex-1 min-w-48">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Or enter a URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brand Colors */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Palette size={15} className="text-[var(--muted-foreground)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Brand Colors</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Used as accent colors on invoices and the client payment portal.</p>
          </div>
          <div className="p-5 space-y-5">
            {/* Primary */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border)] p-0.5"
                />
                <input
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-28 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <div className="flex gap-1.5">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setPrimaryColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${primaryColor === c ? 'scale-125 ring-2 ring-offset-1 ring-[var(--primary)]' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Accent */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--border)] p-0.5"
                />
                <input
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-28 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Color Preview</label>
              <div className="rounded-lg overflow-hidden border border-[var(--border)] h-14 flex">
                <div className="flex-1 flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: primaryColor }}>
                  Primary
                </div>
                <div className="flex-1 flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: accentColor }}>
                  Accent
                </div>
                <div className="flex-1 bg-white flex items-center justify-center">
                  <span className="text-xs font-semibold" style={{ color: primaryColor }}>Invoice Text</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Template */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Type size={15} className="text-[var(--muted-foreground)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Invoice Template</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Choose the default layout for your invoices.</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`relative rounded-xl border-2 p-3 text-left transition-all ${
                    selectedTemplate === t.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/40'
                  }`}
                >
                  {selectedTemplate === t.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-[var(--primary)] rounded-full flex items-center justify-center">
                      <Check size={11} className="text-white" />
                    </div>
                  )}
                  {/* Mini preview */}
                  <div className={`w-full h-16 rounded-md border border-[var(--border)] mb-2.5 overflow-hidden ${t.preview}`}
                    style={{ borderTopColor: selectedTemplate === t.id ? primaryColor : undefined }}>
                    <div className="flex flex-col gap-1 p-1.5">
                      <div className="h-1.5 bg-gray-300 rounded w-3/4" />
                      <div className="h-1 bg-gray-200 rounded w-1/2" />
                      <div className="h-1 bg-gray-200 rounded w-2/3 mt-1" />
                      <div className="h-1 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 leading-tight">{t.desc}</p>
                </button>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 text-sm text-[var(--primary)] hover:opacity-80 font-medium transition-opacity">
              <Eye size={14} />
              Preview selected template
            </button>
          </div>
        </div>

        {/* Company Info for Invoice Header */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <AlignLeft size={15} className="text-[var(--muted-foreground)]" />
              <h2 className="text-base font-semibold text-[var(--foreground)]">Invoice Header Info</h2>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Details printed at the top of every invoice.</p>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Company Name</label>
                <input
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="Your Business LLC"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Website</label>
                <input
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Address</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Phone</label>
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Invoice Footer Text</label>
              <textarea
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                rows={2}
                placeholder="Thank you for your business!"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Appears at the bottom of every invoice.</p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Branding'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <Check size={14} />
              Changes saved
            </span>
          )}
          <button className="flex items-center gap-1.5 px-4 py-2.5 border border-[var(--border)] text-[var(--foreground)] text-sm font-medium rounded-lg hover:bg-[var(--muted)] transition-colors">
            <Eye size={14} />
            Preview Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
