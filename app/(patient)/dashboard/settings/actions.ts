"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error: string | null };

// ── Fetch ───────────────────────────────────────────────────────

export interface SettingsProfile {
  full_name:                  string | null;
  email:                      string | null;
  phone:                      string | null;
  date_of_birth:              string | null;
  avatar_url:                 string | null;
  blood_type:                 string | null;
  gender:                     string | null;
  smoking_status:             string | null;
  allergies:                  string | null;
  chronic_conditions:         string | null;
  other_medications:          string | null;
  emergency_contact_name:     string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone:    string | null;
  notification_preferences:   Record<string, boolean> | null;
}

export async function getSettingsDataAction(): Promise<SettingsProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select(`
      full_name,
      phone,
      date_of_birth,
      avatar_url,
      blood_type,
      gender,
      smoking_status,
      allergies,
      chronic_conditions,
      other_medications,
      emergency_contact_name,
      emergency_contact_relation,
      emergency_contact_phone,
      notification_preferences
    `)
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  // avatar_url now stores a storage path. Generate a short-lived signed URL
  // so the client always receives a usable HTTPS URL, never a storage path.
  let avatarUrl = (data as any).avatar_url as string | null;
  if (avatarUrl && !avatarUrl.startsWith("http")) {
    const { data: signed } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarUrl, 3600);
    avatarUrl = signed?.signedUrl ?? null;
  }

  return {
    ...(data as any),
    avatar_url: avatarUrl,
    email: user.email ?? null,
  } as SettingsProfile;
}

// ── Targeted updates ────────────────────────────────────────────

export async function updatePersonalInfoAction(payload: {
  full_name:     string | null;
  phone:         string | null;
  date_of_birth: string | null;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function updateMedicalProfileAction(payload: {
  blood_type:         string | null;
  gender:             string | null;
  smoking_status:     string | null;
  allergies:          string | null;
  chronic_conditions: string | null;
  other_medications:  string | null;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

export async function updateEmergencyContactAction(payload: {
  emergency_contact_name:     string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone:    string | null;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

// ── Profile ────────────────────────────────────────────────────

export async function updateProfileAction(payload: {
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  blood_type: string | null;
  gender: string | null;
  smoking_status: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  other_medications: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update(payload)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

// Called after the client uploads to Supabase Storage to persist the URL.
export async function updateAvatarUrlAction(
  avatarUrl: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/settings");
  return { error: null };
}

// ── Notifications ──────────────────────────────────────────────

export async function updateNotificationPreferencesAction(
  preferences: Record<string, boolean>
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update({ notification_preferences: preferences })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

// ── Security ───────────────────────────────────────────────────

/**
 * Password change — client must first re-authenticate (signInWithPassword) to
 * confirm the user knows their current password. This action only runs the
 * actual update on Supabase Auth.
 */
export async function updatePasswordAction(payload: {
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  if (!payload.newPassword || payload.newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }
  if (payload.newPassword !== payload.confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: payload.newPassword,
  });
  if (error) return { error: error.message };
  return { error: null };
}

// ── Auth ───────────────────────────────────────────────────────

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Delete account — signs out the current session.
 * Full auth record deletion requires service_role; implement via
 * an API route (/api/account/delete) when Stripe offboarding is ready.
 */
export async function deleteAccountAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login?message=account_deleted");
}
