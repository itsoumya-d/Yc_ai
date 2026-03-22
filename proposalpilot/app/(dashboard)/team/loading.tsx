export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
      </div>
      {/* Team member rows */}
      <div className="bg-gray-100 rounded-xl overflow-hidden divide-y divide-gray-200">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20 shrink-0" />
            <div className="h-4 bg-gray-200 rounded w-28 shrink-0" />
            <div className="h-8 bg-gray-200 rounded-lg w-20 shrink-0" />
          </div>
        ))}
      </div>
      {/* Pending invites section */}
      <div className="space-y-3">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-100 rounded-xl p-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded-full w-16 shrink-0" />
              <div className="h-8 bg-gray-200 rounded-lg w-24 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
