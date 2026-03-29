export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="h-8 w-32 rounded-lg bg-muted/40" /><div className="mt-2 h-4 w-48 rounded bg-muted/30" /></div>
        <div className="h-9 w-56 rounded-xl bg-muted/30" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between"><div className="h-2.5 w-24 rounded-full bg-muted/50" /><div className="size-6 rounded-lg bg-muted/50" /></div>
            <div className="mt-3 h-6 w-16 rounded-full bg-muted/50" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7"><div className="border-b border-border/60 px-5 py-4"><div className="h-4 w-28 rounded bg-muted/40" /></div><div className="m-5 h-48 rounded-xl bg-muted/30" /></div>
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5"><div className="border-b border-border/60 px-5 py-4"><div className="h-4 w-28 rounded bg-muted/40" /></div><div className="m-5 h-32 rounded-xl bg-muted/30" /></div>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5"><div className="border-b border-border/60 px-5 py-4"><div className="h-4 w-28 rounded bg-muted/40" /></div><div className="m-5 h-44 rounded-xl bg-muted/30" /></div>
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7"><div className="border-b border-border/60 px-5 py-4"><div className="h-4 w-28 rounded bg-muted/40" /></div><div className="space-y-3 p-5">{[1,2,3,4].map(i=><div key={i} className="space-y-1.5"><div className="h-3 w-32 rounded-full bg-muted/50"/><div className="h-1.5 w-full rounded-full bg-muted/40"/></div>)}</div></div>
      </div>
    </div>
  );
}
