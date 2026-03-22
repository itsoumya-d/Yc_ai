export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="h-20 w-20 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1">
          {/* Display name */}
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          {/* Bio */}
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          {/* Stats row */}
          <div className="flex gap-6 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-5 bg-gray-200 rounded w-10" />
                <div className="h-3 bg-gray-200 rounded w-14" />
              </div>
            ))}
          </div>
        </div>
        {/* Edit button */}
        <div className="h-9 bg-gray-200 rounded-lg w-24 flex-shrink-0" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-6 border-b border-gray-200 pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 bg-gray-200 rounded w-20" />
        ))}
      </div>

      {/* Published story cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-3 space-y-3">
            <div className="h-36 bg-gray-200 rounded-lg" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}
