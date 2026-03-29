export default function AppointmentsLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted/50" />
          <div className="h-4 w-40 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-28 rounded-xl bg-muted/30" />
      </div>
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="h-2.5 w-24 rounded-full bg-muted/50" />
            <div className="mt-3 h-7 w-10 rounded-lg bg-muted/40" />
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="h-10 w-64 rounded-xl bg-muted/30" />
        <div className="h-10 w-80 rounded-xl bg-muted/30" />
      </div>
      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/50 px-5 py-4 last:border-0" style={{ opacity: 1 - i * 0.18 }}>
            <div className="size-9 shrink-0 rounded-xl bg-muted/40" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 rounded bg-muted/40" />
              <div className="h-3 w-24 rounded bg-muted/30" />
            </div>
            <div className="hidden sm:block h-3 w-16 rounded bg-muted/30" />
            <div className="hidden sm:block h-3 w-20 rounded bg-muted/30" />
            <div className="hidden sm:block h-5 w-20 rounded-full bg-muted/30" />
            <div className="hidden sm:block h-6 w-24 rounded-lg bg-muted/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
