export default function Loading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-lg w-48" />
      <div className="h-4 bg-gray-100 rounded w-56" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

