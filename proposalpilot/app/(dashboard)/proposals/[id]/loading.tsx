import { Skeleton } from '@/components/ui/skeleton';

export default function ProposalLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><Skeleton className="h-10 w-64" /><div className="flex gap-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-24" /></div></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
