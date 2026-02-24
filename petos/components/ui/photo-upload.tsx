'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  name?: string;
  defaultValue?: string | null;
  folder?: string;
  label?: string;
}

export function PhotoUpload({
  name = 'photo_url',
  defaultValue,
  folder = 'pets',
  label = 'Photo',
}: PhotoUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue ?? '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);

    try {
      const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload failed');
      } else {
        setUrl(data.url);
      }
    } catch {
      setError('Upload failed. Please try again.');
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <p className="mb-1 text-sm font-medium text-[var(--foreground)]">{label}</p>
      <div className="flex items-center gap-4">
        {url ? (
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-[var(--border)]">
            <Image src={url} alt="Pet photo" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}
        <div>
          <label className="cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">
            {uploading ? 'Uploading…' : url ? 'Change photo' : 'Upload photo'}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleFileChange}
            />
          </label>
          {url && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="ml-2 text-xs text-[var(--muted-foreground)] hover:text-red-600"
            >
              Remove
            </button>
          )}
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">JPG, PNG, WebP up to 5 MB</p>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {/* Hidden input passes URL to the form */}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
