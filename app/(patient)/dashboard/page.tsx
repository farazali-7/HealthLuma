"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import {
  Heart,
  Calendar,
  Pill,
  FlaskConical,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Circle,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useUser } from "./context";

// ─── Health Data ──────────────────────────────────────────────

const vitalsData = [
  { month: "Sep", systolic: 128, diastolic: 82 },
  { month: "Oct", systolic: 124, diastolic: 80 },
  { month: "Nov", systolic: 122, diastolic: 78 },
  { month: "Dec", systolic: 126, diastolic: 82 },
  { month: "Jan", systolic: 120, diastolic: 76 },
  { month: "Feb", systolic: 118, diastolic: 75 },
];

const upcomingAppointments = [
  {
    doctor: "Dr. Sarah Ahmed",
    specialty: "Family Medicine",
    date: "Feb 27",
    time: "10:30 AM",
    type: "Follow-up",
    avatar: "SA",
  },
  {
    doctor: "Dr. Omar Khan",
    specialty: "Cardiology",
    date: "Mar 3",
    time: "2:00 PM",
    type: "Consultation",
    avatar: "OK",
  },
  {
    doctor: "Dr. Sarah Ahmed",
    specialty: "Family Medicine",
    date: "Apr 1",
    time: "11:00 AM",
    type: "Annual Checkup",
    avatar: "SA",
  },
];

const labResults = [
  {
    test: "Total Cholesterol",
    value: "182 mg/dL",
    status: "normal" as const,
    date: "Feb 10",
    change: -8,
  },
  {
    test: "Blood Glucose (fasting)",
    value: "94 mg/dL",
    status: "normal" as const,
    date: "Feb 10",
    change: -3,
  },
  {
    test: "HbA1c",
    value: "5.4%",
    status: "normal" as const,
    date: "Feb 10",
    change: -0.2,
  },
  {
    test: "Blood Pressure",
    value: "118/75 mmHg",
    status: "normal" as const,
    date: "Feb 20",
    change: -6,
  },
  {
    test: "Vitamin D (25-OH)",
    value: "28 ng/mL",
    status: "low" as const,
    date: "Feb 10",
    change: 4,
  },
];

const medications = [
  {
    name: "Vitamin D3",
    dose: "2000 IU",
    frequency: "Once daily · morning",
    taken: true,
  },
  {
    name: "Omega-3 Fatty Acids",
    dose: "1000 mg",
    frequency: "Once daily · evening",
    taken: true,
  },
  {
    name: "Metformin",
    dose: "500 mg",
    frequency: "Twice daily",
    taken: false,
  },
];

const takenCount = medications.filter((m) => m.taken).length;
const takenPct = Math.round((takenCount / medications.length) * 100);

