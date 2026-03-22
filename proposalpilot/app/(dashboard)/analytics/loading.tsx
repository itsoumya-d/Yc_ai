export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      {/* KPI stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
      {/* Main bar chart */}
      <div className="bg-gray-100 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-200 rounded w-40" />
          <div className="h-8 bg-gray-200 rounded-lg w-28" />
        </div>
        <div className="flex items-end gap-2 h-48">
          {[65, 45, 80, 55, 90, 40, 70, 60, 85, 50, 75, 95].map((pct, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-t flex-1"
              style={{ height: `${pct}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
            <div key={m} className="h-3 bg-gray-200 rounded w-6" />
          ))}
        </div>
      </div>
      {/* Two smaller charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-5 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-36 bg-gray-200 rounded-lg w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
