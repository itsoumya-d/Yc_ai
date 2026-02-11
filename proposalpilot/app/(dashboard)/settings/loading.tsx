import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-64 mt-2" /></div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
