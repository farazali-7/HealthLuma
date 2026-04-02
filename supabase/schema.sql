-- ============================================================
-- HealthLuma — Complete Database Schema
-- Paste into Supabase SQL Editor and run in full.
-- Compatible with Supabase (PostgreSQL 15+)
-- ============================================================

-- ── EXTENSIONS ──────────────────────────────────────────────
-- gen_random_uuid() is built-in; pgcrypto not required.
-- Uncomment if uuid_generate_v4() is needed instead:
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- SECTION 1 — UTILITY FUNCTIONS
-- ============================================================

-- Auto-update `updated_at` on any table that has the column.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ============================================================
-- SECTION 2 — IDENTITY
-- ============================================================

-- ── 2.1 users ────────────────────────────────────────────────
-- Extends Supabase auth.users. One row per authenticated user.
-- Role determines which dashboard the user sees.
CREATE TABLE IF NOT EXISTS public.users (
  id            uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text        UNIQUE NOT NULL,
  full_name     text,
  role          text        NOT NULL DEFAULT 'patient'
                            CHECK (role IN ('patient', 'doctor')),
  avatar_url    text,
  phone         text,
  date_of_birth date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create a public.users row whenever someone signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name'
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2.2 family_members ───────────────────────────────────────
-- Non-login members linked to a Pro account holder.
-- Used to book appointments on their behalf.
CREATE TABLE IF NOT EXISTS public.family_members (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_user_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  relation         text        NOT NULL
                               CHECK (relation IN ('spouse', 'child', 'parent', 'sibling', 'self', 'other')),
  date_of_birth    date,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_family_members_user ON public.family_members(primary_user_id);


-- ============================================================
-- SECTION 3 — SCHEDULING
-- ============================================================

-- ── 3.1 doctor_availability ──────────────────────────────────
-- Defines the doctor's weekly recurring schedule.
-- Booked slots are derived by cross-referencing appointments.
CREATE TABLE IF NOT EXISTS public.doctor_availability (
  id                 uuid     PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id          uuid     NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day_of_week        smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time         time     NOT NULL,
  end_time           time     NOT NULL,
  slot_duration_mins smallint NOT NULL DEFAULT 30,
  is_active          boolean  NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX idx_availability_doctor ON public.doctor_availability(doctor_id);


-- ── 3.2 appointments ─────────────────────────────────────────
-- Central entity. Every booking, completed visit, and cancellation
-- lives here. Invoices and clinical records link back to this table.
CREATE TABLE IF NOT EXISTS public.appointments (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  family_member_id uuid        REFERENCES public.family_members(id) ON DELETE SET NULL,
  appointment_date date        NOT NULL,
  start_time       time        NOT NULL,
  end_time         time        NOT NULL,
  type             text        NOT NULL
                               CHECK (type IN ('follow-up', 'consultation', 'checkup', 'prescription-review')),
  status           text        NOT NULL DEFAULT 'upcoming'
                               CHECK (status IN ('upcoming', 'completed', 'cancelled', 'no-show')),
  notes            text,       -- Patient-visible post-visit or cancellation notes
  location         text        NOT NULL DEFAULT 'Suite 204, Medical Arts Building',
  is_priority      boolean     NOT NULL DEFAULT false, -- Pro member priority slot
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_slot CHECK (end_time > start_time)
);

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_appointments_patient    ON public.appointments(patient_id);
CREATE INDEX idx_appointments_doctor     ON public.appointments(doctor_id);
CREATE INDEX idx_appointments_date       ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status     ON public.appointments(status);

-- Prevent double-booking the same doctor slot.
CREATE UNIQUE INDEX idx_no_double_booking
  ON public.appointments(doctor_id, appointment_date, start_time)
  WHERE status NOT IN ('cancelled', 'no-show');


-- ============================================================
-- SECTION 4 — CLINICAL
-- ============================================================

-- ── 4.1 prescriptions ────────────────────────────────────────
-- Doctor-authored prescriptions. Patients view on Records page.
-- refills_used cannot exceed refills_total.
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  doctor_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
  medication     text        NOT NULL,
  dose           text        NOT NULL,
  frequency      text        NOT NULL,
  duration       text,                   -- e.g. "3 months", "Ongoing"
  condition      text,                   -- Clinical indication
  refills_total  smallint    NOT NULL DEFAULT 0,
  refills_used   smallint    NOT NULL DEFAULT 0,
  status         text        NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'completed', 'refill-due', 'discontinued')),
  prescribed_at  date        NOT NULL DEFAULT CURRENT_DATE,
  expires_at     date,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT refills_valid CHECK (refills_used >= 0 AND refills_used <= refills_total)
);

