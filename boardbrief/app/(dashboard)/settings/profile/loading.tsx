export default function ProfileLoading() {
  return (
    <div className="max-w-2xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
