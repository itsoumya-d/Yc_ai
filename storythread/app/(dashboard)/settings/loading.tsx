import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2 h-4 w-40" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