CREATE TRIGGER prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_prescriptions_patient ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_status  ON public.prescriptions(status);


-- ── 4.2 documents ────────────────────────────────────────────
-- Files stored in Supabase Storage (bucket: "documents").
-- Uploaded by patient (lab PDFs) or generated by doctor (notes, summaries).
CREATE TABLE IF NOT EXISTS public.documents (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id  uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
  uploaded_by     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            text        NOT NULL,
  type            text        NOT NULL
                              CHECK (type IN (
                                'consultation-note',
                                'lab-report',
                                'prescription-record',
                                'checkup-summary',
                                'other'
                              )),
  file_url        text        NOT NULL,  -- Supabase Storage public/signed URL
  file_size_bytes bigint,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_patient ON public.documents(patient_id);


-- ── 4.3 vitals ───────────────────────────────────────────────
-- Structured health readings recorded at each visit.
-- Powers the 6-month blood pressure trend chart on the patient dashboard.
CREATE TABLE IF NOT EXISTS public.vitals (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id  uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
  recorded_by     uuid        NOT NULL REFERENCES public.users(id), -- doctor
  systolic        smallint,   -- mmHg
  diastolic       smallint,   -- mmHg
  heart_rate      smallint,   -- bpm
  weight_kg       numeric(5,2),
  height_cm       numeric(5,2),
  temperature_c   numeric(4,1),
  notes           text,
  recorded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_vitals_patient     ON public.vitals(patient_id);
CREATE INDEX idx_vitals_recorded_at ON public.vitals(recorded_at);


-- ── 4.4 clinical_notes ───────────────────────────────────────
-- Internal doctor-written visit notes. NOT visible to patients.
-- Shown in the doctor's "Recent Notes" panel.
CREATE TABLE IF NOT EXISTS public.clinical_notes (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id  uuid        REFERENCES public.appointments(id) ON DELETE SET NULL,
  content         text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER clinical_notes_updated_at
  BEFORE UPDATE ON public.clinical_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_clinical_notes_patient ON public.clinical_notes(patient_id);
CREATE INDEX idx_clinical_notes_doctor  ON public.clinical_notes(doctor_id);


-- ============================================================
-- SECTION 5 — FINANCIAL
-- ============================================================

-- ── 5.1 subscriptions ────────────────────────────────────────
-- Tracks Pro membership (Family Care). One row per subscribed patient.
-- Gates family linking and priority booking behind status = 'active'.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id             uuid        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_subscription_id text        UNIQUE,
  stripe_customer_id     text,
  plan                   text        NOT NULL DEFAULT 'pro' CHECK (plan IN ('pro')),
  status                 text        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  started_at             timestamptz NOT NULL DEFAULT now(),
  renews_at              timestamptz,
  cancelled_at           timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 5.2 payments ─────────────────────────────────────────────
-- One row per financial transaction.
-- type = 'appointment' → links to appointments
-- type = 'membership'  → links to subscriptions
-- Amounts stored in cents to avoid floating-point errors.
CREATE TABLE IF NOT EXISTS public.payments (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id               uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id           uuid        UNIQUE REFERENCES public.appointments(id) ON DELETE SET NULL,
  subscription_id          uuid        REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id text        UNIQUE,
  stripe_customer_id       text,
  amount_cents             integer     NOT NULL CHECK (amount_cents > 0),
  currency                 text        NOT NULL DEFAULT 'usd',
  type                     text        NOT NULL CHECK (type IN ('appointment', 'membership')),
  status                   text        NOT NULL DEFAULT 'pending'
                                       CHECK (status IN ('pending', 'paid', 'refunded', 'failed')),
  invoice_number           text        UNIQUE,  -- Auto-generated: INV-YYYY-NNN
  card_last4               text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_payments_patient ON public.payments(patient_id);
CREATE INDEX idx_payments_status  ON public.payments(status);

-- Auto-generate invoice numbers: INV-2026-001, INV-2026-002, etc.
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  year_str text;
  next_seq integer;
BEGIN
  IF NEW.invoice_number IS NULL THEN
    year_str := to_char(now(), 'YYYY');
    SELECT COALESCE(
      MAX(CAST(split_part(invoice_number, '-', 3) AS integer)), 0
    ) + 1
    INTO next_seq
    FROM public.payments
    WHERE invoice_number LIKE 'INV-' || year_str || '-%';
    NEW.invoice_number := 'INV-' || year_str || '-' || LPAD(next_seq::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_invoice_number
  BEFORE INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();


-- ── 5.3 webhook_events ───────────────────────────────────────
-- Idempotency log for incoming Stripe webhooks.
-- Prevents duplicate processing if Stripe retries a delivery.
-- Access via service_role only — no RLS.
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text        UNIQUE NOT NULL,
  type            text        NOT NULL,   -- e.g. payment_intent.succeeded
  payload         jsonb       NOT NULL,
  processed       boolean     NOT NULL DEFAULT false,
  processed_at    timestamptz,
  error           text,
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- SECTION 6 — AI ASSISTANT
-- ============================================================

-- ── 6.1 conversations ────────────────────────────────────────
-- Session container for the AI health assistant.
-- One conversation groups multiple message turns.
CREATE TABLE IF NOT EXISTS public.conversations (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      text,       -- Auto-generated from first user message
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_conversations_patient ON public.conversations(patient_id);


-- ── 6.2 messages ─────────────────────────────────────────────
-- Individual turns within a conversation.
-- Used to display history and (later) feed context to the AI model.
CREATE TABLE IF NOT EXISTS public.messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            text        NOT NULL CHECK (role IN ('user', 'ai')),
  content         text        NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);


-- ============================================================
-- SECTION 7 — DOCTOR WORKFLOW
-- ============================================================

-- ── 7.1 doctor_tasks ─────────────────────────────────────────
-- Internal to-do list. Visible only to the doctor.
CREATE TABLE IF NOT EXISTS public.doctor_tasks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  label      text        NOT NULL,
  is_urgent  boolean     NOT NULL DEFAULT false,
  is_done    boolean     NOT NULL DEFAULT false,
  done_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctor_tasks_doctor ON public.doctor_tasks(doctor_id);

-- Auto-set done_at when a task is marked complete.
CREATE OR REPLACE FUNCTION public.set_task_done_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_done = true AND OLD.is_done = false THEN
    NEW.done_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER doctor_tasks_done_at
  BEFORE UPDATE ON public.doctor_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_task_done_at();


-- ── 7.2 announcements ────────────────────────────────────────
-- Doctor broadcasts visible to all patients.
CREATE TABLE IF NOT EXISTS public.announcements (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title      text        NOT NULL,
  body       text        NOT NULL,
  published  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- SECTION 8 — NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       text        NOT NULL CHECK (type IN (
               'appointment_reminder',
               'appointment_confirmed',
               'appointment_cancelled',
               'prescription_refill',
               'new_prescription',
               'new_document',
               'pro_renewal',
               'new_announcement'
             )),
  title      text        NOT NULL,
  body       text        NOT NULL,
  link       text,       -- e.g. /dashboard/appointments
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;


-- ============================================================
-- SECTION 9 — ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications      ENABLE ROW LEVEL SECURITY;
-- webhook_events: no RLS — service_role access only


-- Helper: is the current user a doctor?
CREATE OR REPLACE FUNCTION public.is_doctor()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'doctor'
  );
$$;

-- Helper: is the current user a patient?
CREATE OR REPLACE FUNCTION public.is_patient()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'patient'
  );
$$;


-- ── users ────────────────────────────────────────────────────
CREATE POLICY "users: own row"    ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users: own update" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "users: doctor read all patients"
  ON public.users FOR SELECT
  USING (public.is_doctor());

-- ── family_members ───────────────────────────────────────────
CREATE POLICY "family: patient owns"
  ON public.family_members FOR ALL
  USING (primary_user_id = auth.uid());
CREATE POLICY "family: doctor read"
  ON public.family_members FOR SELECT
  USING (public.is_doctor());

-- ── doctor_availability ──────────────────────────────────────
-- All authenticated users can read availability (needed for booking calendar).
CREATE POLICY "availability: read by all"
  ON public.doctor_availability FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "availability: doctor manages"
  ON public.doctor_availability FOR ALL
  USING (doctor_id = auth.uid());

-- ── appointments ─────────────────────────────────────────────
CREATE POLICY "appointments: patient reads own"
  ON public.appointments FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "appointments: patient creates"
  ON public.appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());
CREATE POLICY "appointments: doctor full access"
  ON public.appointments FOR ALL
  USING (public.is_doctor());

-- ── prescriptions ────────────────────────────────────────────
CREATE POLICY "prescriptions: patient reads own"
  ON public.prescriptions FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "prescriptions: doctor full access"
  ON public.prescriptions FOR ALL
  USING (public.is_doctor());

-- ── documents ────────────────────────────────────────────────
CREATE POLICY "documents: patient reads own"
  ON public.documents FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "documents: patient uploads own"
  ON public.documents FOR INSERT
  WITH CHECK (patient_id = auth.uid() AND uploaded_by = auth.uid());
CREATE POLICY "documents: doctor full access"
  ON public.documents FOR ALL
  USING (public.is_doctor());

-- ── vitals ───────────────────────────────────────────────────
CREATE POLICY "vitals: patient reads own"
  ON public.vitals FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "vitals: doctor full access"
  ON public.vitals FOR ALL
  USING (public.is_doctor());

-- ── clinical_notes ───────────────────────────────────────────
-- Patients deliberately cannot read clinical notes (internal use).
CREATE POLICY "clinical_notes: doctor full access"
  ON public.clinical_notes FOR ALL
  USING (public.is_doctor());

-- ── subscriptions ────────────────────────────────────────────
CREATE POLICY "subscriptions: patient reads own"
  ON public.subscriptions FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "subscriptions: doctor reads all"
  ON public.subscriptions FOR SELECT
  USING (public.is_doctor());

-- ── payments ─────────────────────────────────────────────────
CREATE POLICY "payments: patient reads own"
  ON public.payments FOR SELECT
  USING (patient_id = auth.uid());
CREATE POLICY "payments: doctor reads all"
  ON public.payments FOR SELECT
  USING (public.is_doctor());

-- ── conversations ────────────────────────────────────────────
CREATE POLICY "conversations: patient owns"
  ON public.conversations FOR ALL
  USING (patient_id = auth.uid());

-- ── messages ─────────────────────────────────────────────────
CREATE POLICY "messages: patient owns via conversation"
  ON public.messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.patient_id = auth.uid()
    )
  );

-- ── doctor_tasks ─────────────────────────────────────────────
CREATE POLICY "doctor_tasks: doctor only"
  ON public.doctor_tasks FOR ALL
  USING (doctor_id = auth.uid());

-- ── announcements ────────────────────────────────────────────
CREATE POLICY "announcements: doctor manages"
  ON public.announcements FOR ALL
  USING (doctor_id = auth.uid());
CREATE POLICY "announcements: patients read published"
  ON public.announcements FOR SELECT
  USING (published = true AND public.is_patient());

-- ── notifications ────────────────────────────────────────────
CREATE POLICY "notifications: own"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());


