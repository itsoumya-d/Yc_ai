import { Skeleton } from '@/components/ui/skeleton';

export default function InvoiceDetailLoading() {
  return (
    <>
      <Skeleton className="h-6 w-24" />
      <div className="mt-4 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-xl bg-[var(--muted)] p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="mt-6">
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </>
  );
}
