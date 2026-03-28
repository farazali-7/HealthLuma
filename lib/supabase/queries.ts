// ============================================================
// HealthLuma — Server-side Query Functions
// All functions use the server Supabase client (cookie-based session).
// Call these from Server Components, Route Handlers, and Server Actions.
// ============================================================

import { createClient } from "./server";
import type {
  UserRole,
  User,
  Appointment,
  AppointmentWithDoctor,
  AppointmentWithPatient,
  Prescription,
  Document,
  Vital,
  Payment,
  PaymentWithAppointment,
  Subscription,
  Conversation,
  Message,
  FamilyMember,
  ClinicalNote,
  DoctorTask,
  Announcement,
  Notification,
} from "./types";

// ── Re-export types so callers don't need two imports ────────
export type { UserRole };

export interface UserProfile extends User {}


// ============================================================
// AUTH / USER
// ============================================================

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  if (error || !data) return null;
  return data as UserProfile;
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const profile = await getUserProfile(userId);
  return profile?.role ?? "patient";
}

/** Returns the currently authenticated user's profile, or null if not signed in. */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return getUserProfile(user.id);
}


// ============================================================
// PATIENT DASHBOARD
// ============================================================

/** Next upcoming appointment for the patient. */
export async function getNextAppointment(
  patientId: string
): Promise<AppointmentWithDoctor | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      doctor:users!appointments_doctor_id_fkey (
        id, full_name, avatar_url
      ),
      family_member:family_members (
        id, name, relation
      )
    `)
    .eq("patient_id", patientId)
    .eq("status", "upcoming")
    .gte("appointment_date", today)
    .order("appointment_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as unknown as AppointmentWithDoctor;
}

/** Last 6 months of blood pressure vitals for the chart. */
export async function getVitalsHistory(patientId: string): Promise<
  Array<{ month: string; systolic: number; diastolic: number; recorded_at: string }>
> {
  const supabase = await createClient();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data, error } = await supabase
    .from("vitals")
    .select("systolic, diastolic, recorded_at")
    .eq("patient_id", patientId)
    .gte("recorded_at", sixMonthsAgo.toISOString())
    .not("systolic", "is", null)
    .order("recorded_at", { ascending: true });

  if (error || !data) return [];

  return data.map((v) => ({
    month: new Date(v.recorded_at).toLocaleDateString("en-US", { month: "short" }),
    systolic:  v.systolic  ?? 0,
    diastolic: v.diastolic ?? 0,
    recorded_at: v.recorded_at,
  }));
}

/** Active prescriptions for today's medication list. */
export async function getActivePrescriptions(
  patientId: string
): Promise<Prescription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .order("prescribed_at", { ascending: false });

  if (error || !data) return [];
  return data as Prescription[];
}


// ============================================================
// APPOINTMENTS
// ============================================================

/** All appointments for a patient, ordered newest first. */
export async function getPatientAppointments(
  patientId: string,
  status?: Appointment["status"]
): Promise<AppointmentWithDoctor[]> {
  const supabase = await createClient();

  let query = supabase
    .from("appointments")
    .select(`
      *,
      doctor:users!appointments_doctor_id_fkey (
        id, full_name, avatar_url
      ),
      family_member:family_members (
        id, name, relation
      )
    `)
    .eq("patient_id", patientId);

  if (status) query = query.eq("status", status);

  const { data, error } = await query
    .order("appointment_date", { ascending: false })
    .order("start_time",       { ascending: false });

  if (error || !data) return [];
  return data as unknown as AppointmentWithDoctor[];
}

/** Book a new appointment (patient action). */
export async function bookAppointment(input: {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type: Appointment["type"];
  family_member_id?: string;
  is_priority?: boolean;
}): Promise<{ data: Appointment | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .insert(input)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Appointment, error: null };
}

/** Cancel an appointment (patient can only cancel upcoming ones — enforced by RLS). */
export async function cancelAppointment(
  appointmentId: string,
  notes?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", notes: notes ?? null })
    .eq("id", appointmentId);

  return { error: error?.message ?? null };
}

/** Available slots for a given date (computes against existing bookings). */
export async function getAvailableSlots(
  doctorId: string,
  date: string // ISO date: "2026-03-15"
): Promise<string[]> {
  const supabase = await createClient();
  const dayOfWeek = new Date(date).getDay();

  // Get the doctor's schedule for this day
  const { data: schedule } = await supabase
    .from("doctor_availability")
    .select("start_time, end_time, slot_duration_mins")
    .eq("doctor_id", doctorId)
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true);

  if (!schedule || schedule.length === 0) return [];

  // Get already-booked slots for this date
  const { data: booked } = await supabase
    .from("appointments")
    .select("start_time")
    .eq("doctor_id", doctorId)
    .eq("appointment_date", date)
    .not("status", "in", '("cancelled","no-show")');

  const bookedTimes = new Set((booked ?? []).map((b) => b.start_time));

  // Generate all slots from each schedule block
  const slots: string[] = [];
  for (const block of schedule) {
    const [sh, sm] = block.start_time.split(":").map(Number);
    const [eh, em] = block.end_time.split(":").map(Number);
    const startMins = sh * 60 + sm;
    const endMins   = eh * 60 + em;
    const step      = block.slot_duration_mins;

    for (let m = startMins; m < endMins; m += step) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      const timeStr = `${hh}:${mm}`;
      if (!bookedTimes.has(timeStr)) {
        slots.push(timeStr);
      }
    }
  }

  return slots;
}


// ============================================================
// RECORDS — PRESCRIPTIONS & DOCUMENTS
// ============================================================

/** All prescriptions for a patient. */
export async function getPatientPrescriptions(
  patientId: string
): Promise<Prescription[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", patientId)
    .order("prescribed_at", { ascending: false });

  if (error || !data) return [];
  return data as Prescription[];
}

/** All documents for a patient. */
export async function getPatientDocuments(
  patientId: string
): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Document[];
}

/** Upload a document and save its record. */
export async function uploadDocument(input: {
  patientId: string;
  appointmentId?: string;
  name: string;
  type: Document["type"];
  file: File;
}): Promise<{ data: Document | null; error: string | null }> {
  const supabase = await createClient();

  // 1. Upload file to Supabase Storage
  const filePath = `${input.patientId}/${Date.now()}-${input.file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, input.file);

  if (uploadError) return { data: null, error: uploadError.message };

  // 2. Insert record — store the storage path, never a public URL
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("documents")
    .insert({
      patient_id:      input.patientId,
      appointment_id:  input.appointmentId ?? null,
      uploaded_by:     user!.id,
      name:            input.name,
      type:            input.type,
      file_url:        filePath,
      file_size_bytes: input.file.size,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Document, error: null };
}


