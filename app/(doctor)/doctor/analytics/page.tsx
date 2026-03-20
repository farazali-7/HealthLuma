"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Clock,
  Activity,
  Repeat,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { getDoctorAnalyticsAction, type DoctorAnalyticsData } from "./actions";

// ─── Constants ─────────────────────────────────────────────────

const CONDITION_COLORS = ["#4D9A7F", "#185C45", "#7FC4A8", "#C4975A", "#94A3B8", "#CBD5E1"];

type Period = "3m" | "6m" | "12m";

const PERIOD_LABELS: Record<Period, string> = {
  "3m":  "Last 3 months",
  "6m":  "Last 6 months",
  "12m": "This year",
};

const PERIOD_SLICES: Record<Period, number> = { "3m": 3, "6m": 6, "12m": 12 };

// ─── Tooltip helper ─────────────────────────────────────────────

function SimpleTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="font-semibold text-foreground">{p.value}</span>
          <span className="text-xs text-muted-foreground">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data,    setData]    = useState<DoctorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period,  setPeriod]  = useState<Period>("6m");

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getDoctorAnalyticsAction();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const slice     = PERIOD_SLICES[period];
  const chartData = (data?.monthlyPatients ?? []).slice(-slice);

  const totalPatients = chartData.reduce((s, m) => s + m.patients,    0);
  const newPatients   = chartData.reduce((s, m) => s + m.newPatients, 0);
  const condTotal     = (data?.conditions ?? []).reduce((s, c) => s + c.count, 0);

  const kpiStats: { label: string; value: string; change: string; up: boolean | null; icon: React.ReactNode }[] = [
    { label: "Avg patients/day",  value: String(data?.kpi.avgPatientsPerDay  ?? "—"), change: "", up: null, icon: <Users    className="size-3.5" /> },
    { label: "No-show rate",      value: `${data?.kpi.noShowRate             ?? "—"}%`, change: "", up: null, icon: <Calendar className="size-3.5" /> },
    { label: "Patient retention", value: `${data?.kpi.patientRetention       ?? "—"}%`, change: "", up: null, icon: <Repeat   className="size-3.5" /> },
    { label: "Total patients",    value: String(data?.kpi.totalUniquePatients ?? "—"), change: "", up: null, icon: <Activity className="size-3.5" /> },
  ];

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice performance — {PERIOD_LABELS[period]}
          </p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 self-start sm:self-auto">
          {(["3m", "6m", "12m"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                period === p ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "3m" ? "3 months" : p === "6m" ? "6 months" : "This year"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="h-2.5 w-24 rounded-full bg-muted/50" />
                  <div className="size-6 rounded-lg bg-muted/50" />
                </div>
                <div className="mt-3 h-6 w-16 rounded-full bg-muted/50" />
                <div className="mt-2 h-2.5 w-12 rounded-full bg-muted/40" />
              </div>
            ))}
          </>
        ) : (
          kpiStats.map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                <span className="flex size-6 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[#4D9A7F]">
                  {kpi.icon}
                </span>
              </div>
              <p className="mt-2 text-xl font-bold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
                {kpi.value}
              </p>
              <div className="mt-1 flex items-center gap-1">
                {kpi.up === true  && <TrendingUp   className="size-3 text-vault-positive" />}
                {kpi.up === false && <TrendingDown  className="size-3 text-vault-negative" />}
                <span className={`text-[10px] font-medium ${
                  kpi.up === true ? "text-vault-positive" : kpi.up === false ? "text-vault-negative" : "text-muted-foreground"
                }`}>
                  {kpi.change}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Row 1: Patient Volume + Appointment Types */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Patient Volume Line Chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{PERIOD_LABELS[period]}</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Patient Volume</h2>
            </div>
            <div className="flex gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#4D9A7F]" />
                Total ({totalPatients})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#C4975A]" />
                New ({newPatients})
              </span>
            </div>
          </div>
          <div className="px-3 pb-4 pt-4">
            {loading ? (
              <div className="h-48 w-full animate-pulse rounded-xl bg-muted/30" />
            ) : chartData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 5" stroke="var(--vault-border-subtle)" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }} tickLine={false} axisLine={false} />
                    <RechartsTooltip content={<SimpleTooltip />} />
                    <Line type="monotone" dataKey="patients"    name="Total" stroke="#4D9A7F" strokeWidth={2} dot={{ r: 3, fill: "#4D9A7F", strokeWidth: 0 }} activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="newPatients" name="New"   stroke="#C4975A" strokeWidth={2} dot={{ r: 3, fill: "#C4975A", strokeWidth: 0 }} activeDot={{ r: 5, stroke: "white", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Appointment Types Donut */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Breakdown</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Appointment Types</h2>
          </div>
          {loading ? (
            <div className="m-5 h-32 w-full animate-pulse rounded-xl bg-muted/30" />
          ) : (data?.appointmentTypes ?? []).length === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <div className="flex items-center gap-4 p-5">
              <div className="h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data?.appointmentTypes ?? []} cx="50%" cy="50%" innerRadius={30} outerRadius={56} paddingAngle={3} dataKey="value">
                      {(data?.appointmentTypes ?? []).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {(data?.appointmentTypes ?? []).map((type, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: type.color }} />
                      <span className="text-xs text-muted-foreground">{type.name}</span>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground">{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Weekly Load + Top Conditions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Weekly Load Bar Chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">This Week</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Daily Appointment Load</h2>
          </div>
          <div className="px-3 pb-4 pt-4">
            {loading ? (
              <div className="h-44 w-full animate-pulse rounded-xl bg-muted/30" />
            ) : (
              <div className="h-44 w-full">
                {(data?.weeklyLoad ?? []).every((d) => d.appts === 0) ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.weeklyLoad ?? []} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 5" stroke="var(--vault-border-subtle)" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                      <RechartsTooltip content={<SimpleTooltip />} />
                      <Bar dataKey="appts" name="Appointments" fill="#4D9A7F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top Conditions */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Prevalence</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Top Patient Conditions</h2>
          </div>
          {loading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse space-y-1.5">
                  <div className="h-3 w-32 rounded-full bg-muted/50" />
                  <div className="h-1.5 w-full rounded-full bg-muted/40" />
                </div>
              ))}
            </div>
          ) : (data?.conditions ?? []).length === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No data yet</div>
          ) : (
            <div className="space-y-3 p-5">
              {(data?.conditions ?? []).map((item, i) => {
                const pct = condTotal > 0 ? Math.round((item.count / condTotal) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.condition}</span>
                      <span className="tabular-nums text-muted-foreground">{item.count} patients &middot; {pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: CONDITION_COLORS[i] ?? "#94A3B8" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
