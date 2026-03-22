export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-6" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-64" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-36" />
      </div>
      <div className="space-y-2">
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    </div>
  );
}
