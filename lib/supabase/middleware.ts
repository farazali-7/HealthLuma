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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isPatientRoute = pathname.startsWith("/dashboard");
  const isDoctorRoute = pathname.startsWith("/doctor");
  const isProtected = isPatientRoute || isDoctorRoute;

  // Copy refreshed session cookies into any redirect we return, so the
  // browser always receives the latest access/refresh tokens.
  function redirectTo(pathname: string, params?: Record<string, string>): NextResponse {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
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

  // Unauthenticated user hitting a protected route → login
  if (!user && isProtected) {
    return redirectTo("/login");
  }

  // Authenticated user: fetch role for routing decisions
  if (user && (isAuthRoute || isProtected)) {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Profile row missing or unreadable.
    // On a protected route → block access (redirect to login).
    // On an auth route (/login, /signup) → let the page handle it; don't
    // loop by redirecting back to login while already on login.
    if (profileError || !profile) {
      console.error("[middleware] role fetch failed:", profileError?.message);
      if (isProtected) {
        return redirectTo("/login", { error: "profile_not_found" });
      }
      return supabaseResponse;
    }

    const role = profile.role;

    // Auth page → redirect to their dashboard
    if (isAuthRoute) {
      return redirectTo(role === "doctor" ? "/doctor" : "/dashboard");
    }

    // Patient trying to access /doctor → send to /dashboard
    if (isDoctorRoute && role === "patient") {
      return redirectTo("/dashboard");
    }

    // Doctor trying to access /dashboard → send to /doctor
    if (isPatientRoute && role === "doctor") {
      return redirectTo("/doctor");
    }
  }

  return supabaseResponse;
}
