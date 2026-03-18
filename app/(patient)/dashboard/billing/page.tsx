"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Crown,
  Download,
  ChevronRight,
  Zap,
  Users,
  Clock,
  Tag,
  X,
  Receipt,
  MapPin,
  Calendar,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getBillingDataAction,
  type BillingData,
  type BillingPayment,
  type BillingSubscription,
} from "./actions";

// ─── Helpers ─────────────────────────────────────────────────────

const APPT_TYPE_LABELS: Record<string, string> = {
  "consultation":         "New Consultation",
  "follow-up":            "Follow-up",
  "checkup":              "Annual Checkup",
  "prescription-review":  "Prescription Review",
};

function fmtCents(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtApptDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function fmtRenewal(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const PRO_PERKS = [
  { icon: <Tag className="size-4" />,   label: "20% off every visit — for your whole family" },
  { icon: <Clock className="size-4" />, label: "Priority appointment slots" },
  { icon: <Zap className="size-4" />,   label: "Same-day urgent booking" },
  { icon: <Users className="size-4" />, label: "Up to 9 family members on one account" },
];

// ─── Invoice Detail Slide-over ────────────────────────────────────

function InvoicePanel({
  payment,
  onClose,
}: {
  payment: BillingPayment;
  onClose: () => void;
}) {
  const isPaid     = payment.status === "paid";
  const isRefunded = payment.status === "refunded";
  const isPending  = payment.status === "pending";

  const apptTypeLabel = payment.appointment
    ? (APPT_TYPE_LABELS[payment.appointment.type] ?? payment.appointment.type)
    : payment.type === "membership"
    ? "Family Care Membership"
    : "Visit";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-xl ${
              isPaid ? "bg-vault-positive-light" : "bg-muted/40"
            }`}>
              <Receipt className={`size-4 ${isPaid ? "text-vault-positive" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Invoice</p>
              <p className="text-sm font-semibold text-foreground">
                {payment.invoice_number ?? "Processing"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Status + Amount */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-3">
              {isPaid && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                  <CheckCircle2 className="size-3" />
                  Paid
                </span>
              )}
              {isRefunded && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  <RotateCcw className="size-3" />
                  Refunded
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-vault-warning-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-warning">
                  <Clock className="size-3" />
                  Pending
                </span>
              )}
              <p
                className="text-2xl font-bold tabular-nums text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {fmtCents(payment.amount_cents, payment.currency)}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isPaid ? "Charged on" : "Created"} {fmtDate(payment.created_at)}
            </p>
          </div>

          {/* Appointment details */}
          {payment.appointment && (
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Appointment
              </p>
              <div className="space-y-2">
                {[
                  { icon: <Receipt className="size-3.5" />,  label: "Service",  value: apptTypeLabel },
                  { icon: <Receipt className="size-3.5" />,  label: "Provider", value: payment.appointment.doctor_name },
                  { icon: <Calendar className="size-3.5" />, label: "Date",     value: fmtApptDate(payment.appointment.appointment_date) },
                  { icon: <Clock className="size-3.5" />,    label: "Time",     value: fmtTime(payment.appointment.start_time) },
                  { icon: <MapPin className="size-3.5" />,   label: "Location", value: payment.appointment.location },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 rounded-lg px-3 py-2.5 text-sm odd:bg-muted/20"
                  >
                    <span className="flex items-center gap-2 text-muted-foreground shrink-0">
                      {icon}
                      {label}
                    </span>
                    <span className="text-right font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Line items */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Breakdown
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">{apptTypeLabel}</span>
                <span className="tabular-nums font-medium text-foreground">
                  {fmtCents(payment.amount_cents, payment.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span className="tabular-nums text-foreground">
                  {fmtCents(payment.amount_cents, payment.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment method */}
          {payment.card_last4 && (
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Payment method
              </p>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    •••• •••• •••• {payment.card_last4}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {isPaid ? "Charged on" : "Card on file"} {fmtDate(payment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-5 py-4">
          <Button className="w-full gap-2" variant="outline" disabled>
            <Download className="size-3.5" />
            Download PDF
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────

function PlanCard({ subscription }: { subscription: BillingSubscription | null }) {
  const isPro = subscription?.status === "active" || subscription?.status === "trialing";

  if (isPro && subscription) {
    return (
      <div
        className="sticky top-6 rounded-2xl border p-6 shadow-sm"
        style={{ background: "#0D1612", borderColor: "rgba(196,151,90,0.22)" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <div
            className="flex size-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(196,151,90,0.15)" }}
          >
            <Crown className="size-5" style={{ color: "#C4975A" }} />
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#C4975A" }}
            >
              Active Membership
            </p>
            <h3 className="text-sm font-semibold" style={{ color: "#EDE8E0" }}>
              Family Care Plan
            </h3>
          </div>
        </div>

        <div
          className="mb-5 rounded-xl p-4"
          style={{
            background: "rgba(77,154,127,0.10)",
            border: "1px solid rgba(77,154,127,0.20)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "#4D9A7F" }}
            >
              Status
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
              style={{ background: "rgba(77,154,127,0.15)", color: "#4D9A7F" }}
            >
              <span className="size-1.5 rounded-full" style={{ background: "#4D9A7F" }} />
              Active
            </span>
          </div>
          {subscription.renews_at && (
            <p className="text-[11px]" style={{ color: "#7D8A85" }}>
              Renews {fmtRenewal(subscription.renews_at)}
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {PRO_PERKS.map((perk, i) => (
            <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "#7D8A85" }}>
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                style={{ background: "rgba(196,151,90,0.10)", color: "#C4975A" }}
              >
                {perk.icon}
              </span>
              {perk.label}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className="sticky top-6 rounded-2xl border p-6 shadow-sm"
      style={{ background: "#0D1612", borderColor: "rgba(196,151,90,0.22)" }}
    >
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: "rgba(196,151,90,0.15)" }}
        >
          <Crown className="size-5" style={{ color: "#C4975A" }} />
        </div>
        <div>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#C4975A" }}
          >
            Upgrade
          </p>
          <h3 className="text-sm font-semibold" style={{ color: "#EDE8E0" }}>
            Family Care Membership
          </h3>
        </div>
      </div>

      <div className="mb-5">
        <span
          className="font-bold leading-none"
          style={{ fontFamily: "var(--font-playfair)", fontSize: "42px", color: "#C4975A" }}
        >
          $150
        </span>
        <span className="ml-1 text-sm" style={{ color: "#7D8A85" }}>
          / year
        </span>
        <p className="mt-2 text-sm" style={{ color: "#7D8A85" }}>
          Pays for itself in just{" "}
          <span className="font-semibold" style={{ color: "#EDE8E0" }}>
            8 family visits.
          </span>
        </p>
      </div>

      <ul className="mb-6 space-y-3">
        {PRO_PERKS.map((perk, i) => (
          <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "#7D8A85" }}>
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "rgba(196,151,90,0.10)", color: "#C4975A" }}
            >
              {perk.icon}
            </span>
            {perk.label}
          </li>
        ))}
      </ul>

      {/* Stripe not yet integrated */}
      <button
        disabled
        className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold opacity-70"
        style={{ background: "#C4975A", color: "#0D1612" }}
        title="Online payments coming soon"
      >
        Join Family Care
        <ChevronRight className="size-4" />
      </button>
      <p className="mt-2 text-center text-[11px]" style={{ color: "#4A5652" }}>
        Annual billing. Cancel anytime — benefits continue to year end.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function BillingPage() {
  const [billingData, setBillingData]         = useState<BillingData | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [fetchError, setFetchError]           = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<BillingPayment | null>(null);

  useEffect(() => {
    getBillingDataAction()
      .then(setBillingData)
      .catch(() => setFetchError("Failed to load billing information."))
      .finally(() => setLoading(false));
  }, []);

  const totalSpentCents = billingData?.stats.totalSpentCents ?? 0;
  const visitCount      = billingData?.stats.visitCountThisYear ?? 0;
  const latestCard      = (billingData?.payments ?? []).find((p) => p.card_last4)?.card_last4 ?? null;

  return (
    <>
      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your current plan, invoices, and payment history
          </p>
        </div>

        {fetchError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3">
            <AlertCircle className="size-4 shrink-0 text-destructive/60" />
            <p className="text-sm text-destructive">{fetchError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* ── Left Column ── */}
          <div className="space-y-5 lg:col-span-7">

            {/* Current Plan */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Current Plan
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">
                    {billingData?.subscription?.status === "active"
                      ? "HealthLuma Family Care"
                      : "HealthLuma Standard"}
                  </h2>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                  {billingData?.subscription?.status === "active" ? "Pro" : "Free"}
                </span>
              </div>
              <p className="mb-5 text-sm text-muted-foreground">
                {billingData?.subscription?.status === "active"
                  ? "Priority slots, 20% off visits, and up to 9 family members on one account."
                  : "Full online booking, digital records, and AI assistant access. Upgrade to Family Care for priority slots and savings."}
              </p>

              <div className="grid grid-cols-2 divide-x divide-border/60 rounded-xl bg-muted/30 overflow-hidden">
                <div className="p-4 text-center">
                  {loading ? (
                    <div className="h-6 w-8 rounded bg-muted/40 animate-pulse mx-auto mb-1" />
                  ) : (
                    <p className="text-lg font-bold tabular-nums text-foreground">{visitCount}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground">visits this year</p>
                </div>
                <div className="p-4 text-center">
                  {loading ? (
                    <div className="h-6 w-16 rounded bg-muted/40 animate-pulse mx-auto mb-1" />
                  ) : (
                    <p className="text-lg font-bold tabular-nums text-foreground">
                      {fmtCents(totalSpentCents)}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground">total spent</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            {latestCard && (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Payment Method
                    </p>
                    <h2 className="mt-0.5 text-sm font-semibold text-foreground">Saved card</h2>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <CreditCard className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• {latestCard}</p>
                    <p className="text-[11px] text-muted-foreground">Used for last payment</p>
                  </div>
                  <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                    On file
                  </span>
                </div>
              </div>
            )}

            {/* Invoice History */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    History
                  </p>
                  <h2 className="mt-0.5 text-sm font-semibold text-foreground">Invoices</h2>
                </div>
              </div>

              {loading ? (
                <div className="divide-y divide-border/50">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-5 py-3.5"
                      style={{ opacity: 1 - i * 0.2 }}
                    >
                      <div className="size-9 rounded-xl bg-muted/40 animate-pulse shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-4 w-48 rounded bg-muted/40 animate-pulse" />
                        <div className="h-3 w-32 rounded bg-muted/30 animate-pulse" />
                      </div>
                      <div className="h-4 w-12 rounded bg-muted/30 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (billingData?.payments ?? []).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
                  <Receipt className="size-7 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No invoices yet</p>
                  <p className="text-[11px] text-muted-foreground/70">
                    Invoices appear here after each visit payment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {(billingData?.payments ?? []).map((payment) => {
                    const isPaid      = payment.status === "paid";
                    const typeLabel   = payment.appointment
                      ? (APPT_TYPE_LABELS[payment.appointment.type] ?? payment.appointment.type)
                      : "Family Care Membership";
                    const doctorLabel = payment.appointment
                      ? ` — ${payment.appointment.doctor_name}`
                      : "";

                    return (
                      <button
                        key={payment.id}
                        onClick={() => setSelectedPayment(payment)}
                        className="group flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                            isPaid ? "bg-vault-positive-light" : "bg-muted/40"
                          }`}>
                            {isPaid
                              ? <CheckCircle2 className="size-4 text-vault-positive" />
                              : <Clock className="size-4 text-muted-foreground" />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {typeLabel}{doctorLabel}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {payment.invoice_number ? `${payment.invoice_number} · ` : ""}
                              {payment.appointment
                                ? fmtApptDate(payment.appointment.appointment_date)
                                : fmtDate(payment.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold tabular-nums text-foreground">
                            {fmtCents(payment.amount_cents, payment.currency)}
                          </span>
                          <ChevronRight className="size-3.5 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {(billingData?.payments?.length ?? 0) > 0 && (
                <div className="border-t border-border/60 px-5 py-3">
                  <p className="text-[11px] text-muted-foreground">
                    Click any invoice to view details.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column — Plan Card ── */}
          <div className="lg:col-span-5">
            <PlanCard subscription={billingData?.subscription ?? null} />
          </div>
        </div>
      </div>

      {/* ── Invoice Slide-over ── */}
      {selectedPayment && (
        <InvoicePanel
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </>
  );
}
