// ============================================================
// HealthLuma — Structured Server Logger
//
// Used exclusively in server-side code (server actions, route handlers).
// Never import in Client Components.
//
// Output format (JSON on one line for log aggregators):
//   [2026-03-30T…] [ERROR] [actionName] {"timestamp":…,"action":…,"message":…}
//
// In development the stack trace is included.
// In production the stack is omitted to keep logs clean.
// ============================================================

const isDev = process.env.NODE_ENV !== "production";

type LogContext = Record<string, string | number | boolean | null | undefined>;

function formatEntry(
  level: "ERROR" | "WARN",
  action: string,
  error: unknown,
  context?: LogContext
): string {
  const message =
    error instanceof Error ? error.message : String(error ?? "Unknown error");

  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    action,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  // Include stack in dev only — never leak internal paths in prod logs
  if (isDev && error instanceof Error && error.stack) {
    entry.stack = error.stack;
  }

  return JSON.stringify(entry);
}

export const logger = {
  /**
   * Log an unexpected error from a server action or route handler.
   *
   * @param action  Name of the server action / function (e.g. "cancelAppointmentAction")
   * @param error   The caught error or Supabase error object
   * @param context Safe key-value pairs for debugging — NEVER include PII or secrets
   *
   * @example
   * } catch (err) {
   *   logger.error("cancelAppointmentAction", err, { appointmentId: id });
   *   return { error: "An unexpected error occurred. Please try again." };
   * }
   */
  error(action: string, error: unknown, context?: LogContext): void {
    const line = formatEntry("ERROR", action, error, context);
    console.error(`[${new Date().toISOString()}] [ERROR] [${action}]`, line);
  },

  /**
   * Log a non-fatal warning (e.g. a recoverable Supabase error on a read query).
   */
  warn(action: string, error: unknown, context?: LogContext): void {
    const line = formatEntry("WARN", action, error, context);
    console.warn(`[${new Date().toISOString()}] [WARN]  [${action}]`, line);
  },
};