/** Generate a short-lived signed URL for a private document (1 hour default). */
export async function getSignedDocumentUrl(
  filePath: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, expiresIn);
  if (error || !data) return null;
  return data.signedUrl;
}


// ============================================================
// BILLING
// ============================================================

/** All payments for a patient with appointment details joined. */
export async function getPatientPayments(
  patientId: string
): Promise<PaymentWithAppointment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(`
      *,
      appointment:appointments (
        type, appointment_date, start_time, location
      )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as PaymentWithAppointment[];
}

/** Check if patient has an active Pro subscription. */
export async function getPatientSubscription(
  patientId: string
): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("patient_id", patientId)
    .eq("status", "active")
    .single();

  if (error || !data) return null;
  return data as Subscription;
}

/** Check if patient is a Pro member (quick boolean). */
export async function isProMember(patientId: string): Promise<boolean> {
  const sub = await getPatientSubscription(patientId);
  return sub !== null;
}


// ============================================================
// FAMILY
// ============================================================

export async function getFamilyMembers(
  userId: string
): Promise<FamilyMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("primary_user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as FamilyMember[];
}

export async function addFamilyMember(input: {
  primary_user_id: string;
  name: string;
  relation: FamilyMember["relation"];
  date_of_birth?: string;
}): Promise<{ data: FamilyMember | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("family_members")
    .insert(input)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as FamilyMember, error: null };
}

export async function removeFamilyMember(
  memberId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", memberId);

  return { error: error?.message ?? null };
}


// ============================================================
// AI ASSISTANT
// ============================================================

/** Get or create the patient's current conversation. */
export async function getOrCreateConversation(
  patientId: string
): Promise<Conversation | null> {
  const supabase = await createClient();

  // Return the most recent conversation
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (existing) return existing as Conversation;

  // Create a new one
  const { data, error } = await supabase
    .from("conversations")
    .insert({ patient_id: patientId })
    .select()
    .single();

  if (error || !data) return null;
  return data as Conversation;
}

export async function getConversationMessages(
  conversationId: string
): Promise<Message[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as Message[];
}

export async function saveMessage(input: {
  conversation_id: string;
  role: Message["role"];
  content: string;
}): Promise<Message | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert(input)
    .select()
    .single();

  if (error || !data) return null;
  return data as Message;
}

/** Count user messages this month — used for free-tier limit check. */
export async function getMonthlyMessageCount(
  patientId: string
): Promise<number> {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Step 1: Fetch conversation IDs owned by this patient (no raw SQL)
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .eq("patient_id", patientId);

  const convIds = (convs ?? []).map((c) => c.id);
  if (convIds.length === 0) return 0;

  // Step 2: Count user messages in those conversations this month
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", startOfMonth.toISOString())
    .in("conversation_id", convIds);

  if (error) return 0;
  return count ?? 0;
}


// ============================================================
// DOCTOR — DASHBOARD
// ============================================================

/** Today's patient queue for the doctor. */
export async function getDoctorQueue(
  doctorId: string
): Promise<AppointmentWithPatient[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      patient:users!appointments_patient_id_fkey (
        id, full_name, avatar_url
      ),
      family_member:family_members (
        id, name, relation
      )
    `)
    .eq("doctor_id", doctorId)
    .eq("appointment_date", today)
    .order("start_time", { ascending: true });

  if (error || !data) return [];
  return data as unknown as AppointmentWithPatient[];
}

