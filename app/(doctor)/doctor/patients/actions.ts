"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────

export type PatientStatus = "active" | "new" | "inactive";

export interface PatientSummary {
  id: string;
  full_name: string;
  initials: string;
  date_of_birth: string | null;
  phone: string | null;
  conditions: string[];
  last_visit: string | null;
  next_appointment: string | null;
  active_prescription_count: number;
  total_appointments: number;
  status: PatientStatus;
}

export interface PatientAppointment {
  id: string;
  appointment_date: string;
  start_time: string;
  type: string;
  status: "upcoming" | "completed" | "cancelled" | "no-show";
}

export interface PatientPrescription {
  id: string;
  medication: string;
  dose: string;
  frequency: string;
  condition: string | null;
  status: string;
}

export interface PatientNote {
  id: string;
  content: string;
  created_at: string;
}

export interface PatientProfile {
  id: string;
  full_name: string;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
}

export interface PatientDetail {
  profile: PatientProfile;
  appointments: PatientAppointment[];
  prescriptions: PatientPrescription[];
  notes: PatientNote[];
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

// ─── Actions ──────────────────────────────────────────────────

export async function getPatientListAction(): Promise<PatientSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const todayStr = new Date().toISOString().slice(0, 10);

  const [appointmentsRes, prescriptionsRes] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        `patient_id, appointment_date, status,
         patient:users!appointments_patient_id_fkey (
           id, full_name, date_of_birth, phone
         )`
      )
      .eq("doctor_id", user.id)
      .order("appointment_date", { ascending: false })
      .limit(1000),
    supabase
      .from("prescriptions")
      .select("patient_id, condition, status")
      .eq("doctor_id", user.id)
      .in("status", ["active", "refill-due"]),
  ]);

  const appointments = (appointmentsRes.data ?? []) as unknown as Array<{
    patient_id: string;
    appointment_date: string;
    status: string;
    patient: {
      id: string;
      full_name: string;
      date_of_birth: string | null;
      phone: string | null;
    } | null;
  }>;

  const prescriptions = (prescriptionsRes.data ?? []) as Array<{
    patient_id: string;
    condition: string | null;
    status: string;
  }>;

  // Build prescription condition map per patient
  const conditionMap = new Map<string, Set<string>>();
  const activePrescriptionCount = new Map<string, number>();

  for (const rx of prescriptions) {
    if (!conditionMap.has(rx.patient_id)) {
      conditionMap.set(rx.patient_id, new Set());
    }
    if (rx.condition?.trim()) {
      conditionMap.get(rx.patient_id)!.add(rx.condition.trim());
    }
    activePrescriptionCount.set(
      rx.patient_id,
      (activePrescriptionCount.get(rx.patient_id) ?? 0) + 1
    );
  }

  // Group appointments by patient
  const patientMap = new Map<
    string,
    {
      profile: { id: string; full_name: string; date_of_birth: string | null; phone: string | null };
      appts: Array<{ appointment_date: string; status: string }>;
    }
  >();

  for (const appt of appointments) {
    if (!appt.patient) continue;
    const pid = appt.patient_id;
    if (!patientMap.has(pid)) {
      patientMap.set(pid, { profile: appt.patient, appts: [] });
    }
    patientMap.get(pid)!.appts.push({
      appointment_date: appt.appointment_date,
      status: appt.status,
    });
  }

  const result: PatientSummary[] = [];

  for (const [pid, { profile, appts }] of patientMap.entries()) {
    const completedAppts = appts
      .filter((a) => a.status === "completed")
      .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

    const upcomingAppts = appts
      .filter((a) => a.status === "upcoming" && a.appointment_date >= todayStr)
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));

    const last_visit = completedAppts[0]?.appointment_date ?? null;
    const next_appointment = upcomingAppts[0]?.appointment_date ?? null;
    const total_appointments = appts.filter((a) => a.status !== "cancelled").length;

    // Status determination
    let status: PatientStatus;
    if (
      total_appointments === 1 ||
      (appts.length === 1 && appts[0].status === "upcoming")
    ) {
      status = "new";
    } else if (last_visit === null) {
      status = "inactive";
    } else {
      const lastVisitDate = new Date(last_visit + "T12:00:00Z");
      const daysDiff = (Date.now() - lastVisitDate.getTime()) / 86_400_000;
      status = daysDiff > 90 ? "inactive" : "active";
    }

    const conditionsSet = conditionMap.get(pid) ?? new Set<string>();
    const conditions = Array.from(conditionsSet).slice(0, 3);

    result.push({
      id: pid,
      full_name: profile.full_name,
      initials: toInitials(profile.full_name),
      date_of_birth: profile.date_of_birth,
      phone: profile.phone,
      conditions,
      last_visit,
      next_appointment,
      active_prescription_count: activePrescriptionCount.get(pid) ?? 0,
      total_appointments,
      status,
    });
  }

  // Sort: new first, then active, then inactive; within groups alphabetically
  const ORDER: Record<PatientStatus, number> = { new: 0, active: 1, inactive: 2 };
  result.sort((a, b) => {
    const diff = ORDER[a.status] - ORDER[b.status];
    if (diff !== 0) return diff;
    return a.full_name.localeCompare(b.full_name);
  });

  return result;
}

export async function getPatientDetailAction(
  patientId: string
): Promise<PatientDetail | null> {
  if (!patientId) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Security check: verify at least one appointment exists between this doctor and patient
  const { data: authCheck } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .limit(1)
    .maybeSingle();

  if (!authCheck) return null;

  const [profileRes, appointmentsRes, prescriptionsRes, notesRes] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, full_name, date_of_birth, phone, email")
        .eq("id", patientId)
        .single(),
      supabase
        .from("appointments")
        .select("id, appointment_date, start_time, type, status")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .order("appointment_date", { ascending: false })
        .order("start_time", { ascending: false })
        .limit(10),
      supabase
        .from("prescriptions")
        .select("id, medication, dose, frequency, condition, status")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .in("status", ["active", "refill-due"])
        .order("prescribed_at", { ascending: false }),
      supabase
        .from("clinical_notes")
        .select("id, content, created_at")
        .eq("doctor_id", user.id)
        .eq("patient_id", patientId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  if (!profileRes.data) return null;

  return {
    profile: profileRes.data as PatientProfile,
    appointments: (appointmentsRes.data ?? []) as PatientAppointment[],
    prescriptions: (prescriptionsRes.data ?? []) as PatientPrescription[],
    notes: (notesRes.data ?? []) as PatientNote[],
  };
}

export async function savePatientNoteAction(
  patientId: string,
  content: string
): Promise<{ error: string | null }> {
  if (!patientId) return { error: "Patient ID is required." };
  if (!content.trim()) return { error: "Note content cannot be empty." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Security check
  const { data: authCheck } = await supabase
    .from("appointments")
    .select("id")
    .eq("doctor_id", user.id)
    .eq("patient_id", patientId)
    .limit(1)
    .maybeSingle();

  if (!authCheck) return { error: "Patient not found in your records." };

  const { error } = await supabase.from("clinical_notes").insert({
    doctor_id: user.id,
    patient_id: patientId,
    content: content.trim(),
  });

  return { error: error?.message ?? null };
}
