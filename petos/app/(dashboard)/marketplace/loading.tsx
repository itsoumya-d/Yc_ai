export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
      </div>
      {/* Category filter pills */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 bg-gray-200 rounded-full w-20" />
        ))}
      </div>
      {/* Service card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl overflow-hidden">
            <div className="h-40 bg-gray-200 w-full" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-5 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded-lg w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
