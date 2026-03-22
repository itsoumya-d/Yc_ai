export default function CarrierClaimLoading() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <div className="h-5 w-56 animate-pulse rounded bg-bg-surface-raised" />
          <div className="mt-1.5 h-3.5 w-40 animate-pulse rounded bg-bg-surface-raised" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full bg-bg-surface-raised" />
          <div className="h-9 w-20 animate-pulse rounded-lg bg-bg-surface-raised" />
          <div className="h-9 w-28 animate-pulse rounded-lg bg-bg-surface-raised" />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl space-y-6">
          <div className="rounded-xl border border-border-default bg-bg-surface p-5">
            <div className="h-4 w-40 animate-pulse rounded bg-bg-surface-raised" />
            <div className="mt-2 h-3 w-72 animate-pulse rounded bg-bg-surface-raised" />
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border-muted pt-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-2.5 w-16 animate-pulse rounded bg-bg-surface-raised" />
                  <div className="mt-1.5 h-4 w-28 animate-pulse rounded bg-bg-surface-raised" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 w-40 animate-pulse rounded bg-bg-surface-raised" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 pb-4">
                <div className="h-7 w-7 animate-pulse rounded-full bg-bg-surface-raised" />
                <div className="flex-1">
                  <div className="h-4 w-40 animate-pulse rounded bg-bg-surface-raised" />
                  <div className="mt-1 h-3 w-56 animate-pulse rounded bg-bg-surface-raised" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
