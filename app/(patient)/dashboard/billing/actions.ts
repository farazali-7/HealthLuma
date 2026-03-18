"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────

export interface BillingPayment {
  id: string;
  invoice_number: string | null;
  amount_cents: number;
  currency: string;
  type: "appointment" | "membership";
  status: "pending" | "paid" | "refunded" | "failed";
  card_last4: string | null;
  created_at: string;
  appointment: {
    appointment_date: string;
    start_time: string;
    type: string;
    location: string;
    doctor_name: string;
  } | null;
}

export interface BillingSubscription {
  plan: "pro";
  status: "active" | "cancelled" | "past_due" | "trialing";
  renews_at: string | null;
  started_at: string;
}

export interface BillingData {
  subscription: BillingSubscription | null;
  payments: BillingPayment[];
  stats: {
    visitCountThisYear: number;
    totalSpentCents: number;
  };
}

// ─── Action ───────────────────────────────────────────────────────

/**
 * Fetches the patient's subscription status and full payment history.
 * All queries are scoped by RLS to auth.uid() — no manual patient_id filter needed.
 */
export async function getBillingDataAction(): Promise<BillingData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: BillingData = {
    subscription: null,
    payments: [],
    stats: { visitCountThisYear: 0, totalSpentCents: 0 },
  };

  if (!user) return empty;

  const thisYear = new Date().getFullYear();

  const [subRes, paymentsRes, visitCountRes] = await Promise.all([
    // Active subscription (null if on Standard/free plan)
    supabase
      .from("subscriptions")
      .select("plan, status, renews_at, started_at")
      .eq("patient_id", user.id)
      .maybeSingle(),

    // Full payment history — join appointment for visit details
    supabase
      .from("payments")
      .select(`
        id,
        invoice_number,
        amount_cents,
        currency,
        type,
        status,
        card_last4,
        created_at,
        appointment:appointments (
          appointment_date,
          start_time,
          type,
          location,
          doctor:users!appointments_doctor_id_fkey (
            full_name
          )
        )
      `)
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false }),

    // Completed visit count this calendar year
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", user.id)
      .eq("status", "completed")
      .gte("appointment_date", `${thisYear}-01-01`),
  ]);

  const payments: BillingPayment[] = (paymentsRes.data ?? []).map(
    (p: any) => ({
      id: p.id,
      invoice_number: p.invoice_number,
      amount_cents: p.amount_cents,
      currency: p.currency,
      type: p.type,
      status: p.status,
      card_last4: p.card_last4,
      created_at: p.created_at,
      appointment: p.appointment
        ? {
            appointment_date: p.appointment.appointment_date,
            start_time: p.appointment.start_time,
            type: p.appointment.type,
            location: p.appointment.location,
            doctor_name: p.appointment.doctor?.full_name ?? "Your Doctor",
          }
        : null,
    })
  );

  const paidPayments = payments.filter((p) => p.status === "paid");
  const totalSpentCents = paidPayments.reduce((s, p) => s + p.amount_cents, 0);

  return {
    subscription: subRes.data ?? null,
    payments,
    stats: {
      visitCountThisYear: visitCountRes.count ?? 0,
      totalSpentCents,
    },
  };
}
