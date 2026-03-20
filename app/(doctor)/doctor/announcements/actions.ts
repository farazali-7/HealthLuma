"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
// sendNotification imported for future per-patient notification on publish
import { sendNotification as _sendNotification } from "@/lib/supabase/service";

// ─── Types ─────────────────────────────────────────────────────

export type AnnouncementStatus = "published" | "draft" | "scheduled";
export type AudienceType = "all" | "pro";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AudienceType;
  status: AnnouncementStatus;
  scheduled_at: string | null;
  reads_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Queries ───────────────────────────────────────────────────

export async function getAnnouncementsAction(): Promise<{
  announcements: Announcement[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { announcements: [], error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, audience, status, scheduled_at, reads_count, created_at, updated_at")
    .eq("doctor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { announcements: [], error: error.message };
  }

  return { announcements: (data ?? []) as Announcement[], error: null };
}

// ─── Mutations ─────────────────────────────────────────────────

export async function createAnnouncementAction(input: {
  title: string;
  body: string;
  audience: AudienceType;
  status: AnnouncementStatus;
  scheduled_at?: string | null;
}): Promise<{ error: string | null }> {
  if (!input.title?.trim()) return { error: "Title is required." };
  if (!input.body?.trim())  return { error: "Message body is required." };
  if (input.status === "scheduled" && !input.scheduled_at) {
    return { error: "A scheduled date/time is required." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("announcements").insert({
    doctor_id:    user.id,
    title:        input.title.trim(),
    body:         input.body.trim(),
    audience:     input.audience,
    status:       input.status,
    scheduled_at: input.scheduled_at ?? null,
    published:    input.status === "published",
  });

  if (error) return { error: error.message };

  revalidatePath("/doctor/announcements");
  return { error: null };
}

export async function updateAnnouncementAction(
  id: string,
  input: Partial<{
    title: string;
    body: string;
    audience: AudienceType;
    status: AnnouncementStatus;
    scheduled_at: string | null;
  }>
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing announcement ID." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  if (input.title      !== undefined) updates.title        = input.title.trim();
  if (input.body       !== undefined) updates.body         = input.body.trim();
  if (input.audience   !== undefined) updates.audience     = input.audience;
  if (input.scheduled_at !== undefined) updates.scheduled_at = input.scheduled_at;
  if (input.status     !== undefined) {
    updates.status    = input.status;
    updates.published = input.status === "published";
  }

  const { error } = await supabase
    .from("announcements")
    .update(updates)
    .eq("id",        id)
    .eq("doctor_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/doctor/announcements");
  return { error: null };
}

export async function deleteAnnouncementAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing announcement ID." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id",        id)
    .eq("doctor_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/doctor/announcements");
  return { error: null };
}

// _sendNotification is available for future per-patient notification on publish.
