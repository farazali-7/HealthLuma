"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ─────────────────────────────────────────────────────

export type UIInvoiceStatus = "paid" | "pending" | "overdue";

export interface BillingInvoice {
  id: string;
  invoice_number: string | null;
  patient_full_name: string;
  type: string;
  date: string;
  amount: number;
  status: UIInvoiceStatus;
}

export interface ProMember {
  id: string;
  full_name: string;
  since: string;
  renews_at: string | null;
  family_count: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DoctorPricing {
  consultation_fee_cents: number;
  pro_annual_fee_cents: number;
  pro_discount_pct: number;
}

export interface BillingData {
  monthlyRevenue: MonthlyRevenue[];
  recentInvoices: BillingInvoice[];
  proMembers: ProMember[];
  pricing: DoctorPricing;
  totalRevenue6m: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  proMemberCount: number;
  pendingCount: number;
  overdueCount: number;
  outstandingCents: number;
}

// ─── Constants ─────────────────────────────────────────────────

const MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TYPE_LABELS: Record<string, string> = {
  "follow-up":            "Follow-up Consultation",
  "consultation":         "New Patient Consultation",
  "checkup":              "Annual Health Check",
  "prescription-review":  "Prescription Review",
};

function mapPaymentStatus(status: string): UIInvoiceStatus {
  if (status === "paid")    return "paid";
  if (status === "pending") return "pending";
  return "overdue";
}

function defaultBillingData(): BillingData {
  return {
    monthlyRevenue:   [],
    recentInvoices:   [],
    proMembers:       [],
    pricing: {
      consultation_fee_cents: 10000,
      pro_annual_fee_cents:   15000,
      pro_discount_pct:       20,
    },
    totalRevenue6m:   0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    proMemberCount:   0,
    pendingCount:     0,
    overdueCount:     0,
    outstandingCents: 0,
  };
}

// ─── Action ────────────────────────────────────────────────────

export async function getDoctorBillingAction(): Promise<BillingData> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return defaultBillingData();

  // 7 months back: first day of 6 months ago
  const now = new Date();
  const sevenMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  const sevenMonthsAgoStr = sevenMonthsAgo.toISOString().split("T")[0];

  const [pricingRes, paymentsRes, subsRes, familyRes] = await Promise.allSettled([
    supabase
      .from("users")
      .select("consultation_fee_cents, pro_annual_fee_cents, pro_discount_pct")
      .eq("id", user.id)
      .single(),

    supabase
      .from("payments")
      .select(`
        id,
        invoice_number,
        amount_cents,
        status,
        type,
        created_at,
        appointment:appointments!payments_appointment_id_fkey (
          type,
          appointment_date
        ),
        patient:users!payments_patient_id_fkey (
          full_name
        )
      `)
      .gte("created_at", sevenMonthsAgoStr)
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("subscriptions")
      .select(`
        id,
        started_at,
        renews_at,
        patient:users!subscriptions_patient_id_fkey (
          id,
          full_name
        )
      `)
      .eq("status", "active"),

    supabase
      .from("family_members")
      .select("primary_user_id"),
  ]);

  // ── Pricing ───────────────────────────────────────────────────
  const pricing: DoctorPricing =
    pricingRes.status === "fulfilled" && pricingRes.value.data
      ? {
          consultation_fee_cents: pricingRes.value.data.consultation_fee_cents ?? 10000,
          pro_annual_fee_cents:   pricingRes.value.data.pro_annual_fee_cents   ?? 15000,
          pro_discount_pct:       pricingRes.value.data.pro_discount_pct       ?? 20,
        }
      : defaultBillingData().pricing;

  // ── Build 7 month bucket keys ─────────────────────────────────
  const monthKeys: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const revenueBuckets = new Map<string, number>();
  for (const k of monthKeys) revenueBuckets.set(k, 0);

  // ── Payments ──────────────────────────────────────────────────
  const payments =
    paymentsRes.status === "fulfilled" ? (paymentsRes.value.data ?? []) : [];

  let pendingCount     = 0;
  let overdueCount     = 0;
  let outstandingCents = 0;

  for (const p of payments) {
    const uiStatus = mapPaymentStatus(p.status as string);
    if (uiStatus === "pending") pendingCount++;
    if (uiStatus === "overdue") overdueCount++;
    if (uiStatus !== "paid")    outstandingCents += (p.amount_cents as number) ?? 0;

    if (uiStatus === "paid") {
      const mk = (p.created_at as string).slice(0, 7);
      if (revenueBuckets.has(mk)) {
        revenueBuckets.set(mk, revenueBuckets.get(mk)! + ((p.amount_cents as number) ?? 0));
      }
    }
  }

