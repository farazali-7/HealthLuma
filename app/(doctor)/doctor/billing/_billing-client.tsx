"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Download,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Settings2,
  Percent,
  DollarSign,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  savePricingAction,
  type BillingData,
  type UIInvoiceStatus,
} from "./actions";

// ─── Constants ─────────────────────────────────────────────────

const STATUS_META: Record<UIInvoiceStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:    { label: "Paid",    cls: "bg-vault-positive-light text-vault-positive", icon: <CheckCircle2 className="size-3" /> },
  pending: { label: "Pending", cls: "bg-vault-warning-light text-vault-warning",   icon: <Clock className="size-3" />       },
  overdue: { label: "Overdue", cls: "bg-vault-negative-light text-vault-negative", icon: <AlertCircle className="size-3" /> },
};

// ─── Tooltip ───────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Client Component ──────────────────────────────────────────

export default function BillingClient({ initialData }: { initialData: BillingData }) {
  const [consultFee,    setConsultFee]    = useState(String(initialData.pricing.consultation_fee_cents / 100));
  const [proDiscount,   setProDiscount]   = useState(String(initialData.pricing.pro_discount_pct));
  const [proAnnual,     setProAnnual]     = useState(String(initialData.pricing.pro_annual_fee_cents / 100));
  const [pricingSaved,  setPricingSaved]  = useState(false);
  const [savingPricing, setSavingPricing] = useState(false);

  const {
    thisMonthRevenue,
    lastMonthRevenue,
    totalRevenue6m,
    proMemberCount,
    pendingCount,
    overdueCount,
    outstandingCents,
    monthlyRevenue,
    recentInvoices,
    proMembers,
  } = initialData;

  const outstandingDollars = Math.round(outstandingCents / 100);

  const pctChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0;

  const avgRevenue = Math.round(totalRevenue6m / 6);
  const avgPct     = avgRevenue > 0
    ? Math.round(((thisMonthRevenue - avgRevenue) / avgRevenue) * 100)
    : 0;

  async function handleSavePricing() {
    setSavingPricing(true);
    const result = await savePricingAction({
      consultation_fee_cents: parseFloat(consultFee) * 100,
      pro_annual_fee_cents:   parseFloat(proAnnual)  * 100,
      pro_discount_pct:       parseInt(proDiscount,  10),
    });
    setSavingPricing(false);
    if (!result.error) {
      setPricingSaved(true);
      setTimeout(() => setPricingSaved(false), 2000);
    }
  }

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Billing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Revenue overview and invoice management
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start sm:self-auto">
          <Download className="size-4" />
          Export report
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="relative overflow-hidden rounded-2xl border border-[#4D9A7F]/20 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">This Month</p>
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[#4D9A7F]">
              {pctChange >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
            ${thisMonthRevenue.toLocaleString()}
          </p>
          <p className={`mt-1 text-[11px] font-medium ${pctChange >= 0 ? "text-vault-positive" : "text-vault-negative"}`}>
            {pctChange >= 0 ? "+" : ""}{pctChange}% vs last month
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">6-Month Total</p>
            <span className="flex size-6 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
              <CreditCard className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
            ${totalRevenue6m.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Rolling 6 months</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Pro Members</p>
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#C4975A]/10 text-[#C4975A]">
              <Users className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
            {proMemberCount}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">Active subscriptions</p>
        </div>

        <div className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${overdueCount > 0 ? "border-vault-warning/20" : "border-border"}`}>
          <div className="flex items-start justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Outstanding</p>
            <span className={`flex size-6 items-center justify-center rounded-lg ${overdueCount > 0 ? "bg-vault-warning-light text-vault-warning" : "bg-muted/60 text-muted-foreground"}`}>
              <AlertCircle className="size-3.5" />
            </span>
          </div>
          <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
            ${outstandingDollars}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {pendingCount + overdueCount} invoices
          </p>
        </div>
      </div>

      {/* Chart + Invoices */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">7-Month Trend</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Revenue</h2>
            </div>
            <span className={`flex items-center gap-1 text-xs font-medium ${avgPct >= 0 ? "text-[#4D9A7F]" : "text-vault-negative"}`}>
              {avgPct >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {avgPct >= 0 ? "+" : ""}{avgPct}% vs 6-month avg
            </span>
          </div>
          <div className="px-3 pb-4 pt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenue} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 5" stroke="var(--vault-border-subtle)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
                  <RechartsTooltip content={<RevenueTooltip />} />
                  <Bar dataKey="revenue" fill="#4D9A7F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Invoices</h2>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              View all <ChevronRight className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {recentInvoices.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</div>
            ) : (
              recentInvoices.slice(0, 6).map((inv) => {
                const meta = STATUS_META[inv.status];
                const initials = inv.patient_full_name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={inv.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                      inv.status === "paid" ? "bg-muted/50 text-muted-foreground" : "border border-border bg-card text-foreground"
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{inv.patient_full_name}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.type}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold tabular-nums text-foreground">${inv.amount}</p>
                      <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${meta.cls.split(" ")[1]}`}>
                        {meta.icon}
                        {meta.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pricing Controls */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
          <span className="flex size-8 items-center justify-center rounded-xl bg-[#4D9A7F]/10 text-[#4D9A7F]">
            <Settings2 className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Pricing Controls</h2>
            <p className="text-[11px] text-muted-foreground">Set appointment fees and membership rates — changes apply to future invoices</p>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Consultation Fee
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                </span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={consultFee}
                  onChange={(e) => setConsultFee(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm font-semibold text-foreground tabular-nums focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Per in-clinic appointment</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Family Pro — Annual
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <DollarSign className="size-3.5 text-muted-foreground" />
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={proAnnual}
                  onChange={(e) => setProAnnual(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm font-semibold text-foreground tabular-nums focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Membership per household / year</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Pro Member Discount
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                  <Percent className="size-3.5 text-muted-foreground" />
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="5"
                  value={proDiscount}
                  onChange={(e) => setProDiscount(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm font-semibold text-foreground tabular-nums focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Discount applied per consultation</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-5 text-xs text-muted-foreground">
              <span>
                Standard visit: <span className="font-semibold text-foreground">${consultFee || "—"}</span>
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                Pro member pays:{" "}
                <span className="font-semibold text-[#4D9A7F]">
                  ${consultFee && proDiscount
                    ? (parseFloat(consultFee) * (1 - parseFloat(proDiscount) / 100)).toFixed(0)
                    : "—"}
                </span>
                {proDiscount ? ` (${proDiscount}% off)` : ""}
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                Membership: <span className="font-semibold text-[#C4975A]">${proAnnual || "—"}/yr</span>
              </span>
            </div>
            <Button
              onClick={handleSavePricing}
              disabled={savingPricing}
              className="shrink-0 gap-2 self-start sm:self-auto"
              style={{ background: pricingSaved ? "#185C45" : "#4D9A7F", color: "white" }}
            >
              {savingPricing ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : pricingSaved ? (
                <>
                  <CheckCircle2 className="size-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Pricing
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Pro Members */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Active</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Pro Members</h2>
          </div>
          <span className="rounded-full bg-[#4D9A7F]/10 px-3 py-1 text-xs font-semibold text-[#4D9A7F]">
            {proMembers.length} shown
          </span>
        </div>

        <div className="hidden grid-cols-[40px_1fr_80px_100px_80px] gap-4 border-b border-border/60 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
          <span />
          <span>Member</span>
          <span className="text-center">Family</span>
          <span>Renewal</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-border/50">
          {proMembers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">No active pro members.</div>
          ) : (
            proMembers.map((member) => {
              const initials = member.full_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#4D9A7F]/20 bg-[#4D9A7F]/10 text-[11px] font-bold text-[#4D9A7F]">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{member.full_name}</p>
                    <p className="text-[11px] text-muted-foreground">Member since {member.since}</p>
                  </div>
                  <div className="hidden shrink-0 w-20 text-center sm:block">
                    <p className="text-xs font-semibold tabular-nums text-foreground">{member.family_count}</p>
                    <p className="text-[10px] text-muted-foreground">members</p>
                  </div>
                  <div className="shrink-0 w-24 text-right sm:text-left">
                    <p className="text-xs font-semibold text-foreground">{member.renews_at ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">renewal</p>
                  </div>
                  <div className="hidden shrink-0 sm:block">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F]">
                      <CheckCircle2 className="size-2.5" />
                      Active
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