// ─── Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useUser();

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Patient";

  const firstName = displayName.split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-7 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── 1. Greeting ──────────────────────────────── */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "0ms" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {greeting}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateStr} &mdash; your vitals are trending well this month
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-vault-positive-light px-3 py-1 text-[11px] font-semibold text-vault-positive">
              <span className="size-1.5 rounded-full bg-vault-positive" />
              On Track
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. KPI Strip ────────────────────────────── */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

          {/* Health Score — typographic hero */}
          <KpiCard
            label="Health Score"
            value={
              <span
                className="text-[2.5rem] font-bold leading-none tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                87
                <span className="ml-1 text-xl font-normal text-muted-foreground">
                  /100
                </span>
              </span>
            }
            change="+3 this month"
            trend="up"
            icon={<Heart className="size-3.5" />}
            variant="primary"
          />

          <KpiCard
            label="Next Appointment"
            value="Feb 27"
            subvalue="Dr. Sarah Ahmed"
            icon={<Calendar className="size-3.5" />}
          />

          <KpiCard
            label="Active Prescriptions"
            value="3"
            subvalue="All current"
            icon={<Pill className="size-3.5" />}
          />

          <KpiCard
            label="Last Visit"
            value="14 days"
            subvalue="Feb 10, 2026"
            icon={<Clock className="size-3.5" />}
          />

          <KpiCard
            label="Pending Results"
            value="1 new"
            subvalue="Vitamin D low"
            icon={<FlaskConical className="size-3.5" />}
            variant="warning"
          />
        </div>
      </section>

      {/* ── 3. Vitals Chart + Appointments ──────────── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "160ms" }}
      >
        {/* Vitals Chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                6-Month Trend
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Blood Pressure
              </h2>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: "var(--vault-chart-1)" }}
                />
                Systolic
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: "var(--vault-chart-3)" }}
                />
                Diastolic
              </span>
            </div>
          </div>

          <div className="px-2 pb-4 pt-3">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={vitalsData}
                  margin={{ top: 8, right: 20, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="2 5"
                    stroke="var(--vault-border-subtle)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[60, 145]}
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                  />
                  <RechartsTooltip content={<VitalsTooltip />} />
                  <ReferenceLine
                    y={120}
                    stroke="var(--vault-warning)"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="var(--vault-chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--vault-chart-1)", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "var(--vault-chart-1)",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="var(--vault-chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "var(--vault-chart-3)", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "var(--vault-chart-3)",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary strip */}
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 px-3 pt-3">
              <MiniStat label="Latest reading" value="118/75" />
              <MiniStat label="6-month average" value="123/79" />
              <MiniStat
                label="Trend"
                value={
                  <span className="flex items-center gap-1 text-vault-positive">
                    <TrendingDown className="size-3" />
                    Improving
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Upcoming
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Appointments
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px] text-muted-foreground"
              asChild
            >
              <Link href="/dashboard/appointments">
                View all <ChevronRight className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border/50">
            {upcomingAppointments.map((appt, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                  <span className="text-[11px] font-semibold text-primary">
                    {appt.avatar}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {appt.doctor}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {appt.specialty} &middot; {appt.type}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground">
                    {appt.date}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{appt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Lab Results + Medications ────────────── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "240ms" }}
      >
        {/* Lab Results */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Recent
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Lab Results
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-[11px] text-muted-foreground"
              asChild
            >
              <Link href="/dashboard/labs">
                View all <ChevronRight className="size-3" />
              </Link>
            </Button>
          </div>

          <div className="divide-y divide-border/50">
            {labResults.map((lab, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      lab.status === "normal"
                        ? "bg-vault-positive"
                        : lab.status === "low"
                        ? "bg-vault-warning"
                        : "bg-vault-negative"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {lab.test}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{lab.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold tabular-nums text-foreground">
                    {lab.value}
                  </p>
                  <div
                    className={`flex items-center gap-0.5 text-[11px] font-medium ${
                      lab.change < 0 ||
                      (lab.change > 0 && lab.status === "low")
                        ? "text-vault-positive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {lab.change <= 0 ? (
                      <TrendingDown className="size-3" />
                    ) : (
                      <TrendingUp className="size-3" />
                    )}
                    {Math.abs(lab.change)}
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      lab.status === "normal"
                        ? "bg-vault-positive-light text-vault-positive"
                        : lab.status === "low"
                        ? "bg-vault-warning-light text-vault-warning"
                        : "bg-vault-negative-light text-vault-negative"
                    }`}
                  >
                    {lab.status === "normal"
                      ? "Normal"
                      : lab.status === "low"
                      ? "Low"
                      : "High"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Medications */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Medications
              </h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {takenCount} of {medications.length} taken
            </span>
          </div>

          <div className="divide-y divide-border/50">
            {medications.map((med, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    med.taken ? "bg-vault-positive-light" : "bg-muted/40"
                  }`}
                >
                  {med.taken ? (
                    <CheckCircle2 className="size-4 text-vault-positive" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/50" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {med.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {med.dose} &middot; {med.frequency}
                  </p>
                </div>
                {med.taken && (
                  <span className="shrink-0 text-[10px] font-semibold text-vault-positive">
                    Taken
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="border-t border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-vault-positive transition-all duration-500"
                  style={{ width: `${takenPct}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                {takenPct}% today
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function KpiCard({
  label,
  value,
  subvalue,
  change,
  trend,
  icon,
  variant = "default",
}: {
  label: string;
  value: ReactNode;
  subvalue?: string;
  change?: string;
  trend?: "up" | "down";
  icon: ReactNode;
  variant?: "default" | "primary" | "warning";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        variant === "primary"
          ? "border-primary/20"
          : variant === "warning"
          ? "border-vault-warning/20"
          : "border-border"
      }`}
    >
      {variant === "primary" && (
        <div className="pointer-events-none absolute inset-0 bg-primary/2" />
      )}

      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex size-6 items-center justify-center rounded-lg text-[11px] ${
            variant === "primary"
              ? "bg-primary/10 text-primary"
              : variant === "warning"
              ? "bg-vault-warning-light text-vault-warning"
              : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {icon}
        </span>
      </div>

      <div className="relative mt-2">
        <div className="text-xl font-semibold leading-none text-foreground">
          {value}
        </div>
        {subvalue && (
          <p className="mt-1.5 text-[11px] text-muted-foreground">{subvalue}</p>
        )}
        {change && trend && (
          <div className="mt-1.5 flex items-center gap-1">
            {trend === "up" ? (
              <TrendingUp className="size-3 text-vault-positive" />
            ) : (
              <TrendingDown className="size-3 text-vault-negative" />
            )}
            <span
              className={`text-[11px] font-medium ${
                trend === "up" ? "text-vault-positive" : "text-vault-negative"
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

function VitalsTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const names: Record<string, string> = {
    systolic: "Systolic",
    diastolic: "Diastolic",
  };

  return (
    <div className="rounded-xl border border-border bg-popover px-3.5 py-2.5 shadow-lg">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2.5 text-sm">
          <span
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">
            {names[entry.name] ?? entry.name}:
          </span>
          <span className="font-semibold tabular-nums text-foreground">
            {entry.value}
          </span>
          <span className="text-[10px] text-muted-foreground">mmHg</span>
        </div>
      ))}
    </div>
  );
}
