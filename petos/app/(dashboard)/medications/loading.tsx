export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-lg w-36" />
      </div>
      {/* Summary stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-7 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
      {/* Medication rows */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-4 bg-gray-100 rounded-xl p-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-8 bg-gray-200 rounded-lg w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
