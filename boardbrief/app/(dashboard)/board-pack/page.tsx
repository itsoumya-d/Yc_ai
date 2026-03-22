'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, GripVertical, Check, Loader2, Download, Eye, Trash2, Plus } from 'lucide-react';

interface PackSection {
  id: string;
  title: string;
  type: 'cover' | 'agenda' | 'minutes' | 'ceo_report' | 'financials' | 'custom';
  included: boolean;
  fileSize?: string;
  pages?: number;
  status: 'ready' | 'missing' | 'uploading';
}

const INITIAL_SECTIONS: PackSection[] = [
  { id: 'cover', title: 'Cover Page', type: 'cover', included: true, pages: 1, status: 'ready' },
  { id: 'agenda', title: 'Meeting Agenda', type: 'agenda', included: true, pages: 2, status: 'ready' },
  { id: 'minutes', title: 'Previous Meeting Minutes', type: 'minutes', included: true, fileSize: '245 KB', pages: 8, status: 'ready' },
  { id: 'ceo', title: 'CEO Report', type: 'ceo_report', included: true, fileSize: '1.2 MB', pages: 12, status: 'ready' },
  { id: 'fin', title: 'Financial Statements', type: 'financials', included: true, fileSize: '890 KB', pages: 18, status: 'ready' },
  { id: 'risk', title: 'Risk Register', type: 'custom', included: false, status: 'missing' },
  { id: 'hr', title: 'HR & People Report', type: 'custom', included: false, status: 'missing' },
];

export default function BoardPackPage() {
  const [sections, setSections] = useState<PackSection[]>(INITIAL_SECTIONS);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [meetingName] = useState('Q2 Board Meeting — June 2025');

  const includedSections = sections.filter((s) => s.included);
  const totalPages = includedSections.reduce((sum, s) => sum + (s.pages ?? 0), 0);

  function toggleSection(id: string) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s)));
  }

  async function handleGenerate() {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2500));
    setGenerating(false);
    setGenerated(true);
  }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <PageHeader
          title="Board Pack Generator"
          description="Compile all materials into a single, professionally formatted board pack PDF."
        />

        {/* Meeting selector */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wide font-semibold mb-0.5">Selected Meeting</p>
              <p className="font-heading text-base font-semibold text-[var(--foreground)]">{meetingName}</p>
            </div>
            <Button variant="outline" className="text-sm">Change Meeting</Button>
          </div>
        </Card>

        {/* Sections list */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-[var(--foreground)]">Pack Sections</h2>
            <Button variant="outline" className="flex items-center gap-1.5 text-xs h-8">
              <Plus className="h-3 w-3" /> Add Section
            </Button>
          </div>

          <div className="space-y-2">
            {sections.map((section, index) => (
              <Card key={section.id} className={`overflow-hidden transition-opacity ${!section.included ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <GripVertical className="h-4 w-4 text-[var(--muted-foreground)] cursor-grab shrink-0" />
                  <span className="text-xs text-[var(--muted-foreground)] w-5 shrink-0 font-mono">{String(index + 1).padStart(2, '0')}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--foreground)]">{section.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {section.pages && <span className="text-xs text-[var(--muted-foreground)]">{section.pages} pages</span>}
                      {section.fileSize && <span className="text-xs text-[var(--muted-foreground)]">· {section.fileSize}</span>}
                      {section.status === 'missing' && (
                        <span className="text-xs text-amber-600 font-medium">· No file uploaded</span>
                      )}
                    </div>
                  </div>

                  {section.status === 'missing' ? (
                    <button className="flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:border-navy-400 hover:text-navy-600 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      Upload
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--accent)]" title="Preview" aria-label="Preview document">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:text-red-500" title="Remove" aria-label="Remove document">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Include toggle */}
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      section.included
                        ? 'border-navy-700 bg-navy-700 text-white'
                        : 'border-[var(--border)]'
                    }`}
                  >
                    {section.included && <Check className="h-3 w-3" />}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center gap-4">
          <Button
            onClick={handleGenerate}
            disabled={generating || includedSections.length === 0}
            className="flex items-center gap-2 bg-navy-900 text-white hover:bg-navy-800 px-6"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Compiling board pack...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Generate Board Pack PDF
              </>
            )}
          </Button>

          {generated && (
            <Button className="flex items-center gap-2 bg-green-700 text-white hover:bg-green-600">
              <Download className="h-4 w-4" />
              Download Pack
            </Button>
          )}
        </div>

        {generated && (
          <Card className="border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-800">
              <Check className="h-5 w-5" />
              <span className="font-medium text-sm">Board pack generated successfully!</span>
            </div>
            <p className="text-xs text-green-700 mt-1 ml-7">
              {totalPages} pages · All {includedSections.length} sections compiled into a single PDF.
            </p>
          </Card>
        )}
      </div>

      {/* Sidebar summary */}
      <div className="w-64 shrink-0 border-l border-[var(--border)] overflow-auto p-5 space-y-5">
        <h3 className="font-heading text-sm font-semibold text-[var(--foreground)]">Pack Summary</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Included</span>
            <span className="font-medium">{includedSections.length} sections</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Est. Pages</span>
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--muted-foreground)]">Missing Files</span>
            <span className={`font-medium ${sections.filter((s) => s.status === 'missing' && s.included).length > 0 ? 'text-amber-600' : 'text-green-600'}`}>
              {sections.filter((s) => s.status === 'missing' && s.included).length}
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-4">
          <h4 className="text-xs font-semibold text-[var(--muted-foreground)] mb-2 uppercase tracking-wide">Distribution</h4>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-[var(--foreground)]">Email to all directors</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-[var(--foreground)]">Save to meeting record</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-[var(--foreground)]">Upload to SharePoint</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
