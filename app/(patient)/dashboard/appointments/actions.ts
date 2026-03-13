"use server";

import { createClient } from "@/lib/supabase/server";

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

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Fetch all appointments for the authenticated patient,
 * joined with the doctor's public profile.
 * RLS on appointments guarantees patient_id = auth.uid().
 */
export async function getPatientAppointmentsAction(): Promise<PatientAppointment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

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
    .order("start_time",       { ascending: true });

  if (error) {
    console.error("[getPatientAppointmentsAction]", error.message);
    return [];
  }

  return (data ?? []) as unknown as PatientAppointment[];
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Cancel an upcoming appointment.
 * RLS policy `appointments__patient_cancel` enforces:
 *   - patient_id = auth.uid()
 *   - old status must be 'upcoming'
 *   - new status must be 'cancelled'
 * This server action adds an extra application-layer guard.
 */
export async function cancelAppointmentAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing appointment ID" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("appointments")
    .update({
      status:     "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id",         id)
    .eq("patient_id", user.id)
    .eq("status",     "upcoming");  // guard: only upcoming can be cancelled

  return { error: error?.message ?? null };
}
