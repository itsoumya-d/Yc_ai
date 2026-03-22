import { Skeleton } from '@/components/ui/skeleton';

export default function CrossBoardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-56 w-full rounded-lg" />
      </div>
    </div>
  );
}
