export default function ProfileLoading() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="rounded-xl border border-red-100 dark:border-red-900/30 p-6 space-y-4">
        <div className="h-5 w-28 bg-red-100 dark:bg-red-900/30 rounded" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
