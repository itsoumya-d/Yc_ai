export default function CasesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-8 w-40 rounded-lg bg-gray-200" />
        <div className="h-8 w-28 rounded-lg bg-gray-200" />
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-5 space-y-2">
          <div className="flex justify-between">
            <div className="h-5 w-48 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded-full bg-gray-200" />
          </div>
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-1/2 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
