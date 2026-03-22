export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mt-2" />
        </div>
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-full w-24" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      ))}
    </div>
  );
}
