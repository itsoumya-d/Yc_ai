import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <>
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>
      <div className="mt-8 space-y-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </>
  );
}
