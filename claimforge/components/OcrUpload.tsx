'use client';

import { useState, useCallback, useRef } from 'react';
import { processDocumentOcr } from '@/lib/actions/ocr';
import { createClient } from '@/lib/supabase/client';
import {
  Upload, FileText, Loader2, CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface OcrUploadProps {
  caseId: string;
  onComplete?: (result: any) => void;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface FileUploadState {
  file: File;
  status: UploadStatus;
  progress: number;
  result?: any;
  error?: string;
  url?: string;
}

export function OcrUpload({ caseId, onComplete }: OcrUploadProps) {
  const [files, setFiles] = useState<FileUploadState[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const processFile = useCallback(async (file: File) => {
    const fileState: FileUploadState = { file, status: 'uploading', progress: 0 };

    setFiles(prev => [...prev, fileState]);

    try {
      // Upload to Supabase Storage
      const path = `${caseId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('case-documents')
        .upload(path, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      setFiles(prev => prev.map(f =>
        f.file === file ? { ...f, status: 'processing', progress: 50, url: path } : f
      ));

      // Process with OCR
      const result = await processDocumentOcr(path, file.name, caseId);

      if (result.success) {
        setFiles(prev => prev.map(f =>
          f.file === file ? { ...f, status: 'complete', progress: 100, result: result.data } : f
        ));
        onComplete?.(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.file === file
          ? { ...f, status: 'error', error: String(error) }
          : f
      ));
    }
  }, [caseId, supabase, onComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files).filter(f =>
      ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(f.type)
    );
    dropped.forEach(processFile);
  }, [processFile]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
    }
  }, [processFile]);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleInput}
          className="hidden"
          aria-label="Upload documents for OCR processing"
        />
        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <p className="text-base font-medium text-gray-700 dark:text-gray-300">
          Drop documents here or click to upload
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          PDF, JPG, PNG up to 20MB each — AI extracts text, dates, amounts, and key facts
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((f, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              {/* File Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {f.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(f.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {f.status === 'uploading' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">Uploading...</span>
                  )}
                  {f.status === 'processing' && (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-xs text-blue-600 dark:text-blue-400">AI extracting...</span>
                    </>
                  )}
                  {f.status === 'complete' && (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  )}
                  {f.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              {/* OCR Results */}
              {f.status === 'complete' && f.result && (
                <div className="px-4 py-3 space-y-3">
                  {/* Doc type badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full capitalize">
                      {f.result.documentType}
                    </span>
                    <span className="text-xs text-gray-500">
                      Confidence: {Math.round(f.result.confidence * 100)}%
                    </span>
                  </div>

                  {/* Key Facts */}
                  {f.result.extractedData?.keyFacts?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Key Facts Extracted:
                      </p>
                      <ul className="space-y-1">
                        {f.result.extractedData.keyFacts.map((fact: string, fi: number) => (
                          <li key={fi} className="text-xs text-gray-600 dark:text-gray-400 flex gap-2">
                            <span className="text-green-500 flex-shrink-0">•</span>
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Amounts & Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    {f.result.extractedData?.amounts?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amounts:</p>
                        {f.result.extractedData.amounts.slice(0, 3).map((a: string, ai: number) => (
                          <p key={ai} className="text-xs text-gray-600 dark:text-gray-400">{a}</p>
                        ))}
                      </div>
                    )}
                    {f.result.extractedData?.dates?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dates:</p>
                        {f.result.extractedData.dates.slice(0, 3).map((d: string, di: number) => (
                          <p key={di} className="text-xs text-gray-600 dark:text-gray-400">{d}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {f.status === 'error' && (
                <div className="px-4 py-3">
                  <p className="text-xs text-red-600 dark:text-red-400">{f.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
