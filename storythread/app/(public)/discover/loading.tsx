export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="border-b border-gray-200 bg-white h-14" />
      <div className="mx-auto max-w-6xl px-6 py-8 animate-pulse">
        <div className="text-center mb-8">
          <div className="h-10 w-64 rounded-lg bg-gray-200 mx-auto" />
          <div className="h-5 w-80 rounded bg-gray-100 mx-auto mt-2" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-gray-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full bg-gray-200" />
                <div className="h-3 w-20 rounded bg-gray-100" />
              </div>
              <div className="h-5 w-full rounded bg-gray-200 mb-1" />
              <div className="h-5 w-3/4 rounded bg-gray-200 mb-3" />
              <div className="space-y-1">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-5/6 rounded bg-gray-100" />
                <div className="h-3 w-4/6 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
