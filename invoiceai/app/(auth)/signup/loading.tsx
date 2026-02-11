import { Skeleton } from '@/components/ui/skeleton';

export default function SignupLoading() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-2 h-4 w-56" />
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
