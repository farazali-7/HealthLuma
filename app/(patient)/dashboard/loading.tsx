/**
 * Shown by Next.js while the server component (page.tsx) is fetching data.
 * Replaces the old client-side loading state + useEffect pattern.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div className="h-8 w-56 rounded-xl bg-muted/40" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5 h-64 rounded-2xl bg-muted/30" />
        <div className="lg:col-span-7 space-y-3">
          <div className="h-20 rounded-2xl bg-muted/30" />
          <div className="h-40 rounded-2xl bg-muted/30" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 h-64 rounded-2xl bg-muted/30" />
        <div className="lg:col-span-5 h-64 rounded-2xl bg-muted/30" />
      </div>
    </div>
  );
}
