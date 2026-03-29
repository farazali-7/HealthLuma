export default function RecordsLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div>
        <div className="h-8 w-40 rounded-lg bg-muted/50" />
        <div className="mt-2 flex items-center gap-4">
          <div className="h-4 w-40 rounded bg-muted/30" />
          <div className="h-4 w-32 rounded bg-muted/30" />
        </div>
      </div>
      {/* Search */}
      <div className="h-9 w-full max-w-xs rounded-xl bg-muted/30" />
      {/* Tabs */}
      <div className="h-9 w-64 rounded-xl bg-muted/30" />
      {/* Cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <div className="flex gap-4">
              <div className="size-11 shrink-0 rounded-xl bg-muted/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-muted/50" />
                <div className="h-3 w-1/2 rounded bg-muted/40" />
                <div className="h-3 w-2/5 rounded bg-muted/30" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
