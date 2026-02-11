import { Skeleton } from '@/components/ui/skeleton';

export default function ContentLibraryLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72 mt-2" /></div>
      <Skeleton className="h-48 rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
