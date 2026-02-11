import { Skeleton } from '@/components/ui/skeleton';

export default function NewPetLoading() {
  return (
    <div>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-64" />
      <Skeleton className="mt-6 h-[500px] rounded-xl" />
    </div>
  );
}
