"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ─────────────────────────────────────────────────────

export interface MonthlyPatientData {
  month: string;
  patients: number;
  newPatients: number;
}

export interface AppointmentTypeData {
  name: string;
  value: number;
  color: string;
}

export interface WeeklyLoadData {
  day: string;
  appts: number;
}

export interface ConditionData {
  condition: string;
  count: number;
}

export interface AnalyticsKpi {
  avgPatientsPerDay: number;
  noShowRate: number;
  patientRetention: number;
  totalUniquePatients: number;
}

export interface DoctorAnalyticsData {
  monthlyPatients: MonthlyPatientData[];
  appointmentTypes: AppointmentTypeData[];
  weeklyLoad: WeeklyLoadData[];
  conditions: ConditionData[];
  kpi: AnalyticsKpi;
}

// ─── Constants ─────────────────────────────────────────────────

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TYPE_DISPLAY: Record<string, string> = {
  "follow-up":            "Follow-up",
  "consultation":         "New Patient",
  "checkup":              "Annual Check",
  "prescription-review":  "Consultation",
};

const TYPE_COLORS: Record<string, string> = {
  "follow-up":            "#4D9A7F",
  "consultation":         "#185C45",
  "checkup":              "#7FC4A8",
  "prescription-review":  "#C4975A",
};

// ─── Empty result ──────────────────────────────────────────────

function emptyData(): DoctorAnalyticsData {
  return {
    monthlyPatients:  [],
    appointmentTypes: [],
    weeklyLoad:       [],
    conditions:       [],
    kpi: {
      avgPatientsPerDay:  0,
      noShowRate:         0,
      patientRetention:   0,
      totalUniquePatients: 0,
    },
  };
}

// ─── Action ────────────────────────────────────────────────────

