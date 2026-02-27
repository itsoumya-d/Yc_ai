import { Skeleton } from '@/components/ui/skeleton';

export default function VaccinesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
