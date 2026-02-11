import { Skeleton } from '@/components/ui/skeleton';

export default function ChapterLoading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
      <Skeleton className="mb-4 h-10 w-64" />
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </div>
  );
}
