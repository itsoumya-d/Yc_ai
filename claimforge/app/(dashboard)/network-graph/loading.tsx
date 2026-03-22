export default function Loading() {
  return (
    <div className="animate-pulse p-6 space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/4" />
      <div className="h-[500px] bg-gray-200 rounded-lg" />
      <div className="flex gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded w-24" />
        ))}
      </div>
    </div>
  )
}
