import { cn } from '@/lib/utils';
import { FileText, Download, Share2, Search, Filter, CheckCircle2, Clock } from 'lucide-react';

const reports = [
  { id: '1', title: 'Plant A — General Safety Walk', date: 'Today, 3:00 PM', score: 85, violations: 3, status: 'final' as const, pages: 12 },
  { id: '2', title: 'Plant B — Machine Guarding Audit', date: 'Yesterday', score: 72, violations: 7, status: 'draft' as const, pages: 18 },
  { id: '3', title: 'Warehouse C — Fire Safety', date: '3 days ago', score: 92, violations: 1, status: 'final' as const, pages: 8 },
  { id: '4', title: 'Plant A — PPE Compliance', date: '1 week ago', score: 88, violations: 2, status: 'final' as const, pages: 10 },
  { id: '5', title: 'Plant B — Chemical Storage', date: '2 weeks ago', score: 65, violations: 9, status: 'final' as const, pages: 22 },
];

export function ReportsView() {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-bg-surface px-4 pb-4 pt-12">
        <h1 className="snap-heading-bold text-2xl text-text-primary">Reports</h1>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Search reports..."
              className="h-10 w-full rounded-xl bg-bg-card pl-10 pr-3 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-safety-yellow/50"
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-card">
            <Filter className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4 space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl bg-bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface">
                <FileText className="h-5 w-5 text-text-secondary" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium text-text-primary">{r.title}</div>
                  <span className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                    r.status === 'final' ? 'bg-compliant-bg text-compliant' : 'bg-border-default/30 text-text-secondary',
                  )}>
                    {r.status === 'final' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {r.status === 'final' ? 'Final' : 'Draft'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-secondary">
                  <span>{r.date}</span>
                  <span>Score: {r.score}</span>
                  <span>{r.violations} violations</span>
                  <span>{r.pages} pages</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border-default pt-3">
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bg-surface py-2 text-xs text-text-secondary">
                <Download className="h-3.5 w-3.5" /> Download
              </button>
              <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bg-surface py-2 text-xs text-text-secondary">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
