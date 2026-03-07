import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await createClient();

  async function redirectByRole(): Promise<NextResponse> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    // Don't silently default to patient — surface the failure so it can be diagnosed
    if (profileError || !profile) {
      console.error("[auth/callback] role fetch failed:", profileError?.message);
      return NextResponse.redirect(`${origin}/login?error=profile_not_found`);
    }

    const destination = profile.role === "doctor" ? "/doctor" : "/dashboard";
    return NextResponse.redirect(`${origin}${destination}`);
  }

  // Handle OAuth code exchange (Google login, etc.)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectByRole();
  }

  // Handle email confirmation / magic link token hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "email",
    });
    if (!error) return redirectByRole();
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
