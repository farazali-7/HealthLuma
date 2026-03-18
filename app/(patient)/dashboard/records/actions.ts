"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────

export type PatientRxStatus = "active" | "completed" | "refill-due" | "discontinued";

export interface PatientPrescription {
  id: string;
  medication: string;
  dose: string;
  frequency: string;
  duration: string | null;
  condition: string | null;
  notes: string | null;
  refills_total: number;
  refills_used: number;
  status: PatientRxStatus;
  prescribed_at: string;   // "YYYY-MM-DD"
  expires_at: string | null;
  doctor: {
    id: string;
    full_name: string;
  } | null;
}

// ─── Queries ─────────────────────────────────────────────────────

/**
 * All prescriptions for the authenticated patient, newest first.
 * Excludes discontinued prescriptions from the active group,
 * but keeps them in the "past" group so patients have a full history.
 * RLS ensures patient_id = auth.uid().
 */
export async function getPatientPrescriptionsAction(): Promise<PatientPrescription[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      id,
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
      doctor:users!prescriptions_doctor_id_fkey (
        id,
        full_name
      )
    `)
    .eq("patient_id", user.id)
    .order("prescribed_at", { ascending: false });

  if (error) {
    console.error("[getPatientPrescriptionsAction]", error.message);
    return [];
  }

  return (data ?? []) as unknown as PatientPrescription[];
}
