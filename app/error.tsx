"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="size-5 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred. Please try again, or return home if the
          problem persists.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
          >
            <Home className="size-3.5" />
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
