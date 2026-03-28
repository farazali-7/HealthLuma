import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserProvider } from "@/lib/context/user-context";
import { DoctorShell } from "./_shell";

export default async function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // Fall back to JWT app_metadata if DB is unreachable — avoids redirect loop.
  const role = profile?.role ?? (user.app_metadata?.role as string | undefined) ?? "patient";
  if (role !== "doctor") redirect("/dashboard");

  return (
    <UserProvider user={user} role="doctor">
      <DoctorShell>{children}</DoctorShell>
    </UserProvider>
  );
}
