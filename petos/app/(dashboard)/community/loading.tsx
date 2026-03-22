export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-9 bg-gray-200 rounded-lg w-28" />
      </div>
      {/* Compose bar */}
      <div className="h-14 bg-gray-100 rounded-xl w-full" />
      {/* Post feed */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-5 space-y-4">
            {/* Author row */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-3 bg-gray-200 rounded w-1/6" />
              </div>
            </div>
            {/* Post body */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-11/12" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
            {/* Image placeholder (occasional) */}
            {i % 2 === 0 && (
              <div className="h-48 bg-gray-200 rounded-lg w-full" />
            )}
            {/* Reactions row */}
            <div className="flex gap-6 pt-1">
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
