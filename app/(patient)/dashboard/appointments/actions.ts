"use server";

import { createClient }     from "@/lib/supabase/server";
import { sendNotification } from "@/lib/supabase/service";

// ─── Types ────────────────────────────────────────────────────────

export interface PatientAppointment {
  id: string;
  appointment_date: string;   // "YYYY-MM-DD"
  start_time: string;         // "HH:MM" 24-hour
  end_time: string;           // "HH:MM" 24-hour
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "no-show";
  notes: string | null;
  location: string;
  doctor: {
    id: string;
    full_name: string;
    specialty: string | null;
    clinic_name: string | null;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────

function fmtTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month:    "long",
    day:      "numeric",
    timeZone: "UTC",
  });
}

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Fetch all appointments for the authenticated patient,
 * joined with the doctor's public profile.
 * RLS guarantees patient_id = auth.uid().
 */
const PAGE_SIZE = 15;

export async function getPatientAppointmentsAction(
  page = 0
): Promise<{ data: PatientAppointment[]; hasMore: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], hasMore: false };

  const from = page * PAGE_SIZE;
  const to   = from + PAGE_SIZE; // fetch one extra to detect hasMore

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_date,
      start_time,
      end_time,
      type,
      status,
      notes,
      location,
      doctor:users!appointments_doctor_id_fkey (
        id,
        full_name,
        specialty,
        clinic_name
      )
    `)
    .eq("patient_id", user.id)
    .order("appointment_date", { ascending: false })
    .order("start_time",       { ascending: true })
    .range(from, to);

  if (error) {
    console.error("[getPatientAppointmentsAction]", error.message);
    return { data: [], hasMore: false };
  }

  const rows = (data ?? []) as unknown as PatientAppointment[];
  const hasMore = rows.length > PAGE_SIZE;
  return { data: hasMore ? rows.slice(0, PAGE_SIZE) : rows, hasMore };
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Cancel an upcoming appointment owned by the authenticated patient.
 *
 * Steps:
 *   1. Verify the appointment exists, belongs to this patient, and is upcoming.
 *   2. Set status = 'cancelled'.
 *   3. Notify the doctor (fire-and-forget — cancel is never blocked by it).
 *
 * RLS `appointments__patient_cancel` provides a DB-level second guard:
 *   USING  (patient_id = auth.uid() AND status = 'upcoming')
 *   WITH CHECK (patient_id = auth.uid() AND status = 'cancelled')
 */
export async function cancelAppointmentAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing appointment ID" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // ── 1. Read the appointment first (need doctor_id + meta for notification) ──
  const { data: appt } = await supabase
    .from("appointments")
    .select("doctor_id, appointment_date, start_time, type")
    .eq("id",         id)
    .eq("patient_id", user.id)
    .eq("status",     "upcoming")
    .maybeSingle();

  if (!appt) {
    return { error: "Appointment not found or already cancelled." };
  }

  // ── 2. Cancel ──
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id",         id)
    .eq("patient_id", user.id)
    .eq("status",     "upcoming");  // second guard matches RLS

  if (error) return { error: error.message };

  // ── 3. Notify doctor (non-blocking) ──
  try {
    const { data: patient } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const patientName = patient?.full_name ?? "A patient";
    const dateLabel   = fmtDate(appt.appointment_date);
    const timeLabel   = fmtTime(appt.start_time);

    await sendNotification({
      user_id: appt.doctor_id,
      type:    "appointment_cancelled",
      title:   "Appointment Cancelled",
      body:    `${patientName} cancelled their appointment on ${dateLabel} at ${timeLabel}.`,
      link:    "/doctor/appointments",
    });
  } catch {
    // Never fail the cancellation because of a notification error
  }

  return { error: null };
}
