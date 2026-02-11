import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <Skeleton className="mx-auto h-8 w-40" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
      </div>
      <Skeleton className="h-80 rounded-xl" />
    </div>
  );
}
