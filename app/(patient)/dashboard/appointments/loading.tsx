export default function Loading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 rounded-lg bg-muted/50" />
          <div className="h-4 w-64 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-36 rounded-xl bg-muted/40" />
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4">
            <div className="h-2.5 w-16 rounded-full bg-muted/40" />
            <div className="mt-2 h-7 w-10 rounded-lg bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-9 w-72 rounded-xl bg-muted/40" />
        <div className="h-9 w-64 rounded-xl bg-muted/30" />
      </div>

      {/* Appointment cards */}
      <div className="space-y-2.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5"
            style={{ opacity: 1 - i * 0.2 }}
          >
            <div className="flex gap-4">
              <div className="w-14 shrink-0 rounded-xl bg-muted/40 h-16" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded-md bg-muted/40" />
                <div className="h-3 w-48 rounded-md bg-muted/30" />
                <div className="h-3 w-20 rounded-md bg-muted/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
