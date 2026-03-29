export default function SettingsLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div>
        <div className="h-8 w-28 rounded-lg bg-muted/50" />
        <div className="mt-2 h-4 w-72 rounded bg-muted/30" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
              <div className="size-10 rounded-xl bg-muted/40 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 rounded bg-muted/40" />
                <div className="h-3 w-32 rounded bg-muted/30" />
              </div>
            </div>
            <div className="space-y-0.5 p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                  <div className="size-7 rounded-lg bg-muted/40" />
                  <div className="h-3.5 w-20 rounded bg-muted/30" />
                </div>
              ))}
            </div>
            <div className="border-t border-border/60 p-2">
              <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                <div className="size-7 rounded-lg bg-muted/30" />
                <div className="h-3.5 w-16 rounded bg-muted/20" />
              </div>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="space-y-4 lg:col-span-9">
          {/* Profile card skeleton */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded bg-muted/40" />
                <div className="h-3 w-52 rounded bg-muted/30" />
              </div>
              <div className="h-8 w-16 rounded-lg bg-muted/30" />
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-5">
                <div className="size-20 rounded-2xl bg-muted/40 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-36 rounded bg-muted/40" />
                  <div className="flex gap-2">
                    <div className="h-5 w-24 rounded-full bg-muted/30" />
                    <div className="h-5 w-20 rounded-full bg-muted/20" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-20 rounded bg-muted/30" />
                    <div className="h-10 rounded-xl bg-muted/20" />
                  </div>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="h-3 w-16 rounded bg-muted/30" />
                    <div className="h-10 rounded-xl bg-muted/20" />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="h-3 w-16 rounded bg-muted/30" />
                <div className="h-20 rounded-xl bg-muted/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
