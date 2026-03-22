export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      {/* Page title + search */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded-lg w-1/3" />
      </div>

      {/* Genre filter chips */}
      <div className="flex gap-3 flex-wrap">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-full w-20" />
        ))}
      </div>

      {/* Story card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl overflow-hidden space-y-3 p-3">
            {/* Cover image */}
            <div className="h-44 bg-gray-200 rounded-lg" />
            {/* Title */}
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            {/* Author */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            {/* Stats row */}
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-16" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