-- ============================================================
-- SECTION 10 — SEED DATA
-- ============================================================
-- Run this AFTER creating your doctor account via the signup page.
-- Replace the UUID below with the actual doctor's auth.uid().
-- You can find it in: Supabase Dashboard → Authentication → Users

-- Example: uncomment and replace <DOCTOR_UUID> before running.

/*

-- Default weekly availability for Dr. Emily Carter
-- Mon–Fri: 9am–12pm and 2pm–5pm (30-min slots)
-- Saturday: 9am–12pm only
-- Sunday: closed

INSERT INTO public.doctor_availability (doctor_id, day_of_week, start_time, end_time, slot_duration_mins)
VALUES
  -- Monday
  ('<DOCTOR_UUID>', 1, '09:00', '12:00', 30),
  ('<DOCTOR_UUID>', 1, '14:00', '17:00', 30),
  -- Tuesday
  ('<DOCTOR_UUID>', 2, '09:00', '12:00', 30),
  ('<DOCTOR_UUID>', 2, '14:00', '17:00', 30),
  -- Wednesday
  ('<DOCTOR_UUID>', 3, '09:00', '12:00', 30),
  ('<DOCTOR_UUID>', 3, '14:00', '17:00', 30),
  -- Thursday
  ('<DOCTOR_UUID>', 4, '09:00', '12:00', 30),
  ('<DOCTOR_UUID>', 4, '14:00', '17:00', 30),
  -- Friday
  ('<DOCTOR_UUID>', 5, '09:00', '12:00', 30),
  ('<DOCTOR_UUID>', 5, '14:00', '17:00', 30),
  -- Saturday (morning only)
  ('<DOCTOR_UUID>', 6, '09:00', '12:00', 30);

*/
