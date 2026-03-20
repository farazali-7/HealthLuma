"use server";

import { createClient }  from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────

export type RecordType = "note" | "lab" | "prescription" | "report" | "referral";

export interface MedRecord {
  id: string;
  source: "clinical_note" | "document";
  patient_id: string;
  patient_name: string;
  patient_initials: string;
  patient_age: number | null;
  type: RecordType;
  title: string;
  date: string;
  file_url: string | null;
  file_size: string | null;
  summary: string | null;
  _sortKey: string; // ISO timestamp for sorting; stripped before returning
}

// ─── Helpers ──────────────────────────────────────────────────

function toInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function computeAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob + "T12:00:00Z");
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const m = today.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1_048_576) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

function docTypeToRecordType(docType: string): RecordType {
  switch (docType) {
    case "consultation-note":   return "note";
    case "lab-report":          return "lab";
    case "prescription-record": return "prescription";
    case "checkup-summary":     return "report";
    default:                    return "report";
  }
}

// ─── Actions ──────────────────────────────────────────────────

export async function getRecordsAction(): Promise<Omit<MedRecord, "_sortKey">[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [notesRes, docsRes] = await Promise.all([
    supabase
      .from("clinical_notes")
      .select(`
        id,
        content,
        created_at,
        patient:users!clinical_notes_patient_id_fkey (
          id, full_name, date_of_birth
        )
      `)
      .eq("doctor_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("documents")
      .select(`
        id,
        name,
        type,
        file_url,
        file_size_bytes,
        created_at,
        patient:users!documents_patient_id_fkey (
          id, full_name, date_of_birth
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const notes = (notesRes.data ?? []) as unknown as Array<{
    id: string;
    content: string;
    created_at: string;
    patient: { id: string; full_name: string; date_of_birth: string | null } | null;
  }>;

  const docs = (docsRes.data ?? []) as unknown as Array<{
    id: string;
    name: string;
    type: string;
    file_url: string | null;
    file_size_bytes: number | null;
    created_at: string;
    patient: { id: string; full_name: string; date_of_birth: string | null } | null;
  }>;

  const noteRecords: MedRecord[] = notes
    .filter((n) => n.patient !== null)
    .map((n) => {
      const summary =
        n.content.length > 120
          ? n.content.slice(0, 120) + "..."
          : n.content;

      return {
        id: n.id,
        source: "clinical_note",
        patient_id: n.patient!.id,
        patient_name: n.patient!.full_name,
        patient_initials: toInitials(n.patient!.full_name),
        patient_age: computeAge(n.patient!.date_of_birth),
        type: "note",
        title: "Clinical Note",
        date: formatDate(n.created_at),
        file_url: null,
        file_size: null,
        summary,
        _sortKey: n.created_at,
      };
    });

  const docRecords: MedRecord[] = docs
    .filter((d) => d.patient !== null)
    .map((d) => ({
      id: d.id,
      source: "document",
      patient_id: d.patient!.id,
      patient_name: d.patient!.full_name,
      patient_initials: toInitials(d.patient!.full_name),
      patient_age: computeAge(d.patient!.date_of_birth),
      type: docTypeToRecordType(d.type),
      title: d.name,
      date: formatDate(d.created_at),
      file_url: d.file_url,
      file_size: d.file_size_bytes ? formatFileSize(d.file_size_bytes) : null,
      summary: null,
      _sortKey: d.created_at,
    }));

  const merged = [...noteRecords, ...docRecords].sort((a, b) =>
    b._sortKey.localeCompare(a._sortKey)
  );

  // Strip internal sort key before returning
  return merged.map(({ _sortKey: _sk, ...rest }) => rest);
}

export async function createClinicalNoteRecordAction(input: {
  patient_id: string;
  content: string;
}): Promise<{ error: string | null }> {
  if (!input.patient_id) return { error: "Patient is required." };
  if (!input.content.trim()) return { error: "Content cannot be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("clinical_notes").insert({
    doctor_id:  user.id,
    patient_id: input.patient_id,
    content:    input.content.trim(),
  });

  if (error) return { error: error.message };

  revalidatePath("/doctor/records");
  return { error: null };
}