export async function getDoctorAnalyticsAction(): Promise<DoctorAnalyticsData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return emptyData();

  // ── Date ranges ───────────────────────────────────────────────
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // First day of the month 11 months ago → covers 12 complete months
  const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split("T")[0];

  // Monday of this week
  const dow = today.getDay(); // 0=Sun
  const daysBack = dow === 0 ? 6 : dow - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysBack);
  const startOfWeekStr = startOfWeek.toISOString().split("T")[0];
  const endOfWeekStr   = today.toISOString().split("T")[0];

  // ── Parallel queries ──────────────────────────────────────────
  const [apptRes, weekRes, rxRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("appointment_date, type, status, patient_id")
      .eq("doctor_id", user.id)
      .gte("appointment_date", twelveMonthsAgoStr)
      .order("appointment_date", { ascending: true }),

    supabase
      .from("appointments")
      .select("appointment_date")
      .eq("doctor_id", user.id)
      .gte("appointment_date", startOfWeekStr)
      .lte("appointment_date", endOfWeekStr)
      .neq("status", "cancelled"),

    supabase
      .from("prescriptions")
      .select("condition")
      .eq("doctor_id", user.id)
      .not("condition", "is", null)
      .limit(500),
  ]);

  const allAppts   = apptRes.data  ?? [];
  const weekAppts  = weekRes.data  ?? [];
  const rxData     = rxRes.data    ?? [];

  // ── Monthly patients ──────────────────────────────────────────
  // Build ordered list of 12 month keys
  const monthKeys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  // Maps: monthKey → Set of patient_ids
  const monthPatients = new Map<string, Set<string>>();
  const monthNewPats  = new Map<string, Set<string>>();
  for (const k of monthKeys) {
    monthPatients.set(k, new Set());
    monthNewPats.set(k, new Set());
  }

  // Track global first appearance per patient
  const patientFirstMonth = new Map<string, string>();

  for (const appt of allAppts) {
    if (appt.status === "cancelled") continue;
    const d = new Date(appt.appointment_date);
    const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthPatients.has(mk)) continue;

    const pid = appt.patient_id as string;
    monthPatients.get(mk)!.add(pid);

    if (!patientFirstMonth.has(pid)) {
      patientFirstMonth.set(pid, mk);
      monthNewPats.get(mk)!.add(pid);
    }
  }

  const monthlyPatients: MonthlyPatientData[] = monthKeys.map((mk) => {
    const [yr, mo] = mk.split("-").map(Number);
    const label = MONTH_ABBR[mo - 1];
    return {
      month:       label,
      patients:    monthPatients.get(mk)!.size,
      newPatients: monthNewPats.get(mk)!.size,
    };
  });

  // ── Appointment types ──────────────────────────────────────────
  const typeCounts = new Map<string, number>();
  let totalNonCancelled = 0;

  for (const appt of allAppts) {
    if (appt.status === "cancelled") continue;
    totalNonCancelled++;
    const t = (appt.type as string) ?? "consultation";
    typeCounts.set(t, (typeCounts.get(t) ?? 0) + 1);
  }

  const appointmentTypes: AppointmentTypeData[] = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      name:  TYPE_DISPLAY[type] ?? type,
      value: totalNonCancelled > 0 ? Math.round((count / totalNonCancelled) * 100) : 0,
      color: TYPE_COLORS[type] ?? "#94A3B8",
    }))
    .sort((a, b) => b.value - a.value);

  // ── Weekly load ───────────────────────────────────────────────
  const DAY_MAP: Record<number, string> = { 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri" };
  const dayCounts = new Map<number, number>([[1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]);

  for (const appt of weekAppts) {
    const dow = new Date(appt.appointment_date).getDay();
    if (dayCounts.has(dow)) {
      dayCounts.set(dow, dayCounts.get(dow)! + 1);
    }
  }

  const weeklyLoad: WeeklyLoadData[] = [1, 2, 3, 4, 5].map((d) => ({
    day:   DAY_MAP[d],
    appts: dayCounts.get(d) ?? 0,
  }));

  // ── Top conditions ────────────────────────────────────────────
  const condMap   = new Map<string, number>();
  const condLabel = new Map<string, string>();

  for (const rx of rxData) {
    if (!rx.condition) continue;
    const key = (rx.condition as string).trim().toLowerCase();
    if (!condLabel.has(key)) condLabel.set(key, (rx.condition as string).trim());
    condMap.set(key, (condMap.get(key) ?? 0) + 1);
  }

  const conditions: ConditionData[] = Array.from(condMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, count]) => ({ condition: condLabel.get(key) ?? key, count }));

  // ── KPI ───────────────────────────────────────────────────────
  const nonCancelledAppts = allAppts.filter((a) => a.status !== "cancelled");
  const completedAppts    = allAppts.filter((a) => a.status === "completed");
  const noShowCount       = allAppts.filter((a) => a.status === "no-show").length;

  const uniquePatients = new Set(nonCancelledAppts.map((a) => a.patient_id as string));
  const totalUniquePatients = uniquePatients.size;

  // Patients with 2+ visits
  const visitCount = new Map<string, number>();
  for (const appt of nonCancelledAppts) {
    const pid = appt.patient_id as string;
    visitCount.set(pid, (visitCount.get(pid) ?? 0) + 1);
  }
  const repeatPatients = Array.from(visitCount.values()).filter((c) => c >= 2).length;

  const avgPatientsPerDay  = parseFloat((completedAppts.length / (12 * 22)).toFixed(1));
  const noShowRate         = parseFloat((noShowCount / Math.max(1, totalNonCancelled) * 100).toFixed(1));
  const patientRetention   = Math.round(repeatPatients / Math.max(1, totalUniquePatients) * 100);

  return {
    monthlyPatients,
    appointmentTypes,
    weeklyLoad,
    conditions,
    kpi: {
      avgPatientsPerDay,
      noShowRate,
      patientRetention,
      totalUniquePatients,
    },
  };
}
