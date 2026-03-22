export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Page title + mark-all-read */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded-lg w-28" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-full w-24" />
        ))}
      </div>

      {/* Notification rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-gray-100 rounded-xl p-4">
            {/* Avatar */}
            <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            {/* Unread dot placeholder */}
            <div className="h-3 w-3 bg-gray-200 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
