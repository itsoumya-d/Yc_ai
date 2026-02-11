import { Skeleton } from '@/components/ui/skeleton';

export default function StoryDetailLoading() {
  return (
    <div>
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-12 rounded-md" />
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-8 h-10 w-80" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
