-- ============================================================
-- HealthLuma — Common Query Reference
-- Not for running in full — reference for building API routes.
-- ============================================================


-- ── PATIENT DASHBOARD ────────────────────────────────────────

-- Next upcoming appointment
SELECT
  a.id,
  a.appointment_date,
  a.start_time,
  a.end_time,
  a.type,
  a.status,
  a.location,
  a.is_priority,
  u.full_name AS doctor_name
FROM public.appointments a
JOIN public.users u ON u.id = a.doctor_id
WHERE a.patient_id = auth.uid()
  AND a.status = 'upcoming'
  AND a.appointment_date >= CURRENT_DATE
ORDER BY a.appointment_date ASC, a.start_time ASC
LIMIT 1;


-- Blood pressure vitals (last 6 months) for chart
SELECT
  to_char(recorded_at, 'Mon') AS month,
  systolic,
  diastolic,
  recorded_at
FROM public.vitals
WHERE patient_id = auth.uid()
  AND recorded_at >= now() - INTERVAL '6 months'
  AND systolic IS NOT NULL
ORDER BY recorded_at ASC;


-- Active medications (from prescriptions)
SELECT
  medication  AS name,
  dose,
  frequency,
  refills_total - refills_used AS refills_remaining,
  status
FROM public.prescriptions
WHERE patient_id = auth.uid()
  AND status = 'active'
ORDER BY prescribed_at DESC;


-- ── APPOINTMENTS PAGE ────────────────────────────────────────

-- All appointments for patient (with optional status filter)
SELECT
  a.id,
  a.appointment_date,
  a.start_time,
  a.type,
  a.status,
  a.notes,
  a.location,
  u.full_name AS doctor_name,
  fm.name     AS family_member_name
FROM public.appointments a
JOIN public.users u ON u.id = a.doctor_id
LEFT JOIN public.family_members fm ON fm.id = a.family_member_id
WHERE a.patient_id = auth.uid()
  -- AND a.status = 'upcoming'  -- Uncomment to filter
ORDER BY a.appointment_date DESC, a.start_time DESC;


-- Check slot availability for a given date
SELECT
  gs.slot::time AS slot_time
FROM generate_series(
  '2026-03-15 09:00'::timestamp,
  '2026-03-15 11:30'::timestamp,
  '30 minutes'::interval
) gs(slot)
WHERE NOT EXISTS (
  SELECT 1 FROM public.appointments a
  WHERE a.doctor_id    = '<DOCTOR_UUID>'
    AND a.appointment_date = '2026-03-15'
    AND a.start_time   = gs.slot::time
    AND a.status NOT IN ('cancelled', 'no-show')
);


-- ── RECORDS PAGE ─────────────────────────────────────────────

-- All prescriptions for patient
SELECT
  medication,
  dose,
  frequency,
  duration,
  condition,
  refills_total,
  refills_used,
  status,
  prescribed_at,
  expires_at
FROM public.prescriptions
WHERE patient_id = auth.uid()
ORDER BY
  CASE status WHEN 'active' THEN 0 ELSE 1 END,
  prescribed_at DESC;


-- All documents for patient
SELECT
  id,
  name,
  type,
  file_url,
  file_size_bytes,
  created_at,
  u.role AS uploaded_by_role
FROM public.documents d
JOIN public.users u ON u.id = d.uploaded_by
WHERE d.patient_id = auth.uid()
ORDER BY d.created_at DESC;


-- ── BILLING PAGE ─────────────────────────────────────────────

-- Patient invoice list
SELECT
  p.invoice_number,
  p.amount_cents,
  p.currency,
  p.status,
  p.type,
  p.card_last4,
  p.created_at,
  a.type         AS appointment_type,
  a.appointment_date,
  a.start_time,
  a.location
FROM public.payments p
LEFT JOIN public.appointments a ON a.id = p.appointment_id
WHERE p.patient_id = auth.uid()
ORDER BY p.created_at DESC;


-- Check if patient has active Pro subscription
SELECT
  id,
  status,
  renews_at,
  started_at
FROM public.subscriptions
WHERE patient_id = auth.uid()
  AND status = 'active'
LIMIT 1;


-- ── DOCTOR DASHBOARD ─────────────────────────────────────────

-- Today's patient queue
SELECT
  a.id,
  a.start_time,
  a.type,
  a.status,
  u.full_name AS patient_name,
  fm.name     AS family_member_name,
  a.is_priority
FROM public.appointments a
JOIN public.users u ON u.id = a.patient_id
LEFT JOIN public.family_members fm ON fm.id = a.family_member_id
WHERE a.doctor_id        = auth.uid()
  AND a.appointment_date = CURRENT_DATE
ORDER BY a.start_time ASC;


-- Recent clinical notes (doctor's note feed)
SELECT
  cn.id,
  cn.content,
  cn.created_at,
  u.full_name AS patient_name
FROM public.clinical_notes cn
JOIN public.users u ON u.id = cn.patient_id
WHERE cn.doctor_id = auth.uid()
ORDER BY cn.created_at DESC
LIMIT 10;


-- Doctor task list (pending)
SELECT
  id,
  label,
  is_urgent,
  p.full_name AS patient_name
FROM public.doctor_tasks dt
LEFT JOIN public.users p ON p.id = dt.patient_id
WHERE dt.doctor_id = auth.uid()
  AND dt.is_done   = false
ORDER BY dt.is_urgent DESC, dt.created_at ASC;


-- ── DOCTOR BILLING / ANALYTICS ───────────────────────────────

-- Monthly revenue (last 7 months)
SELECT
  to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
  SUM(amount_cents) / 100.0                             AS revenue
FROM public.payments
WHERE status = 'paid'
GROUP BY date_trunc('month', created_at)
ORDER BY date_trunc('month', created_at) DESC
LIMIT 7;


-- Active Pro members
SELECT
  u.full_name,
  s.started_at,
  s.renews_at,
  COUNT(fm.id) AS family_members_linked
FROM public.subscriptions s
JOIN public.users u ON u.id = s.patient_id
LEFT JOIN public.family_members fm ON fm.primary_user_id = s.patient_id
WHERE s.status = 'active'
GROUP BY u.full_name, s.started_at, s.renews_at
ORDER BY s.started_at DESC;


-- ── AI ASSISTANT ─────────────────────────────────────────────

-- Check monthly message count (for free-tier limit enforcement)
-- Free limit: 10 messages/month. Pro: unlimited.
SELECT COUNT(*) AS messages_this_month
FROM public.messages m
JOIN public.conversations c ON c.id = m.conversation_id
WHERE c.patient_id = auth.uid()
  AND m.role       = 'user'
  AND m.created_at >= date_trunc('month', now());


-- Load conversation history
SELECT
  role,
  content,
  created_at
FROM public.messages
WHERE conversation_id = '<CONVERSATION_UUID>'
ORDER BY created_at ASC;
