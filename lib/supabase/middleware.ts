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

    if (profileError || !profile) {
      console.error("[middleware] profile fetch error — code:", profileError?.code, "| msg:", profileError?.message);

      // PGRST116 = no rows: user row missing, auto-heal with service role
      if (profileError?.code === "PGRST116") {
        const svc = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { cookies: { getAll: () => [], setAll: () => {} } }
        );
        const { error: upsertError } = await svc.from("users").upsert(
          {
            id:        user.id,
            email:     user.email ?? "",
            full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
            role:      "patient",
          },
          { onConflict: "id" }
        );
        if (upsertError) {
          console.error("[middleware] upsert failed — code:", upsertError.code, "| msg:", upsertError.message);
          if (isProtected) return redirectTo("/login", { error: "profile_not_found" });
          return supabaseResponse;
        }
        // Row created — treat as patient and continue
        if (isAuthRoute)   return redirectTo("/dashboard");
        if (isDoctorRoute) return redirectTo("/dashboard");
        return supabaseResponse;
      }

      // Any other error (e.g. table missing, network) — block protected routes
      if (isProtected) return redirectTo("/login", { error: "profile_not_found" });
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
