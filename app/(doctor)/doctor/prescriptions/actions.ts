"use server";

import { createClient }     from "@/lib/supabase/server";
import { sendNotification } from "@/lib/supabase/service";
import { logger }           from "@/lib/logger";

// ─── Types ────────────────────────────────────────────────────────

export type RxStatus = "active" | "completed" | "refill-due" | "discontinued";

export interface DoctorPrescription {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  medication: string;
  dose: string;
  frequency: string;
  duration: string | null;
  condition: string | null;
  notes: string | null;
  refills_total: number;
  refills_used: number;
  status: RxStatus;
  prescribed_at: string;   // "YYYY-MM-DD"
  expires_at: string | null;
  patient: {
    id: string;
    full_name: string;
  } | null;
}

export interface PatientOption {
  id: string;
  full_name: string;
}

export interface IssueRxInput {
  patient_id:     string;
  medication:     string;
  dose:           string;
  frequency:      string;
  duration?:      string;
  condition?:     string;
  notes?:         string;
  refills_total:  number;
  expires_at?:    string;   // "YYYY-MM-DD" optional
  appointment_id?: string;
}

// ─── Queries ─────────────────────────────────────────────────────

/**
 * All prescriptions written by this doctor, newest first.
 * RLS ensures doctor_id = auth.uid().
 */
const PAGE_SIZE = 20;

export async function getDoctorPrescriptionsAction(
  page = 0
): Promise<{ data: DoctorPrescription[]; hasMore: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], hasMore: false };

  const from = page * PAGE_SIZE;
  const to   = from + PAGE_SIZE; // fetch one extra to detect hasMore

  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      id,
      patient_id,
      appointment_id,
      medication,
      dose,
      frequency,
      duration,
      condition,
      notes,
      refills_total,
      refills_used,
      status,
      prescribed_at,
      expires_at,
      patient:users!prescriptions_patient_id_fkey (
        id,
        full_name
      )
    `)
    .eq("doctor_id", user.id)
    .order("prescribed_at", { ascending: false })
    .range(from, to);

  if (error) {
    logger.warn("getDoctorPrescriptionsAction", error, { page });
    return { data: [], hasMore: false };
  }

  const rows = (data ?? []) as unknown as DoctorPrescription[];
  const hasMore = rows.length > PAGE_SIZE;
  return { data: hasMore ? rows.slice(0, PAGE_SIZE) : rows, hasMore };
}

/**
 * Fuzzy-search patients by name for the prescription modal.
 * Doctors can read all users (users__doctor_select_all policy).
 */
export async function searchPatientsAction(query: string): Promise<PatientOption[]> {
  if (!query.trim()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name")
    .eq("role", "patient")
    .ilike("full_name", `%${query.trim()}%`)
    .order("full_name")
    .limit(8);

  return (data ?? []) as PatientOption[];
}

// ─── Mutations ────────────────────────────────────────────────────

/**
 * Issue a new prescription.
 * Validates required fields server-side, inserts, then notifies the patient.
 */
export async function issuePrescriptionAction(
  input: IssueRxInput
): Promise<{ error: string | null }> {
  const { patient_id, medication, dose, frequency } = input;

  if (!patient_id)  return { error: "Patient is required."   };
  if (!medication)  return { error: "Medication is required." };
  if (!dose)        return { error: "Dose is required."       };
  if (!frequency)   return { error: "Frequency is required."  };
  if (input.refills_total < 0 || input.refills_total > 12) {
    return { error: "Refills must be between 0 and 12." };
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id,
        doctor_id:      user.id,
        appointment_id: input.appointment_id ?? null,
        medication:     medication.trim(),
        dose:           dose.trim(),
        frequency:      frequency.trim(),
        duration:       input.duration?.trim()  || null,
        condition:      input.condition?.trim() || null,
        notes:          input.notes?.trim()     || null,
        refills_total:  input.refills_total,
        refills_used:   0,
        expires_at:     input.expires_at || null,
      });

    if (error) {
      logger.warn("issuePrescriptionAction", error, { patientId: patient_id });
      return { error: error.message };
    }

    // Notify patient (fire-and-forget)
    try {
      const { data: doctor } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      await sendNotification({
        user_id: patient_id,
        type:    "new_prescription",
        title:   "New Prescription Issued",
        body:    `${doctor?.full_name ?? "Your doctor"} has issued ${medication.trim()} ${dose.trim()}. View it in your health records.`,
        link:    "/dashboard/records",
      });
    } catch (notifyErr) {
      logger.warn("issuePrescriptionAction:notify", notifyErr, { patientId: patient_id });
    }

    return { error: null };
  } catch (err) {
    logger.error("issuePrescriptionAction", err, { patientId: patient_id });
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Record that one refill has been dispensed.
 * Automatically transitions status to 'refill-due' when the last refill is used.
 *
 * Guard: refills_used < refills_total (enforced both here and by DB constraint).
 */
export async function markRefillUsedAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing prescription ID" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { data: rx } = await supabase
      .from("prescriptions")
      .select("refills_total, refills_used, status")
      .eq("id", id)
      .eq("doctor_id", user.id)
      .maybeSingle();

    if (!rx) return { error: "Prescription not found." };
    if (rx.refills_used >= rx.refills_total) {
      return { error: "No refills remaining on this prescription." };
    }

    const newUsed   = rx.refills_used + 1;
    const newStatus: RxStatus = newUsed >= rx.refills_total ? "refill-due" : (rx.status as RxStatus);

    const { error } = await supabase
      .from("prescriptions")
      .update({ refills_used: newUsed, status: newStatus })
      .eq("id", id)
      .eq("doctor_id", user.id);

    if (error) {
      logger.warn("markRefillUsedAction", error, { prescriptionId: id });
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    logger.error("markRefillUsedAction", err, { prescriptionId: id });
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Change prescription status (complete or discontinue).
 * A prescription cannot be transitioned back to 'active' or 'refill-due'
 * once it has been completed or discontinued.
 */
export async function updatePrescriptionStatusAction(
  id: string,
  status: "active" | "completed" | "refill-due" | "discontinued"
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing prescription ID" };

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("prescriptions")
      .update({ status })
      .eq("id",        id)
      .eq("doctor_id", user.id);

    if (error) {
      logger.warn("updatePrescriptionStatusAction", error, { prescriptionId: id, status });
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    logger.error("updatePrescriptionStatusAction", err, { prescriptionId: id, status });
    return { error: "An unexpected error occurred. Please try again." };
  }
}
