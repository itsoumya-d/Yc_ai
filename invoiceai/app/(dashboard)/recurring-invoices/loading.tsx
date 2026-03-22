export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Page title + new button */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-10 bg-gray-200 rounded-lg w-36" />
      </div>

      {/* Filter / status tabs */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-full w-24" />
        ))}
      </div>

      {/* Table header */}
      <div className="h-10 bg-gray-100 rounded-lg" />

      {/* Recurring invoice table rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex items-center gap-4 h-14 bg-gray-200 rounded-lg px-4">
            <div className="h-4 bg-gray-300 rounded w-1/5" />
            <div className="h-4 bg-gray-300 rounded w-1/5" />
            <div className="h-4 bg-gray-300 rounded w-1/6" />
            <div className="h-4 bg-gray-300 rounded w-1/6" />
            <div className="h-6 bg-gray-300 rounded-full w-20 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
