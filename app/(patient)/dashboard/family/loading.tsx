export default function FamilyLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-muted/50" />
          <div className="h-4 w-64 rounded bg-muted/30" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5"
            style={{ opacity: 1 - i * 0.25 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-muted/40" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-muted/40" />
                <div className="h-3 w-16 rounded bg-muted/30" />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="h-2.5 w-12 rounded bg-muted/40" />
                  <div className="h-3.5 w-16 rounded bg-muted/30" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg bg-muted/30" />
              <div className="h-8 w-20 rounded-lg bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