  const monthlyRevenue: MonthlyRevenue[] = monthKeys.map((mk) => {
    const mo = parseInt(mk.split("-")[1], 10);
    return {
      month:   MONTH_ABBR[mo - 1],
      revenue: Math.round(revenueBuckets.get(mk)! / 100),
    };
  });

  // KPI revenue values
  const currentMonthKey  = monthKeys[monthKeys.length - 1];
  const previousMonthKey = monthKeys[monthKeys.length - 2];
  const thisMonthRevenue  = Math.round((revenueBuckets.get(currentMonthKey) ?? 0) / 100);
  const lastMonthRevenue  = Math.round((revenueBuckets.get(previousMonthKey) ?? 0) / 100);
  const totalRevenue6m    = monthKeys.slice(0, 6).reduce((sum, k) => sum + (revenueBuckets.get(k) ?? 0), 0);
  const totalRevenue6mDollars = Math.round(totalRevenue6m / 100);

  // ── Recent invoices (first 10) ────────────────────────────────
  const recentInvoices: BillingInvoice[] = payments.slice(0, 10).map((p) => {
    const appt = (p.appointment as { type?: string; appointment_date?: string } | null) ?? null;
    const patient = (p.patient as { full_name?: string } | null) ?? null;

    let typeLabel: string;
    if ((p.type as string) === "membership") {
      typeLabel = "Pro Membership";
    } else {
      const apptType = appt?.type ?? "";
      typeLabel = TYPE_LABELS[apptType] ?? apptType ?? "Appointment";
    }

    const rawDate = new Date(p.created_at as string);
    const dateStr = rawDate.toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });

    return {
      id:                p.id as string,
      invoice_number:    (p.invoice_number as string | null) ?? null,
      patient_full_name: patient?.full_name ?? "Unknown Patient",
      type:              typeLabel,
      date:              dateStr,
      amount:            Math.round(((p.amount_cents as number) ?? 0) / 100),
      status:            mapPaymentStatus(p.status as string),
    };
  });

  // ── Pro members ───────────────────────────────────────────────
  const familyRows =
    familyRes.status === "fulfilled" ? (familyRes.value.data ?? []) : [];

  const familyCountMap = new Map<string, number>();
  for (const row of familyRows) {
    const uid = row.primary_user_id as string;
    familyCountMap.set(uid, (familyCountMap.get(uid) ?? 0) + 1);
  }

  const subscriptions =
    subsRes.status === "fulfilled" ? (subsRes.value.data ?? []) : [];

  const proMembers: ProMember[] = subscriptions.map((sub) => {
    const patient = (sub.patient as { id?: string; full_name?: string } | null) ?? null;
    const pid = patient?.id ?? "";

    const sinceDate = sub.started_at ? new Date(sub.started_at as string) : null;
    const renewDate = sub.renews_at  ? new Date(sub.renews_at  as string) : null;

    const sinceStr = sinceDate
      ? sinceDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : "—";
    const renewStr = renewDate
      ? renewDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      : null;

    return {
      id:           sub.id as string,
      full_name:    patient?.full_name ?? "Unknown",
      since:        sinceStr,
      renews_at:    renewStr,
      family_count: familyCountMap.get(pid) ?? 1,
    };
  });

  return {
    monthlyRevenue,
    recentInvoices,
    proMembers,
    pricing,
    totalRevenue6m:   totalRevenue6mDollars,
    thisMonthRevenue,
    lastMonthRevenue,
    proMemberCount:   subscriptions.length,
    pendingCount,
    overdueCount,
    outstandingCents,
  };
}

// ─── Save Pricing ──────────────────────────────────────────────

export async function savePricingAction(input: {
  consultation_fee_cents: number;
  pro_annual_fee_cents: number;
  pro_discount_pct: number;
}): Promise<{ error: string | null }> {
  if (input.consultation_fee_cents < 0) return { error: "Consultation fee cannot be negative." };
  if (input.pro_annual_fee_cents   < 0) return { error: "Pro annual fee cannot be negative." };
  if (input.pro_discount_pct < 0 || input.pro_discount_pct > 100) {
    return { error: "Discount must be between 0 and 100." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("users")
    .update({
      consultation_fee_cents: Math.round(input.consultation_fee_cents),
      pro_annual_fee_cents:   Math.round(input.pro_annual_fee_cents),
      pro_discount_pct:       Math.round(input.pro_discount_pct),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/doctor/billing");
  return { error: null };
}
