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

  // Defense in depth: middleware handles this, but also enforce at layout level.
  // Fall back to JWT app_metadata role if DB is unreachable — avoids redirect loop.
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? (user.app_metadata?.role as string | undefined) ?? "patient";
  if (role === "doctor") redirect("/doctor");

  return (
    <UserProvider user={user} role="patient">
      <DashboardShell>{children}</DashboardShell>
    </UserProvider>
  );
}
