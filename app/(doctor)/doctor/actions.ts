"use server";

import { createClient } from "@/lib/supabase/server";
import { logger }       from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────

export interface QueueAppointment {
  id: string;
  start_time: string;       // "HH:MM" 24-hour
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "no-show";
  is_priority: boolean;
  patient: {
    id: string;
    full_name: string;
    date_of_birth: string | null;
  } | null;
}

export interface RecentNote {
  id: string;
  content: string;
  created_at: string;       // ISO timestamp
  patient: {
    full_name: string;
  } | null;
}

export interface DashboardTask {
  id: string;
  label: string;
  is_urgent: boolean;
  is_done: boolean;
  patient: {
    full_name: string;
  } | null;
}

export interface DoctorDashboardData {
  doctorName: string;
  queue: QueueAppointment[];
  notes: RecentNote[];
  tasks: DashboardTask[];
}

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Single request that loads everything needed for the doctor's main dashboard.
 * Four parallel queries: profile + today's queue + recent notes + pending tasks.
 */
export async function getDoctorDashboardAction(): Promise<DoctorDashboardData> {
  try {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { doctorName: "Doctor", queue: [], notes: [], tasks: [] };
  }

  const today = new Date().toISOString().split("T")[0];

  const [profileRes, queueRes, notesRes, tasksRes] = await Promise.all([
    // Doctor profile (name)
    supabase
      .from("users")
      .select("full_name")
      .eq("id", user.id)
      .single(),

    // Today's queue — exclude cancelled (patients who aren't coming)
    supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        type,
        status,
        is_priority,
        patient:users!appointments_patient_id_fkey (
          id,
          full_name,
          date_of_birth
        )
      `)
      .eq("doctor_id",        user.id)
      .eq("appointment_date", today)
      .neq("status",          "cancelled")
      .order("start_time",    { ascending: true }),

    // 5 most recent clinical notes
    supabase
      .from("clinical_notes")
      .select(`
        id,
        content,
        created_at,
        patient:users!clinical_notes_patient_id_fkey (
          full_name
        )
      `)
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    // All tasks (pending + completed) — UI manages the done/undone toggle visually
    supabase
      .from("doctor_tasks")
      .select(`
        id,
        label,
        is_urgent,
        is_done,
        patient:users!doctor_tasks_patient_id_fkey (
          full_name
        )
      `)
      .eq("doctor_id", user.id)
      .order("is_urgent",   { ascending: false })
      .order("created_at",  { ascending: true })
      .limit(20),
  ]);

  return {
    doctorName: profileRes.data?.full_name ?? "Doctor",
    queue:  (queueRes.data  ?? []) as unknown as QueueAppointment[],
    notes:  (notesRes.data  ?? []) as unknown as RecentNote[],
    tasks:  (tasksRes.data  ?? []) as unknown as DashboardTask[],
  };
  } catch (err) {
    logger.error("getDoctorDashboardAction", err);
    return { doctorName: "Doctor", queue: [], notes: [], tasks: [] };
  }
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Set a doctor task's done state directly.
 * Client passes the desired new state — eliminates the SELECT round-trip.
 * RLS + doctor_id guard prevent cross-doctor writes.
 */
export async function toggleDoctorTaskAction(
  id: string,
  newDone: boolean
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing task ID" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("doctor_tasks")
      .update({ is_done: newDone })
      .eq("id",        id)
      .eq("doctor_id", user.id);

    if (error) {
      logger.warn("toggleDoctorTaskAction", error, { taskId: id });
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    logger.error("toggleDoctorTaskAction", err, { taskId: id });
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Persist a new clinical note for a patient.
 * Only the authenticated doctor can write notes.
 */
export async function saveClinicalNoteAction(
  patient_id: string,
  content: string
): Promise<{ error: string | null }> {
  if (!patient_id || !content.trim()) {
    return { error: "Patient and content are required." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("clinical_notes")
      .insert({
        doctor_id:  user.id,
        patient_id,
        content: content.trim(),
      });

    if (error) {
      logger.warn("saveClinicalNoteAction", error, { patientId: patient_id });
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    logger.error("saveClinicalNoteAction", err, { patientId: patient_id });
    return { error: "An unexpected error occurred. Please try again." };
  }
}
