import { Skeleton } from '@/components/ui/skeleton';

export default function ProposalsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><Skeleton className="h-8 w-40" /><Skeleton className="h-10 w-36" /></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    </div>
  );
}
