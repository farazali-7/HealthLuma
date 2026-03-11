"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

const INVOICES = [
  {
    id: "INV-2026-024",
    description: "Follow-up Consultation — Dr. Jack",
    date: "Feb 10, 2026",
    amount: 100,
    status: "paid" as const,
  },
  {
    id: "INV-2026-008",
    description: "Consultation — Dr. Jack",
    date: "Jan 22, 2026",
    amount: 100,
    status: "paid" as const,
  },
  {
    id: "INV-2026-001",
    description: "Lab Panel — CBC + Metabolic",
    date: "Jan 15, 2026",
    amount: 120,
    status: "paid" as const,
  },
  {
    id: "INV-2025-198",
    description: "Annual Physical — Dr. Jack",
    date: "Oct 14, 2025",
    amount: 100,
    status: "paid" as const,
  },
  {
    id: "INV-2025-140",
    description: "Follow-up Consultation — Dr. Jack",
    date: "Aug 2, 2025",
    amount: 100,
    status: "paid" as const,
  },
];

const PRO_PERKS = [
  { icon: <Tag className="size-4" />, label: "20% off every visit — for your whole family" },
  { icon: <Clock className="size-4" />, label: "Priority appointment slots" },
  { icon: <Zap className="size-4" />, label: "Same-day urgent booking" },
  { icon: <Users className="size-4" />, label: "Up to 9 family members on one account" },
];

// ─── Page ──────────────────────────────────────────────────────

export default function BillingPage() {
  const totalPaid = INVOICES.reduce((sum, inv) => sum + inv.amount, 0);

  return (
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
                  HealthLuma Standard
                </h2>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                Free
              </span>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              Full online booking, digital records, and AI assistant access. Upgrade to Family Care for priority slots and savings across all visits.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/30 p-4">
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums text-foreground">5</p>
                <p className="text-[10px] text-muted-foreground">visits this year</p>
              </div>
              <div className="text-center border-x border-border/60">
                <p className="text-lg font-bold tabular-nums text-foreground">${totalPaid}</p>
                <p className="text-[10px] text-muted-foreground">total spent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold tabular-nums" style={{ color: "#C4975A" }}>
                  ${Math.round(totalPaid * 0.2)}
                </p>
                <p className="text-[10px] text-muted-foreground">you'd save with Pro</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Payment Method
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-foreground">Saved card</h2>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
                Edit
              </Button>
            </div>
            <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                <CreditCard className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                <p className="text-[11px] text-muted-foreground">Expires 08 / 28</p>
              </div>
              <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                Default
              </span>
            </div>
          </div>

          {/* Invoice History */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  History
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-foreground">Invoices</h2>
              </div>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                <Download className="size-3" />
                Export all
              </Button>
            </div>

            <div className="divide-y divide-border/50">
              {INVOICES.map((inv, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-vault-positive-light">
                      <CheckCircle2 className="size-4 text-vault-positive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {inv.description}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {inv.id} &middot; {inv.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      ${inv.amount}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground"
                    >
                      <Download className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column — Upgrade Card ── */}
        <div className="lg:col-span-5">
          <div
            className="sticky top-6 rounded-2xl border p-6 shadow-sm"
            style={{
              background: "#0D1612",
              borderColor: "rgba(196,151,90,0.22)",
            }}
          >
            {/* Crown badge */}
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

            {/* Price */}
            <div className="mb-5">
              <span
                className="font-bold leading-none"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "42px",
                  color: "#C4975A",
                }}
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

            {/* Perks */}
            <ul className="mb-6 space-y-3">
              {PRO_PERKS.map((perk, i) => (
                <li key={i} className="flex items-center gap-3 text-sm" style={{ color: "#7D8A85" }}>
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background: "rgba(196,151,90,0.10)",
                      color: "#C4975A",
                    }}
                  >
                    {perk.icon}
                  </span>
                  {perk.label}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#C4975A", color: "#0D1612" }}
            >
              Join Family Care
              <ChevronRight className="size-4" />
            </button>
            <p className="mt-2 text-center text-[11px]" style={{ color: "#4A5652" }}>
              Annual billing. Cancel anytime — benefits continue to year end.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
