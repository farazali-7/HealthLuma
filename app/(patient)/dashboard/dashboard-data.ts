"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────

export interface DashboardAppointment {
  id: string;
  doctor_name: string;
  doctor_specialty: string | null;
  appointment_date: string; // "YYYY-MM-DD"
  start_time: string;       // "HH:MM:SS"
  type: string;
  location: string;
}

export interface VitalReading {
  month: string;
  systolic: number;
  diastolic: number;
}

export interface DashboardPrescription {
  name: string;
  dose: string;
  frequency: string;
  status: "active" | "refill-due" | "completed" | "discontinued";
}

export interface DashboardStats {
  prescriptionCount: number;
  lastVisitDate: string | null; // "YYYY-MM-DD"
  documentCount: number;
}

export interface DashboardData {
  upcomingAppointments: DashboardAppointment[];
  vitals: VitalReading[];
  prescriptions: DashboardPrescription[];
  stats: DashboardStats;
}

// ─── Action ───────────────────────────────────────────────────────

/**
 * Single round-trip to power the entire patient dashboard.
 * Executes five queries in parallel; each is scoped by RLS to the
 * authenticated patient — no patient_id filter needed beyond auth.uid().
 */
export async function getDashboardDataAction(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: DashboardData = {
    upcomingAppointments: [],
    vitals: [],
    prescriptions: [],
    stats: { prescriptionCount: 0, lastVisitDate: null, documentCount: 0 },
  };

  if (!user) return empty;

  const todayStr = new Date().toISOString().split("T")[0];
  const thisYear = new Date().getFullYear();

  const [apptRes, vitalsRes, rxRes, lastVisitRes, docsRes] = await Promise.all([
    // 1. Next 5 upcoming appointments with doctor profile
    supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        start_time,
        type,
        location,
        doctor:users!appointments_doctor_id_fkey (
          full_name,
          specialty
        )
      `)
      .eq("patient_id", user.id)
      .eq("status", "upcoming")
      .gte("appointment_date", todayStr)
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5),

    // 2. Last 12 vital readings for the 6-month BP chart
    supabase
      .from("vitals")
      .select("systolic, diastolic, recorded_at")
      .eq("patient_id", user.id)
      .not("systolic", "is", null)
      .not("diastolic", "is", null)
      .order("recorded_at", { ascending: false })
      .limit(12),

    // 3. Active + refill-due prescriptions for today's medication list
    supabase
      .from("prescriptions")
      .select("medication, dose, frequency, status")
      .eq("patient_id", user.id)
      .in("status", ["active", "refill-due"])
      .order("prescribed_at", { ascending: false }),

    // 4. Most recent completed visit date
    supabase
      .from("appointments")
      .select("appointment_date")
      .eq("patient_id", user.id)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false })
      .limit(1)
      .maybeSingle(),

    // 5. Total document count
    supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id),
  ]);

  // ── Vitals → monthly chart data ──────────────────────────────
  // Average systolic/diastolic per calendar month, maintaining
  // chronological order (oldest → newest) for the chart x-axis.
  const monthAccum = new Map<
    string,
    { systolic: number[]; diastolic: number[]; ts: number }
  >();

  for (const v of vitalsRes.data ?? []) {
    const d = new Date(v.recorded_at);
    const key = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const existing = monthAccum.get(key);
    if (existing) {
      existing.systolic.push(v.systolic as number);
      existing.diastolic.push(v.diastolic as number);
    } else {
      monthAccum.set(key, {
        systolic: [v.systolic as number],
        diastolic: [v.diastolic as number],
        ts: d.getTime(),
      });
    }
    // store the short label alongside the full key
    (monthAccum.get(key) as any).__label = label;
  }

  const avg = (arr: number[]) =>
    Math.round(arr.reduce((s, n) => s + n, 0) / arr.length);

  const vitals: VitalReading[] = [...monthAccum.entries()]
    .sort(([, a], [, b]) => a.ts - b.ts)
    .map(([, entry]) => ({
      month: (entry as any).__label as string,
      systolic: avg(entry.systolic),
      diastolic: avg(entry.diastolic),
    }));

  // ── Upcoming appointments ────────────────────────────────────
  const upcomingAppointments: DashboardAppointment[] = (
    apptRes.data ?? []
  ).map((a: any) => ({
    id: a.id,
    doctor_name: a.doctor?.full_name ?? "Your Doctor",
    doctor_specialty: a.doctor?.specialty ?? null,
    appointment_date: a.appointment_date,
    start_time: a.start_time,
    type: a.type,
    location: a.location,
  }));

  // ── Prescriptions ────────────────────────────────────────────
  const prescriptions: DashboardPrescription[] = (rxRes.data ?? []).map(
    (rx: any) => ({
      name: rx.medication,
      dose: rx.dose,
      frequency: rx.frequency,
      status: rx.status,
    })
  );

  return {
    upcomingAppointments,
    vitals,
    prescriptions,
    stats: {
      prescriptionCount: prescriptions.length,
      lastVisitDate: lastVisitRes.data?.appointment_date ?? null,
      documentCount: docsRes.count ?? 0,
    },
  };
}
