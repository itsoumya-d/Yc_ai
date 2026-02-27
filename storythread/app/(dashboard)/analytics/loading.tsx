export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div>
        <div className="h-7 w-48 rounded-lg bg-[var(--muted)]" />
        <div className="mt-1 h-4 w-72 rounded bg-[var(--muted)]" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--muted)]" />
            <div className="h-7 w-16 rounded bg-[var(--muted)]" />
            <div className="h-3 w-12 rounded bg-[var(--muted)]" />
          </div>
        ))}
      </div>
      {/* Chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="h-5 w-56 rounded bg-[var(--muted)] mb-4" />
        <div className="flex items-end gap-1 h-32">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--muted)]"
              style={{ height: `${Math.random() * 80 + 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
