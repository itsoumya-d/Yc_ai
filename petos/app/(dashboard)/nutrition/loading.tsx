export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      {/* Chart placeholder */}
      <div className="bg-gray-100 rounded-xl p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded-lg w-full" />
        {/* Chart x-axis labels */}
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-8" />
          ))}
        </div>
      </div>
      {/* Nutrition table */}
      <div className="bg-gray-100 rounded-xl overflow-hidden">
        <div className="flex gap-4 p-4 border-b border-gray-200">
          {['Date', 'Food', 'Calories', 'Protein', 'Fat'].map((col) => (
            <div key={col} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
        <div className="space-y-0 divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-4 p-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
