export default function BillingLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div>
        <div className="h-8 w-28 rounded-lg bg-muted/40" />
        <div className="mt-2 h-4 w-64 rounded bg-muted/30" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="h-5 w-40 rounded bg-muted/40 mb-4" />
            <div className="h-4 w-full rounded bg-muted/30 mb-2" />
            <div className="h-4 w-3/4 rounded bg-muted/30 mb-5" />
            <div className="grid grid-cols-2 rounded-xl bg-muted/30 overflow-hidden">
              <div className="p-4"><div className="h-6 w-8 rounded bg-muted/40 mx-auto mb-1" /><div className="h-3 w-20 rounded bg-muted/30 mx-auto" /></div>
              <div className="p-4"><div className="h-6 w-16 rounded bg-muted/40 mx-auto mb-1" /><div className="h-3 w-20 rounded bg-muted/30 mx-auto" /></div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/60 px-5 py-4"><div className="h-4 w-20 rounded bg-muted/40" /></div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5" style={{ opacity: 1 - i * 0.2 }}>
                <div className="size-9 rounded-xl bg-muted/40 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-48 rounded bg-muted/40" />
                  <div className="h-3 w-32 rounded bg-muted/30" />
                </div>
                <div className="h-4 w-12 rounded bg-muted/30" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm h-64" />
        </div>
      </div>
    </div>
  );
}