/** Recent clinical notes written by the doctor. */
export async function getDoctorRecentNotes(
  doctorId: string,
  limit = 5
): Promise<Array<ClinicalNote & { patient: Pick<User, "full_name"> }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinical_notes")
    .select(`
      *,
      patient:users!clinical_notes_patient_id_fkey (
        full_name
      )
    `)
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as unknown as Array<ClinicalNote & { patient: Pick<User, "full_name"> }>;
}

/** Doctor's pending task list. */
export async function getDoctorTasks(
  doctorId: string,
  onlyPending = true
): Promise<Array<DoctorTask & { patient: Pick<User, "full_name"> | null }>> {
  const supabase = await createClient();
  let query = supabase
    .from("doctor_tasks")
    .select(`
      *,
      patient:users!doctor_tasks_patient_id_fkey (
        full_name
      )
    `)
    .eq("doctor_id", doctorId);

  if (onlyPending) query = query.eq("is_done", false);

  const { data, error } = await query
    .order("is_urgent", { ascending: false })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as Array<DoctorTask & { patient: Pick<User, "full_name"> | null }>;
}

export async function toggleDoctorTask(
  taskId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Read current state first
  const { data: task } = await supabase
    .from("doctor_tasks")
    .select("is_done")
    .eq("id", taskId)
    .single();

  const { error } = await supabase
    .from("doctor_tasks")
    .update({ is_done: !task?.is_done })
    .eq("id", taskId);

  return { error: error?.message ?? null };
}


// ============================================================
// DOCTOR — PRESCRIPTIONS
// ============================================================

export async function getDoctorPrescriptions(
  doctorId: string
): Promise<Array<Prescription & { patient: Pick<User, "full_name"> }>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .select(`
      *,
      patient:users!prescriptions_patient_id_fkey (
        full_name
      )
    `)
    .eq("doctor_id", doctorId)
    .order("prescribed_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as Array<Prescription & { patient: Pick<User, "full_name"> }>;
}

export async function createPrescription(
  input: Omit<Prescription, "id" | "created_at" | "updated_at">
): Promise<{ data: Prescription | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("prescriptions")
    .insert(input)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as Prescription, error: null };
}


// ============================================================
// DOCTOR — BILLING / REVENUE
// ============================================================

/** Monthly revenue grouped by month (last N months) — scoped to the given doctor.
 *  NOTE: payments has no doctor_id column. We join through appointments and
 *  filter client-side so membership payments are included. */
export async function getDoctorMonthlyRevenue(
  doctorId: string,
  months = 7
): Promise<Array<{ month: string; revenue: number }>> {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const { data, error } = await supabase
    .from("payments")
    .select(`
      amount_cents,
      created_at,
      type,
      appointment:appointments!payments_appointment_id_fkey (
        doctor_id
      )
    `)
    .eq("status", "paid")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  // Filter to this doctor's payments — appointment payments by doctor_id,
  // membership payments included (no appointment row to join to)
  const doctorPayments = data.filter((p) => {
    const appt = (p as any).appointment as { doctor_id?: string } | null;
    if ((p as any).type === "membership") return true;
    return appt?.doctor_id === doctorId;
  });

  // Group by month client-side
  const grouped = new Map<string, number>();
  for (const p of doctorPayments) {
    const key = new Date(p.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    grouped.set(key, (grouped.get(key) ?? 0) + p.amount_cents / 100);
  }

  return Array.from(grouped.entries()).map(([month, revenue]) => ({
    month,
    revenue,
  }));
}

/** Active Pro members with family count. */
export async function getProMembers(): Promise<
  Array<{
    patient: Pick<User, "full_name">;
    subscription: Pick<Subscription, "started_at" | "renews_at">;
    family_count: number;
  }>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      started_at,
      renews_at,
      patient:users!subscriptions_patient_id_fkey (
        full_name
      ),
      family_members:family_members!family_members_primary_user_id_fkey (
        count
      )
    `)
    .eq("status", "active");

  if (error || !data) return [];
  return data as unknown as Array<{
    patient: Pick<User, "full_name">;
    subscription: Pick<Subscription, "started_at" | "renews_at">;
    family_count: number;
  }>;
}


// ============================================================
// ANNOUNCEMENTS
// ============================================================

/** Published announcements visible to all patients. */
export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Announcement[];
}


// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getUnreadNotifications(
  userId: string
): Promise<Notification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Notification[];
}

export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId);
}
