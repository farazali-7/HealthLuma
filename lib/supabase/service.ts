// ============================================================
// HealthLuma — Service Role Client
// ONLY use this in server-side Route Handlers (webhooks, cron jobs).
// NEVER import this in Client Components or expose to the browser.
// The service_role key bypasses ALL RLS policies.
// ============================================================

import { createClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";

/**
 * Creates a Supabase client with the service_role key.
 * Used for:
 * - Stripe webhook handlers (writing payments, subscriptions)
 * - Server-side admin operations
 * - Sending notifications to any user
 */
export function createServiceClient() {
  return createClient(serverEnv.SUPABASE_URL, serverEnv.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      // Service client does not use session cookies
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}


// ── Webhook-specific helpers ─────────────────────────────────
// These bypass RLS — use with care.

/**
 * Records a Stripe webhook event for idempotency.
 * Returns false if the event was already processed (duplicate delivery).
 */
export async function recordWebhookEvent(
  stripeEventId: string,
  type: string,
  payload: object
): Promise<boolean> {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("webhook_events")
    .insert({
      stripe_event_id: stripeEventId,
      type,
      payload: payload as object,
      processed: false,
    });

  // Unique constraint violation = event already exists
  if (error?.code === "23505") return false;
  return !error;
}

export async function markWebhookProcessed(
  stripeEventId: string,
  error?: string
): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("webhook_events")
    .update({
      processed: true,
      processed_at: new Date().toISOString(),
      error: error ?? null,
    })
    .eq("stripe_event_id", stripeEventId);
}

/**
 * Creates or updates a patient subscription after Stripe checkout.
 */
export async function upsertSubscription(input: {
  patient_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: "active" | "cancelled" | "past_due" | "trialing";
  renews_at: string | null;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase
    .from("subscriptions")
    .upsert(
      {
        patient_id:             input.patient_id,
        stripe_subscription_id: input.stripe_subscription_id,
        stripe_customer_id:     input.stripe_customer_id,
        plan:                   "pro",
        status:                 input.status,
        renews_at:              input.renews_at,
      },
      { onConflict: "patient_id" }
    );
}

/**
 * Creates a payment record after a successful Stripe charge.
 */
export async function createPaymentRecord(input: {
  patient_id: string;
  appointment_id?: string;
  subscription_id?: string;
  stripe_payment_intent_id: string;
  stripe_customer_id: string;
  amount_cents: number;
  type: "appointment" | "membership";
  card_last4: string;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("payments").insert({
    patient_id:               input.patient_id,
    appointment_id:           input.appointment_id ?? null,
    subscription_id:          input.subscription_id ?? null,
    stripe_payment_intent_id: input.stripe_payment_intent_id,
    stripe_customer_id:       input.stripe_customer_id,
    amount_cents:             input.amount_cents,
    type:                     input.type,
    status:                   "paid",
    card_last4:               input.card_last4,
  });
}

/**
 * Sends a notification to a user (bypasses RLS since service inserts).
 */
export async function sendNotification(input: {
  user_id: string;
  type: string;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from("notifications").insert({
    user_id: input.user_id,
    type:    input.type,
    title:   input.title,
    body:    input.body,
    link:    input.link ?? null,
  });
}
