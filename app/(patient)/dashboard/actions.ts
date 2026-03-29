"use server";

import { createClient }       from "@/lib/supabase/server";
import { sendNotification }   from "@/lib/supabase/service";
import { logger }             from "@/lib/logger";

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

const TYPE_LABELS: Record<AppointmentType, string> = {
  "consultation":        "New Consultation",
  "follow-up":           "Follow-up",
  "checkup":             "Annual Checkup",
  "prescription-review": "Prescription Review",
};

// ─── Helpers ──────────────────────────────────────────────────

function addMins(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total  = h * 60 + m + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function fmtTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
    timeZone: "UTC",
  });
}

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
 * For today: slots that have already passed (plus a 15-min buffer) are excluded.
 * Runs server-side so RLS on appointments is satisfied without leaking
 * other patients' data — only the time strings are returned.
 */
export async function getAvailableSlotsAction(
  doctorId: string,
  date: string // "YYYY-MM-DD"
): Promise<string[]> {
  const supabase = await createClient();

  const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();

  const { data: schedule } = await supabase
    .from("doctor_availability")
    .select("start_time, end_time, slot_duration_mins")
    .eq("doctor_id", doctorId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!schedule || schedule.length === 0) return [];

  // Booked slots via SECURITY DEFINER RPC — doesn't leak other patients' rows
  const { data: booked } = await supabase.rpc("get_booked_slots", {
    p_doctor_id: doctorId,
    p_date:      date,
  });

  const bookedTimes = new Set<string>(
    (booked ?? []).map((b: { start_time: string }) => b.start_time)
  );

  // For today, exclude slots that have already started (with 15-min buffer so
  // a patient can't book a slot that starts in less than 15 minutes).
  const todayStr = new Date().toISOString().split("T")[0];
  const isToday  = date === todayStr;
  const nowMins  = isToday
    ? new Date().getUTCHours() * 60 + new Date().getUTCMinutes() + 15
    : -1;

  const slots: string[] = [];

  for (const block of schedule) {
    const [sh, sm] = block.start_time.split(":").map(Number);
    const [eh, em] = block.end_time.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins   = eh * 60 + em;
    const step      = block.slot_duration_mins as number;

    for (let m = startMins; m < endMins; m += step) {
      if (isToday && m <= nowMins) continue; // skip past / too-soon slots
      const hh      = String(Math.floor(m / 60)).padStart(2, "0");
      const mm      = String(m % 60).padStart(2, "0");
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
  doctor_id:        string;
  appointment_date: string;       // "YYYY-MM-DD"
  start_time:       string;       // "HH:MM"
  type:             AppointmentType;
  notes?:           string;
  family_member_id?: string;
}

/**
 * Insert a new appointment row for the authenticated patient.
 *
 * Enforces:
 *   1. Date is not in the past.
 *   2. Slot is still free (race-condition guard before the unique index fires).
 *   3. end_time is computed server-side from the doctor's actual slot_duration_mins.
 *
 * Post-insert:
 *   - Sends `appointment_confirmed` notification to the patient.
 *   - Sends `appointment_confirmed` notification to the doctor (new booking alert).
 *   Notification failures are non-blocking — the booking always succeeds.
 */
export async function bookAppointmentAction(
  input: BookAppointmentInput
): Promise<{ error: string | null }> {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // ── 1. Past-date guard ──
  const todayStr = new Date().toISOString().split("T")[0];
  if (input.appointment_date < todayStr) {
    return { error: "Cannot book an appointment in the past." };
  }

  // ── 2. Compute end_time from doctor's schedule ──
  const dayOfWeek = new Date(`${input.appointment_date}T12:00:00Z`).getUTCDay();
  const { data: avail } = await supabase
    .from("doctor_availability")
    .select("slot_duration_mins")
    .eq("doctor_id",   input.doctor_id)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active",   true)
    .maybeSingle();

  if (!avail) {
    return { error: "The doctor has no availability on the selected date." };
  }

  const end_time = addMins(input.start_time, avail.slot_duration_mins);

  // ── 3. Race-condition guard (DB unique index is the final defence) ──
  const { data: conflict } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id",        input.doctor_id)
    .eq("appointment_date", input.appointment_date)
    .eq("start_time",       input.start_time)
    .not("status", "in", '("cancelled","no-show")')
    .maybeSingle();

  if (conflict) {
    return { error: "This slot was just booked. Please pick another time." };
  }

  // ── 4. Insert ──
  const { data: inserted, error } = await supabase
    .from("appointments")
    .insert({
      patient_id:       user.id,
      doctor_id:        input.doctor_id,
      appointment_date: input.appointment_date,
      start_time:       input.start_time,
      end_time,
      type:             input.type,
      notes:            input.notes ?? null,
      family_member_id: input.family_member_id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique constraint = double-booking race
    if (error.code === "23505") {
      return { error: "This slot was just booked. Please pick another time." };
    }
    return { error: error.message };
  }

  // ── 5. Notifications (fire-and-forget) ──
  try {
    const { data: doctor } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", input.doctor_id)
      .single();

    const doctorName  = doctor?.full_name ?? "your doctor";
    const typeLabel   = TYPE_LABELS[input.type];
    const dateLabel   = fmtDate(input.appointment_date);
    const timeLabel   = fmtTime(input.start_time);

    await Promise.all([
      // Patient: booking confirmation
      sendNotification({
        user_id: user.id,
        type:    "appointment_confirmed",
        title:   "Appointment Confirmed",
        body:    `Your ${typeLabel} with ${doctorName} on ${dateLabel} at ${timeLabel} is confirmed.`,
        link:    "/dashboard/appointments",
      }),
      // Doctor: new booking alert
      sendNotification({
        user_id: input.doctor_id,
        type:    "appointment_confirmed",
        title:   "New Appointment Booked",
        body:    `A patient has scheduled a ${typeLabel} on ${dateLabel} at ${timeLabel}.`,
        link:    "/doctor/appointments",
      }),
    ]);
  } catch (notifyErr) {
    // Notification failure must never fail the booking
    logger.warn("bookAppointmentAction:notify", notifyErr);
  }

  return { error: null };
  } catch (err) {
    logger.error("bookAppointmentAction", err, { doctorId: input.doctor_id, date: input.appointment_date });
    return { error: "An unexpected error occurred. Please try again." };
  }
}
