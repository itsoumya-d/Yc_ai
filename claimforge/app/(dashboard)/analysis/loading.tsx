export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-36 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
