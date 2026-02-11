import { Skeleton } from '@/components/ui/skeleton';

export default function ClientDetailLoading() {
  return (
    <>
      <Skeleton className="h-6 w-24" />
      <div className="mt-4 flex items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </>
  );
}
