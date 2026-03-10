"use client";

import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  Calendar,
  Download,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
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

// ─── Data ──────────────────────────────────────────────────────

const MONTHLY_REVENUE = [
  { month: "Sep", revenue: 3200 },
  { month: "Oct", revenue: 4100 },
  { month: "Nov", revenue: 3600 },
  { month: "Dec", revenue: 2800 },
  { month: "Jan", revenue: 4400 },
  { month: "Feb", revenue: 4900 },
  { month: "Mar", revenue: 1400 },
];

const PRO_MEMBERS = [
  { name: "Aisha Malik",   avatar: "AM", since: "Jan 2026",  family: 3, nextRenewal: "Jan 2027" },
  { name: "Bilal Hassan",  avatar: "BH", since: "Mar 2025",  family: 2, nextRenewal: "Mar 2026" },
  { name: "Fatima Shah",   avatar: "FS", since: "Feb 2026",  family: 1, nextRenewal: "Feb 2027" },
  { name: "Ahmed Rehman",  avatar: "AR", since: "Oct 2025",  family: 4, nextRenewal: "Oct 2026" },
  { name: "Nadia Jamil",   avatar: "NJ", since: "Nov 2025",  family: 2, nextRenewal: "Nov 2026" },
];

type InvoiceStatus = "paid" | "pending" | "overdue";

interface Invoice {
  id: string;
  patient: string;
  avatar: string;
  type: string;
  date: string;
  amount: number;
  status: InvoiceStatus;
}

const INVOICES: Invoice[] = [
  { id: "INV-2026-038", patient: "Sara Qureshi",   avatar: "SQ", type: "New Patient Consultation",  date: "Mar 10, 2026", amount: 100, status: "pending" },
  { id: "INV-2026-037", patient: "Bilal Hassan",   avatar: "BH", type: "Diabetes Follow-up",         date: "Mar 10, 2026", amount: 100, status: "paid" },
  { id: "INV-2026-036", patient: "Aisha Malik",    avatar: "AM", type: "Hypertension Follow-up",     date: "Mar 10, 2026", amount: 100, status: "paid" },
  { id: "INV-2026-035", patient: "Khaled Noor",    avatar: "KN", type: "Video Consultation",         date: "Mar 8, 2026",  amount: 80,  status: "paid" },
  { id: "INV-2026-034", patient: "Nadia Jamil",    avatar: "NJ", type: "Annual Health Check",        date: "Mar 8, 2026",  amount: 150, status: "paid" },
  { id: "INV-2026-028", patient: "Ahmed Rehman",   avatar: "AR", type: "Cardiac Follow-up",          date: "Feb 15, 2026", amount: 100, status: "paid" },
  { id: "INV-2026-020", patient: "Aisha Malik",    avatar: "AM", type: "Lab Review Consultation",    date: "Feb 10, 2026", amount: 100, status: "paid" },
  { id: "INV-2026-012", patient: "Tariq Mehmood",  avatar: "TM", type: "Consultation (No Show)",     date: "Mar 7, 2026",  amount: 50,  status: "overdue" },
];

const STATUS_META: Record<InvoiceStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  paid:    { label: "Paid",    cls: "bg-vault-positive-light text-vault-positive", icon: <CheckCircle2 className="size-3" /> },
  pending: { label: "Pending", cls: "bg-vault-warning-light text-vault-warning",   icon: <Clock className="size-3" /> },
  overdue: { label: "Overdue", cls: "bg-vault-negative-light text-vault-negative", icon: <AlertCircle className="size-3" /> },
};

// ─── Custom tooltip ────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">${payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function BillingPage() {
  const totalRevenue  = MONTHLY_REVENUE.slice(0, 6).reduce((s, m) => s + m.revenue, 0);
  const thisMonth     = MONTHLY_REVENUE[6].revenue;
  const lastMonth     = MONTHLY_REVENUE[5].revenue;
  const proMembers    = 18;
  const pendingCount  = INVOICES.filter((i) => i.status === "pending").length;
  const overdueCount  = INVOICES.filter((i) => i.status === "overdue").length;

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
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
        {[
          { label: "This Month",    value: `$${thisMonth.toLocaleString()}`, sub: `${thisMonth > lastMonth ? "+" : ""}${Math.round(((thisMonth - lastMonth) / lastMonth) * 100)}% vs last month`, trend: thisMonth > lastMonth ? "up" : "down", icon: <TrendingUp className="size-3.5" />, variant: "primary" },
          { label: "6-Month Total", value: `$${totalRevenue.toLocaleString()}`, sub: "Sep 2025 – Feb 2026", icon: <CreditCard className="size-3.5" /> },
          { label: "Pro Members",   value: String(proMembers), sub: `$${proMembers * 150}/yr subscriptions`, icon: <Users className="size-3.5" /> },
          { label: "Outstanding",   value: `$${INVOICES.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0)}`, sub: `${pendingCount + overdueCount} invoices`, icon: <AlertCircle className="size-3.5" />, variant: overdueCount > 0 ? "warning" : "default" as "warning" | "default" },
        ].map((kpi, i) => (
          <div
            key={i}
            className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
              kpi.variant === "primary" ? "border-[#4D9A7F]/20" :
              kpi.variant === "warning" ? "border-vault-warning/20" : "border-border"
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{kpi.label}</p>
              <span className={`flex size-6 items-center justify-center rounded-lg ${
                kpi.variant === "primary" ? "bg-[#4D9A7F]/10 text-[#4D9A7F]" :
                kpi.variant === "warning" ? "bg-vault-warning-light text-vault-warning" : "bg-muted/60 text-muted-foreground"
              }`}>
                {kpi.icon}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>{kpi.value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Invoices */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Revenue Chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">7-Month Trend</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Revenue</h2>
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-[#4D9A7F]">
              <TrendingUp className="size-3.5" />
              +11% vs 6-month avg
            </span>
          </div>
          <div className="px-3 pb-4 pt-4">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY_REVENUE} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
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

        {/* Recent Invoices */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Invoices</h2>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground">
              View all <ChevronRight className="size-3" />
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {INVOICES.slice(0, 6).map((inv) => {
              const meta = STATUS_META[inv.status];
              return (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/20">
                  <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                    inv.status === "paid" ? "bg-muted/50 text-muted-foreground" : "border border-border bg-card text-foreground"
                  }`}>
                    {inv.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">{inv.patient}</p>
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
            })}
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
            {PRO_MEMBERS.length} of {proMembers} shown
          </span>
        </div>
        <div className="divide-y divide-border/50">
          {PRO_MEMBERS.map((member) => (
            <div key={member.name} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#4D9A7F]/20 bg-[#4D9A7F]/10 text-[11px] font-bold text-[#4D9A7F]">
                {member.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <p className="text-[11px] text-muted-foreground">Member since {member.since}</p>
              </div>
              <div className="hidden shrink-0 text-center sm:block">
                <p className="text-xs font-semibold tabular-nums text-foreground">{member.family}</p>
                <p className="text-[10px] text-muted-foreground">family</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold text-foreground">{member.nextRenewal}</p>
                <p className="text-[10px] text-muted-foreground">renewal</p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <span className="flex items-center gap-1 rounded-full bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F]">
                  <Calendar className="size-2.5" />
                  Pro
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
