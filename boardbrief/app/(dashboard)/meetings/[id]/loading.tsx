export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-[var(--border-default)]" />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="h-48 rounded-xl bg-[var(--bg-surface)]" />
          <div className="h-64 rounded-xl bg-[var(--bg-surface)]" />
        </div>
        <div className="space-y-4">
          <div className="h-40 rounded-xl bg-[var(--bg-surface)]" />
          <div className="h-32 rounded-xl bg-[var(--bg-surface)]" />
        </div>
      </div>
    </div>
  );
}
