import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
