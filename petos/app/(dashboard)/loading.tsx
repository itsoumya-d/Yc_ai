export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse px-0">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-52 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-80 rounded-md bg-gray-100 dark:bg-gray-700/60" />
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      {/* Main content block */}
      <div className="h-72 rounded-2xl bg-gray-100 dark:bg-gray-800" />
      {/* Secondary row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="h-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
  );
}
