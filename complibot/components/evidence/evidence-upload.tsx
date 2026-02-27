'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { addEvidence } from '@/lib/actions/evidence';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EvidenceUploadProps {
  onUploaded?: () => void;
  controlId?: string;
}

export function EvidenceUpload({ onUploaded, controlId }: EvidenceUploadProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be under 10MB', 'error');
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const result = await addEvidence({
        title: title.trim(),
        description: description.trim() || undefined,
        controlId,
        fileName: selectedFile?.name ?? undefined,
        fileType: selectedFile?.type ?? undefined,
        fileSize: selectedFile?.size ?? undefined,
        collectionDate,
      });

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Evidence added!', 'success');
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        setCollectionDate(new Date().toISOString().split('T')[0]);
        onUploaded?.();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-300 hover:bg-slate-50'
        )}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
        />
        {selectedFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="text-slate-400 hover:text-red-500 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600 font-medium">Drop evidence file here or click to browse</p>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT, PNG, JPG, XLSX up to 10MB</p>
          </>
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Evidence title..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Collection Date</label>
          <input
            type="date"
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Describe what this evidence demonstrates..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Add Evidence'}
      </Button>
    </div>
  );
}
