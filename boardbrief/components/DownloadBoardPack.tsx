'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { generateMeetingPackHTML } from '@/lib/actions/ai-meetings';

interface DownloadBoardPackProps {
  meetingId: string;
}

export function DownloadBoardPack({ meetingId }: DownloadBoardPackProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const html = await generateMeetingPackHTML(meetingId);
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {loading ? 'Generating...' : 'Board Pack PDF'}
    </button>
  );
}
