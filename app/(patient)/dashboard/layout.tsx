import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "./context";
import { DashboardShell } from "./_shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Defense in depth: middleware handles this, but also enforce at layout level
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Profile fetch failed — don't silently assume patient role
  if (profileError || !profile) redirect("/login?error=profile_not_found");
  if (profile!.role === "doctor") redirect("/doctor");

  return (
    <UserProvider user={user} role="patient">
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
