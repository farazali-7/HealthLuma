"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────

export interface DoctorProfile {
  id: string;
  full_name: string;
  specialty: string | null;
  clinic_name: string | null;
  avatar_url: string | null;
}

export type AppointmentType =
  | "follow-up"
  | "consultation"
  | "checkup"
  | "prescription-review";

// ─── Doctors ─────────────────────────────────────────────────

/** All doctor profiles — shown in the booking modal doctor picker. */
export async function getDoctorsAction(): Promise<DoctorProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, specialty, clinic_name, avatar_url")
    .eq("role", "doctor")
    .order("full_name");
  return (data ?? []) as DoctorProfile[];
}

// ─── Availability ─────────────────────────────────────────────

/**
 * Returns free HH:MM strings for a given doctor on a given date.
 * Runs server-side so RLS on appointments is satisfied without leaking
 * other patients' data — only the time strings are returned.
 */
export async function getAvailableSlotsAction(
  doctorId: string,
  date: string // "YYYY-MM-DD"
): Promise<string[]> {
  const supabase = await createClient();

  // Parse day-of-week from the date string at noon UTC to avoid DST edge cases
  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();

  const { data: schedule } = await supabase
    .from("doctor_availability")
    .select("start_time, end_time, slot_duration_mins")
    .eq("doctor_id", doctorId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!schedule || schedule.length === 0) return [];

  // Use the SECURITY DEFINER function so we don't expose other patients' rows
  const { data: booked } = await supabase.rpc("get_booked_slots", {
    p_doctor_id: doctorId,
    p_date: date,
  });

  const bookedTimes = new Set<string>(
    (booked ?? []).map((b: { start_time: string }) => b.start_time)
  );

  const slots: string[] = [];
  for (const block of schedule) {
    const [sh, sm] = block.start_time.split(":").map(Number);
    const [eh, em] = block.end_time.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;
    const step = block.slot_duration_mins as number;

    for (let m = startMins; m < endMins; m += step) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }
  }

  return slots;
}

// ─── Booking ─────────────────────────────────────────────────

export interface BookAppointmentInput {
  doctor_id: string;
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string;       // "HH:MM"
  end_time: string;         // "HH:MM"
  type: AppointmentType;
  notes?: string;
  family_member_id?: string;
}

/** Insert a new appointment row for the authenticated patient. */
export async function bookAppointmentAction(
  input: BookAppointmentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Guard: slot must still be free (race-condition protection)
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", input.doctor_id)
    .eq("appointment_date", input.appointment_date)
    .eq("start_time", input.start_time)
    .not("status", "in", '("cancelled","no-show")')
    .maybeSingle();

  if (conflict) return { error: "This slot was just booked. Please pick another time." };

  const { error } = await supabase.from("appointments").insert({
    patient_id: user.id,
    ...input,
  });

  return { error: error?.message ?? null };
}
