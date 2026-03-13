"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────

export interface ScheduleRow {
  day_of_week: number;       // 0 = Sunday … 6 = Saturday
  start_time: string;        // "HH:MM"
  end_time: string;          // "HH:MM"
  slot_duration_mins: number;
  is_active: boolean;
}

// ─── Read ─────────────────────────────────────────────────────

/** Fetch the authenticated doctor's weekly availability rows. */
export async function getDoctorScheduleAction(): Promise<ScheduleRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("doctor_availability")
    .select("day_of_week, start_time, end_time, slot_duration_mins, is_active")
    .eq("doctor_id", user.id)
    .order("day_of_week");

  return (data ?? []) as ScheduleRow[];
}

// ─── Write ────────────────────────────────────────────────────

/**
 * Upsert all 7 day rows for the authenticated doctor.
 * The unique constraint on (doctor_id, day_of_week) makes this idempotent.
 */
export async function saveDoctorScheduleAction(
  rows: ScheduleRow[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("doctor_availability")
    .upsert(
      rows.map((r) => ({ doctor_id: user.id, ...r })),
      { onConflict: "doctor_id,day_of_week" }
    );

  return { error: error?.message ?? null };
}
