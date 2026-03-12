// ============================================================
// HealthLuma — Database TypeScript Types
// Mirrors the schema defined in supabase/schema.sql
// ============================================================

export type UserRole = "patient" | "doctor";

export type AppointmentType =
  | "follow-up"
  | "consultation"
  | "checkup"
  | "prescription-review";

export type AppointmentStatus = "upcoming" | "completed" | "cancelled" | "no-show";

export type PrescriptionStatus = "active" | "completed" | "refill-due" | "discontinued";

export type DocumentType =
  | "consultation-note"
  | "lab-report"
  | "prescription-record"
  | "checkup-summary"
  | "other";

export type PaymentType = "appointment" | "membership";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";

export type SubscriptionStatus = "active" | "cancelled" | "past_due" | "trialing";

export type FamilyRelation = "spouse" | "child" | "parent" | "sibling" | "self" | "other";

export type MessageRole = "user" | "ai";

export type NotificationType =
  | "appointment_reminder"
  | "appointment_confirmed"
  | "appointment_cancelled"
  | "prescription_refill"
  | "new_prescription"
  | "new_document"
  | "pro_renewal"
  | "new_announcement";

// ── Row types (match DB columns 1:1) ────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null; // ISO date
  // Medical profile (added by migration 000006)
  blood_type: string | null;
  gender: string | null;
  smoking_status: string | null;
  allergies: string | null;
  chronic_conditions: string | null;
  other_medications: string | null;
  // Emergency contact
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  // Notification preferences — flat key/boolean map persisted as JSONB
  notification_preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  primary_user_id: string;
  name: string;
  relation: FamilyRelation;
  date_of_birth: string | null;
  created_at: string;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0=Sun … 6=Sat
  start_time: string;  // HH:MM
  end_time: string;
  slot_duration_mins: number;
  is_active: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  family_member_id: string | null;
  appointment_date: string; // ISO date
  start_time: string;       // HH:MM
  end_time: string;
  type: AppointmentType;
  status: AppointmentStatus;
  notes: string | null;
  location: string;
  is_priority: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_id: string | null;
  medication: string;
  dose: string;
  frequency: string;
  duration: string | null;
  condition: string | null;
  refills_total: number;
  refills_used: number;
  status: PrescriptionStatus;
  prescribed_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  uploaded_by: string;
  name: string;
  type: DocumentType;
  file_url: string;
  file_size_bytes: number | null;
  created_at: string;
}

export interface Vital {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  recorded_by: string;
  systolic: number | null;
  diastolic: number | null;
  heart_rate: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  temperature_c: number | null;
  notes: string | null;
  recorded_at: string;
}

export interface Subscription {
  id: string;
  patient_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  plan: "pro";
  status: SubscriptionStatus;
  started_at: string;
  renews_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  patient_id: string;
  appointment_id: string | null;
  subscription_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_customer_id: string | null;
  amount_cents: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  invoice_number: string | null;
  card_last4: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  patient_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface ClinicalNote {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorTask {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  label: string;
  is_urgent: boolean;
  is_done: boolean;
  done_at: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  doctor_id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

// ── Joined / enriched types used in UI ──────────────────────

export interface AppointmentWithDoctor extends Appointment {
  doctor: Pick<User, "id" | "full_name" | "avatar_url">;
  family_member?: Pick<FamilyMember, "id" | "name" | "relation"> | null;
}

export interface AppointmentWithPatient extends Appointment {
  patient: Pick<User, "id" | "full_name" | "avatar_url">;
  family_member?: Pick<FamilyMember, "id" | "name" | "relation"> | null;
}

export interface PaymentWithAppointment extends Payment {
  appointment?: Pick<
    Appointment,
    "type" | "appointment_date" | "start_time" | "location"
  > | null;
}

export interface PrescriptionWithRefills extends Prescription {
  refills_remaining: number; // computed: refills_total - refills_used
}

// ── Database type map (for createClient<Database>()) ────────

export interface Database {
  public: {
    Tables: {
      users:               { Row: User;              Insert: Omit<User, "created_at" | "updated_at">; Update: Partial<User>; Relationships: []; };
      family_members:      { Row: FamilyMember;      Insert: Omit<FamilyMember, "id" | "created_at">; Update: Partial<FamilyMember>; Relationships: []; };
      doctor_availability: { Row: DoctorAvailability; Insert: Omit<DoctorAvailability, "id" | "created_at">; Update: Partial<DoctorAvailability>; Relationships: []; };
      appointments:        { Row: Appointment;       Insert: Omit<Appointment, "id" | "created_at" | "updated_at">; Update: Partial<Appointment>; Relationships: []; };
      prescriptions:       { Row: Prescription;      Insert: Omit<Prescription, "id" | "created_at" | "updated_at">; Update: Partial<Prescription>; Relationships: []; };
      documents:           { Row: Document;          Insert: Omit<Document, "id" | "created_at">; Update: Partial<Document>; Relationships: []; };
      vitals:              { Row: Vital;             Insert: Omit<Vital, "id">; Update: Partial<Vital>; Relationships: []; };
      subscriptions:       { Row: Subscription;      Insert: Omit<Subscription, "id" | "created_at" | "updated_at">; Update: Partial<Subscription>; Relationships: []; };
      payments:            { Row: Payment;           Insert: Omit<Payment, "id" | "invoice_number" | "created_at" | "updated_at">; Update: Partial<Payment>; Relationships: []; };
      conversations:       { Row: Conversation;      Insert: Omit<Conversation, "id" | "created_at" | "updated_at">; Update: Partial<Conversation>; Relationships: []; };
      messages:            { Row: Message;           Insert: Omit<Message, "id" | "created_at">; Update: Partial<Message>; Relationships: []; };
      clinical_notes:      { Row: ClinicalNote;      Insert: Omit<ClinicalNote, "id" | "created_at" | "updated_at">; Update: Partial<ClinicalNote>; Relationships: []; };
      doctor_tasks:        { Row: DoctorTask;        Insert: Omit<DoctorTask, "id" | "done_at" | "created_at">; Update: Partial<DoctorTask>; Relationships: []; };
      announcements:       { Row: Announcement;      Insert: Omit<Announcement, "id" | "created_at" | "updated_at">; Update: Partial<Announcement>; Relationships: []; };
      notifications:       { Row: Notification;      Insert: Omit<Notification, "id" | "created_at">; Update: Partial<Notification>; Relationships: []; };
      webhook_events: {
        Row: {
          id: string;
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          processed: boolean;
          processed_at: string | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          processed?: boolean;
          processed_at?: string | null;
          error?: string | null;
        };
        Update: Partial<{
          processed: boolean;
          processed_at: string | null;
          error: string | null;
        }>;
        Relationships: [];
      };
    };
  };
}
