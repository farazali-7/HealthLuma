export default function DoctorDashboardLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-64 rounded-lg bg-muted/40" />
          <div className="mt-2 h-4 w-48 rounded bg-muted/30" />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-28 rounded-xl bg-muted/30" />
        ))}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="h-3 w-20 rounded bg-muted/40" />
            <div className="mt-3 h-6 w-12 rounded bg-muted/40" />
            <div className="mt-2 h-3 w-16 rounded bg-muted/30" />
          </div>
        ))}
      </div>

      {/* Queue + Notes */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="h-3 w-12 rounded bg-muted/40" />
            <div className="mt-1 h-4 w-28 rounded bg-muted/30" />
          </div>
          <div className="divide-y divide-border/50">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3.5" style={{ opacity: 1 - i * 0.25 }}>
                <div className="size-5 rounded-full bg-muted/40" />
                <div className="size-9 rounded-xl bg-muted/40" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-muted/40" />
                  <div className="h-3 w-20 rounded bg-muted/30" />
                </div>
                <div className="h-3 w-16 rounded bg-muted/30" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="h-3 w-12 rounded bg-muted/40" />
            <div className="mt-1 h-4 w-28 rounded bg-muted/30" />
          </div>
          <div className="divide-y divide-border/50">
            {[1, 2].map((i) => (
              <div key={i} className="px-5 py-4" style={{ opacity: 1 - i * 0.4 }}>
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-muted/40" />
                  <div className="h-3.5 flex-1 rounded bg-muted/40" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-full rounded bg-muted/30" />
                  <div className="h-3 w-3/4 rounded bg-muted/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
