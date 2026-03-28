import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Required: validates the session and refreshes tokens when expired.
  // This is the ONLY Supabase call in middleware — no DB queries.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute    = pathname === "/login" || pathname === "/signup";
  const isPatientRoute = pathname.startsWith("/dashboard");
  const isDoctorRoute  = pathname.startsWith("/doctor");
  const isProtected    = isPatientRoute || isDoctorRoute;

  // Copies refreshed session cookies into any redirect response so the
  // browser always receives the latest access/refresh tokens.
  function redirectTo(
    path: string,
    params?: Record<string, string>
  ): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      res.cookies.set(name, value);
    });
    return res;
  }

  // ── Unauthenticated ──────────────────────────────────────────
  if (!user && isProtected) {
    return redirectTo("/login");
  }

  // ── Authenticated: role-based routing ───────────────────────
  // Role is injected into app_metadata by the JWT hook
  // (see supabase/migrations/20260328000002_jwt_role_hook.sql).
  // Reading from the JWT token — NO database query.
  if (user && (isAuthRoute || isProtected)) {
    const role = (user.app_metadata?.role as string | undefined) ?? "patient";

    // Logged-in user visiting /login or /signup → send to their dashboard
    if (isAuthRoute) {
      return redirectTo(role === "doctor" ? "/doctor" : "/dashboard");
    }

    // Patient trying to access /doctor → send to patient dashboard
    if (isDoctorRoute && role === "patient") {
      return redirectTo("/dashboard");
    }

    // Doctor trying to access /dashboard → send to doctor dashboard
    if (isPatientRoute && role === "doctor") {
      return redirectTo("/doctor");
    }
  }

  return supabaseResponse;
}
