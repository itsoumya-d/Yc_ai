'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { Download, FileText, BookOpen, Loader2, Upload, Sparkles } from 'lucide-react';
import { exportStory } from '@/lib/actions/export';

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storyId: string;
  storyTitle: string;
}

type ExportFormat = 'epub' | 'pdf' | 'docx';
type FontFamily = 'Garamond' | 'Times New Roman' | 'Georgia' | 'Palatino';

export function ExportModal({ open, onOpenChange, storyId, storyTitle }: ExportModalProps) {
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('epub');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Format settings
  const [settings, setSettings] = useState({
    font: 'Garamond' as FontFamily,
    fontSize: '12',
    margins: 'normal', // narrow, normal, wide
    chapterBreaks: 'page', // page, section
    includeTableOfContents: true,
    includeCoverPage: true,
  });

  // Metadata
  const [metadata, setMetadata] = useState({
    authorName: '',
    copyright: '',
    isbn: '',
    publisher: '',
  });

  // Cover
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [generateAICover, setGenerateAICover] = useState(false);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'Error', description: 'Cover image must be less than 5MB', variant: 'destructive' });
        return;
      }
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setDownloadUrl(null);

    try {
      // Simulate progress (in real implementation, use server-sent events or polling)
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const result = await exportStory(storyId, {
        format,
        settings,
        metadata,
        coverFile: coverFile ? await fileToBase64(coverFile) : null,
        generateAICover,
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.error) {
        throw new Error(result.error);
      }

      setDownloadUrl(result.data!.url);
      toast({ title: 'Export complete!', description: `Your ${format.toUpperCase()} is ready to download.` });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
      setExportProgress(0);
    } finally {
      setIsExporting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const resetModal = () => {
    setExportProgress(0);
    setDownloadUrl(null);
    setIsExporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetModal(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Story</DialogTitle>
          <DialogDescription>
            Export "{storyTitle}" as EPUB, PDF, or DOCX with custom formatting
          </DialogDescription>
        </DialogHeader>

        {!downloadUrl ? (
          <div className="space-y-6 py-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setFormat('epub')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === 'epub'
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <BookOpen className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">EPUB</div>
                  <div className="text-xs text-gray-500">eReaders</div>
                </button>
                <button
                  onClick={() => setFormat('pdf')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === 'pdf'
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">PDF</div>
                  <div className="text-xs text-gray-500">Print</div>
                </button>
                <button
                  onClick={() => setFormat('docx')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    format === 'docx'
                      ? 'border-brand-600 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Download className="h-6 w-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">DOCX</div>
                  <div className="text-xs text-gray-500">Word</div>
                </button>
              </div>
            </div>

            {/* Format Settings */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Format Settings</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Font Family</label>
                  <select
                    value={settings.font}
                    onChange={(e) => setSettings({ ...settings, font: e.target.value as FontFamily })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Garamond">Garamond</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Palatino">Palatino</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Font Size</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="10">10pt</option>
                    <option value="11">11pt</option>
                    <option value="12">12pt (Standard)</option>
                    <option value="13">13pt</option>
                    <option value="14">14pt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Margins</label>
                  <select
                    value={settings.margins}
                    onChange={(e) => setSettings({ ...settings, margins: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="narrow">Narrow (0.5")</option>
                    <option value="normal">Normal (1")</option>
                    <option value="wide">Wide (1.5")</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Chapter Breaks</label>
                  <select
                    value={settings.chapterBreaks}
                    onChange={(e) => setSettings({ ...settings, chapterBreaks: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="page">New Page</option>
                    <option value="section">Section Break</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeTableOfContents}
                    onChange={(e) => setSettings({ ...settings, includeTableOfContents: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Include Table of Contents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.includeCoverPage}
                    onChange={(e) => setSettings({ ...settings, includeCoverPage: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Include Cover Page</span>
                </label>
              </div>
            </div>

            {/* Cover Design */}
            {settings.includeCoverPage && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-medium">Cover Design</h3>

                <div className="flex items-start gap-4">
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover preview" className="w-24 h-32 object-cover rounded border" />
                  )}
                  <div className="flex-1 space-y-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Upload Cover Image</span>
                      <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500">PNG or JPEG, max 5MB</p>

                    <button
                      onClick={() => setGenerateAICover(!generateAICover)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        generateAICover ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-medium">Generate AI Cover</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-medium">Metadata</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Author Name</label>
                  <Input
                    value={metadata.authorName}
                    onChange={(e) => setMetadata({ ...metadata, authorName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Publisher</label>
                  <Input
                    value={metadata.publisher}
                    onChange={(e) => setMetadata({ ...metadata, publisher: e.target.value })}
                    placeholder="Publisher name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Copyright</label>
                  <Input
                    value={metadata.copyright}
                    onChange={(e) => setMetadata({ ...metadata, copyright: e.target.value })}
                    placeholder="© 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ISBN (Optional)</label>
                  <Input
                    value={metadata.isbn}
                    onChange={(e) => setMetadata({ ...metadata, isbn: e.target.value })}
                    placeholder="978-3-16-148410-0"
                  />
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isExporting && (
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {exportProgress < 30 && 'Compiling chapters...'}
                    {exportProgress >= 30 && exportProgress < 60 && 'Formatting content...'}
                    {exportProgress >= 60 && exportProgress < 90 && 'Generating document...'}
                    {exportProgress >= 90 && 'Finalizing...'}
                  </span>
                  <span className="text-gray-500">{exportProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Export Button */}
            <div className="flex justify-end gap-2 border-t pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting} className="bg-brand-600 hover:bg-brand-700">
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export {format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Download Ready
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Download className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Export Complete!</h3>
            <p className="text-gray-600">Your {format.toUpperCase()} file is ready to download.</p>
            <div className="flex justify-center gap-2">
              <a href={downloadUrl} download className="inline-block">
                <Button className="bg-brand-600 hover:bg-brand-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </a>
              <Button variant="outline" onClick={() => { setDownloadUrl(null); resetModal(); }}>
                Export Another
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">Download link expires in 24 hours</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
