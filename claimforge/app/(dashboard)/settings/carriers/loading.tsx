export default function CarriersLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <div className="h-5 w-48 animate-pulse rounded bg-bg-surface-raised" />
          <div className="mt-1.5 h-3.5 w-72 animate-pulse rounded bg-bg-surface-raised" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-lg bg-bg-surface-raised" />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-4 gap-4 max-w-4xl">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default bg-bg-surface p-4">
              <div className="h-3 w-16 animate-pulse rounded bg-bg-surface-raised" />
              <div className="mt-2 h-6 w-10 animate-pulse rounded bg-bg-surface-raised" />
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-3 max-w-4xl">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border-default bg-bg-surface p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-bg-surface-raised" />
                <div className="flex-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-bg-surface-raised" />
                  <div className="mt-1 h-3 w-48 animate-pulse rounded bg-bg-surface-raised" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
