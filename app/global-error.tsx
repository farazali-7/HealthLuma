"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            padding: "2.5rem 2rem",
            borderRadius: "1.25rem",
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            boxShadow: "0 4px 24px 0 rgba(0,0,0,0.07)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: 22,
            }}
          >
            ⚠
          </div>
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              marginBottom: "1.5rem",
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "0.75rem",
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
