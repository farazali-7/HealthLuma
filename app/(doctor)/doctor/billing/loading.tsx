export default function BillingLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded-lg bg-muted/50" />
          <div className="h-4 w-64 rounded bg-muted/30" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-muted/30" />
      </div>
      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="h-2.5 w-24 rounded-full bg-muted/50" />
              <div className="size-6 rounded-lg bg-muted/50" />
            </div>
            <div className="mt-3 h-6 w-20 rounded-full bg-muted/50" />
            <div className="mt-2 h-3 w-28 rounded-full bg-muted/30" />
          </div>
        ))}
      </div>
      {/* Chart + Invoices row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="h-4 w-28 rounded bg-muted/40" />
          </div>
          <div className="m-5 h-52 rounded-xl bg-muted/30" />
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <div className="h-4 w-20 rounded bg-muted/40" />
          </div>
          <div className="divide-y divide-border/50">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="size-8 shrink-0 rounded-lg bg-muted/50" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 rounded-full bg-muted/50" />
                  <div className="h-2.5 w-20 rounded-full bg-muted/40" />
                </div>
                <div className="shrink-0 space-y-1.5 text-right">
                  <div className="h-3 w-10 rounded-full bg-muted/50" />
                  <div className="h-2.5 w-12 rounded-full bg-muted/40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
