export default function Loading() {
  return (
    <div className="max-w-2xl space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[var(--border-default)]" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 rounded bg-[var(--border-default)]" />
          <div className="h-10 rounded-xl bg-[var(--bg-surface)]" />
        </div>
      ))}
      <div className="h-10 w-32 rounded-xl bg-[var(--border-default)]" />
    </div>
  );
}
