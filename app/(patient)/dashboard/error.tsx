"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[DashboardError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Dashboard error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We couldn&apos;t load this section. Try refreshing, or navigate to
          another part of your dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            <LayoutDashboard className="size-3.5" />
            Dashboard home
          </button>
        </div>
      </div>
    </div>
  );
}
