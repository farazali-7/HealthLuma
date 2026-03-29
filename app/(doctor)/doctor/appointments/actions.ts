"use server";

import { createClient }     from "@/lib/supabase/server";
import { sendNotification } from "@/lib/supabase/service";
import { logger }           from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────

export type ApptStatus = "upcoming" | "completed" | "cancelled" | "no-show";

export interface DoctorAppointment {
  id: string;
  appointment_date: string;   // "YYYY-MM-DD"
  start_time: string;         // "HH:MM" 24-hour
  end_time: string;           // "HH:MM" 24-hour
  type: string;
  status: ApptStatus;
  notes: string | null;
  location: string;
  is_priority: boolean;
  patient: {
    id: string;
    full_name: string;
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

const TYPE_LABELS: Record<string, string> = {
  "consultation":        "New Consultation",
  "follow-up":           "Follow-up",
  "checkup":             "Annual Checkup",
  "prescription-review": "Prescription Review",
};

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Fetch all appointments for the authenticated doctor,
 * joined with the patient's name.
 * RLS `appointments__doctor_full_access` enforces is_doctor().
 */
const PAGE_SIZE = 30;

export async function getDoctorAppointmentsAction(
  page = 0
): Promise<{ data: DoctorAppointment[]; hasMore: boolean }> {
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
      is_priority,
      patient:users!appointments_patient_id_fkey (
        id,
        full_name
      )
    `)
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: true })
    .order("start_time",       { ascending: true })
    .range(from, to);

  if (error) {
    logger.warn("getDoctorAppointmentsAction", error, { page });
    return { data: [], hasMore: false };
  }

  const rows = (data ?? []) as unknown as DoctorAppointment[];
  const hasMore = rows.length > PAGE_SIZE;
  return { data: hasMore ? rows.slice(0, PAGE_SIZE) : rows, hasMore };
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Update the status of an appointment (doctor action).
 *
 * Enforces:
 *   - Only `upcoming` appointments may be transitioned.
 *   - Doctor may only update their own appointments (RLS + application guard).
 *
 * Post-update:
 *   - On `completed` or `cancelled`: notifies the patient (fire-and-forget).
 */
export async function updateAppointmentStatusAction(
  id: string,
  status: "completed" | "cancelled" | "no-show"
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing appointment ID" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    // ── 1. Read current appointment (verify ownership + current status) ──
    const { data: appt } = await supabase
      .from("appointments")
      .select("patient_id, appointment_date, start_time, type, status")
      .eq("id",        id)
      .eq("doctor_id", user.id)
      .maybeSingle();

    if (!appt) {
      return { error: "Appointment not found." };
    }

    // ── 2. Guard: only upcoming → final status is valid ──
    if (appt.status !== "upcoming") {
      return {
        error: `Cannot update a ${appt.status} appointment. Only upcoming appointments can be changed.`,
      };
    }

    // ── 3. Update ──
    const { error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id",        id)
      .eq("doctor_id", user.id);

    if (error) {
      logger.warn("updateAppointmentStatusAction", error, { appointmentId: id, status });
      return { error: error.message };
    }

    // ── 4. Notify patient (non-blocking) ──
    if (status === "completed" || status === "cancelled") {
      try {
        const { data: doctor } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        const doctorName = doctor?.full_name ?? "your doctor";
        const typeLabel  = TYPE_LABELS[appt.type] ?? appt.type;
        const dateLabel  = fmtDate(appt.appointment_date);
        const timeLabel  = fmtTime(appt.start_time);

        if (status === "completed") {
          await sendNotification({
            user_id: appt.patient_id,
            type:    "appointment_confirmed",
            title:   "Visit Completed",
            body:    `Your ${typeLabel} with ${doctorName} on ${dateLabel} has been completed. Check your records for any notes.`,
            link:    "/dashboard/appointments",
          });
        } else {
          await sendNotification({
            user_id: appt.patient_id,
            type:    "appointment_cancelled",
            title:   "Appointment Cancelled",
            body:    `Your ${typeLabel} with ${doctorName} on ${dateLabel} at ${timeLabel} has been cancelled. Please contact the clinic to reschedule.`,
            link:    "/dashboard/appointments",
          });
        }
      } catch (notifyErr) {
        // Never block the status update because of a notification failure
        logger.warn("updateAppointmentStatusAction:notify", notifyErr, { appointmentId: id });
      }
    }

    return { error: null };
  } catch (err) {
    logger.error("updateAppointmentStatusAction", err, { appointmentId: id, status });
    return { error: "An unexpected error occurred. Please try again." };
  }
}
