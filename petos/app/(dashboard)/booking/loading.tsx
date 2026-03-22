export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar panel */}
        <div className="lg:col-span-2 bg-gray-100 rounded-xl p-5 space-y-4">
          {/* Month header */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
              <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            </div>
          </div>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded" />
            ))}
          </div>
          {/* Calendar grid — 5 weeks */}
          {[1, 2, 3, 4, 5].map((week) => (
            <div key={week} className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div key={day} className="h-10 bg-gray-200 rounded-lg" />
              ))}
            </div>
          ))}
        </div>
        {/* Time slots panel */}
        <div className="bg-gray-100 rounded-xl p-5 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-full" />
            ))}
          </div>
          <div className="h-10 bg-gray-300 rounded-lg w-full mt-4" />
        </div>
      </div>
    </div>
  )
}
