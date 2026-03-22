export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-6" />
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-56" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}
