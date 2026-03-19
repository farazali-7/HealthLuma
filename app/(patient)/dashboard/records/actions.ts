"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

// ─── Documents ────────────────────────────────────────────────────

export const DOC_TYPE_LABELS: Record<string, string> = {
  "consultation-note":    "Consultation Note",
  "lab-report":           "Lab Report",
  "prescription-record":  "Prescription Record",
  "checkup-summary":      "Checkup Summary",
  "other":                "Document",
};

export type DocumentType =
  | "consultation-note"
  | "lab-report"
  | "prescription-record"
  | "checkup-summary"
  | "other";

export interface PatientDocument {
  id: string;
  name: string;
  type: DocumentType;
  file_path: string;   // Storage path: "{patient_id}/{filename}"
  file_size_bytes: number | null;
  created_at: string;
}

/**
 * All documents visible to the authenticated patient.
 * Returns the storage path so the client can generate a signed URL
 * inline (avoids N+1 signed-URL generation on the server).
 * RLS `documents__patient_select_own` scopes rows to auth.uid().
 */
export async function getPatientDocumentsAction(): Promise<PatientDocument[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("id, name, type, file_url, file_size_bytes, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getPatientDocumentsAction]", error.message);
    return [];
  }

  return (data ?? []).map((d: any) => ({
    id:              d.id,
    name:            d.name,
    type:            d.type as DocumentType,
    file_path:       d.file_url,   // column stores storage path
    file_size_bytes: d.file_size_bytes,
    created_at:      d.created_at,
  }));
}

export interface SaveDocumentInput {
  name: string;
  type: DocumentType;
  file_path: string;    // Storage path after successful upload
  file_size_bytes: number;
}

/**
 * Persists document metadata after the client has uploaded the file to
 * Supabase Storage. Called from the browser component post-upload.
 */
export async function saveDocumentAction(
  input: SaveDocumentInput
): Promise<{ error: string | null }> {
  const { name, type, file_path, file_size_bytes } = input;

  if (!name.trim()) return { error: "Document name is required." };
  if (!file_path)   return { error: "Upload path is missing." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase.from("documents").insert({
    patient_id:      user.id,
    uploaded_by:     user.id,
    name:            name.trim(),
    type,
    file_url:        file_path,
    file_size_bytes: file_size_bytes ?? null,
  });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/records");
  return { error: null };
}

/**
 * Delete a document the patient uploaded themselves.
 * RLS `documents__patient_delete_own_uploads` enforces
 *   patient_id = auth.uid() AND uploaded_by = auth.uid()
 */
export async function deleteDocumentAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing document ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Fetch path first so we can remove from Storage
  const { data: doc } = await supabase
    .from("documents")
    .select("file_url, uploaded_by")
    .eq("id", id)
    .eq("patient_id", user.id)
    .maybeSingle();

  if (!doc) return { error: "Document not found." };
  if (doc.uploaded_by !== user.id) {
    return { error: "You can only delete documents you uploaded." };
  }

  // Remove from Storage (non-blocking — row delete is the source of truth)
  await supabase.storage.from("documents").remove([doc.file_url]);

  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id)
    .eq("patient_id", user.id)
    .eq("uploaded_by", user.id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/records");
  return { error: null };
}
