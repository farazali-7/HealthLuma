// ============================================================
// HealthLuma — Environment Variable Validation
//
// Validates required env vars at module-load time.
// The app throws immediately on startup if any are missing
// instead of crashing silently at runtime with a cryptic error.
//
// USAGE:
//   import { env } from "@/lib/env";          // public vars (safe everywhere)
//   import { serverEnv } from "@/lib/env";    // includes service-role key
//                                              // ⚠️  server-side only
//
// Do NOT import serverEnv in:
//   • Client Components
//   • lib/supabase/client.ts  (browser bundle)
//   • middleware.ts            (only needs public vars)
// ============================================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `\n\n[HealthLuma] Missing required environment variable: "${name}"\n` +
      `  → Add it to .env.local for local development.\n` +
      `  → Add it to your deployment environment (Vercel / Railway / etc.).\n`
    );
  }
  return value;
}

// ── Public variables ────────────────────────────────────────────
// NEXT_PUBLIC_* vars are baked into the client bundle at build time.
// These are safe to validate and use anywhere (server, edge, browser).

export const env = {
  SUPABASE_URL:      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
} as const;

// ── Server-only variables ───────────────────────────────────────
// These secrets must NEVER be sent to the browser.
// Only import serverEnv in server components, server actions,
// and route handlers — never in client components or middleware.

export const serverEnv = {
  ...env,
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  GROQ_API_KEY:              requireEnv("GROQ_API_KEY"),
} as const;
