export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 bg-gray-200 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 bg-gray-200 rounded-full w-16" />
              <div className="h-6 bg-gray-200 rounded-full w-20" />
            </div>
            <div className="h-9 bg-gray-200 rounded-lg w-full mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
