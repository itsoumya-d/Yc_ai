export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="rounded-2xl border bg-white p-5" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full skeleton" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-24 rounded skeleton" />
              <div className="h-3 w-16 rounded skeleton" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full rounded skeleton" />
            <div className="h-4 w-5/6 rounded skeleton" />
            <div className="h-4 w-4/6 rounded skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
