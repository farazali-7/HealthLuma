import { createClient } from "./server";

export type UserRole = "patient" | "doctor";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const profile = await getUserProfile(userId);
  return profile?.role ?? "patient";
}
