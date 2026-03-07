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

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  // Profile fetch failed — don't silently assume a role
  if (profileError || !profile) redirect("/login?error=profile_not_found");
  if (profile!.role !== "doctor") redirect("/dashboard");

  return (
    <UserProvider user={user} role="doctor">
      <DoctorShell>{children}</DoctorShell>
    </UserProvider>
  );
}
