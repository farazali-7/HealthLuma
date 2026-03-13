"use server";

import { createClient } from "@/lib/supabase/server";

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

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Fetch all appointments for the authenticated doctor,
 * joined with the patient's name.
 * RLS policy `appointments__doctor_select` enforces doctor_id = auth.uid().
 */
export async function getDoctorAppointmentsAction(): Promise<DoctorAppointment[]> {
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
      is_priority,
      patient:users!appointments_patient_id_fkey (
        id,
        full_name
      )
    `)
    .eq("doctor_id", user.id)
    .order("appointment_date", { ascending: true })
    .order("start_time",       { ascending: true });

  if (error) {
    console.error("[getDoctorAppointmentsAction]", error.message);
    return [];
  }

  return (data ?? []) as unknown as DoctorAppointment[];
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Update the status of an appointment.
 * Doctors can mark appointments as completed, cancelled, or no-show.
 * RLS policy `appointments__doctor_update` enforces doctor_id = auth.uid().
 */
export async function updateAppointmentStatusAction(
  id: string,
  status: "completed" | "cancelled" | "no-show"
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
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id",        id)
    .eq("doctor_id", user.id);

  return { error: error?.message ?? null };
}
