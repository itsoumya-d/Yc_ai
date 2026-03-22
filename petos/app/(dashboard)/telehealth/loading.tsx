export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-28" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
