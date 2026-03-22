export default function Loading() {
  return (
    <div className="animate-pulse p-6 max-w-2xl mx-auto space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-8" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full" />
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 mt-6" />
    </div>
  );
}
