"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import {
  Calendar,
  Pill,
  FlaskConical,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  FileText,
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
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Feb 27",
    time: "10:30 AM",
    type: "Follow-up",
    avatar: "DJ",
    daysOut: 2,
  },
  {
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Mar 3",
    time: "2:00 PM",
    type: "Consultation",
    avatar: "DJ",
    daysOut: 6,
  },
  {
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Apr 1",
    time: "11:00 AM",
    type: "Annual Checkup",
    avatar: "DJ",
    daysOut: 35,
  },
];

const labResults = [
  { test: "Total Cholesterol",       value: "182 mg/dL",   status: "normal" as const, date: "Feb 10", change: -8   },
  { test: "Blood Glucose (fasting)", value: "94 mg/dL",    status: "normal" as const, date: "Feb 10", change: -3   },
  { test: "HbA1c",                   value: "5.4%",         status: "normal" as const, date: "Feb 10", change: -0.2 },
  { test: "Blood Pressure",          value: "118/75 mmHg", status: "normal" as const, date: "Feb 20", change: -6   },
  { test: "Vitamin D (25-OH)",       value: "28 ng/mL",    status: "low"    as const, date: "Feb 10", change:  4   },
];

const medications = [
  { name: "Vitamin D3",          dose: "2000 IU",  frequency: "Once daily · morning", taken: true  },
  { name: "Omega-3 Fatty Acids", dose: "1000 mg",  frequency: "Once daily · evening", taken: true  },
  { name: "Metformin",           dose: "500 mg",   frequency: "Twice daily",           taken: false },
];

const takenCount = medications.filter((m) => m.taken).length;
const takenPct   = Math.round((takenCount / medications.length) * 100);

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
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const nextAppt = upcomingAppointments[0];

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── 1. Header ────────────────────────────── */}
      <section
        className="flex items-start justify-between gap-4 animate-fade-up"
        style={{ animationDelay: "0ms" }}
      >
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{dateStr}</p>
        </div>

        <Button
          asChild
          size="sm"
          className="hidden shrink-0 items-center gap-1.5 sm:flex"
        >
          <Link href="/dashboard/appointments">
            <Plus className="size-3.5" />
            Book Appointment
          </Link>
        </Button>
      </section>

      {/* ── 2. Next Appointment + Stats ──────────── */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
        {/* Hero — Next Appointment */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-primary/20 bg-card shadow-sm overflow-hidden">
          <div className="h-0.75" style={{ background: "linear-gradient(90deg, var(--vault-chart-3), var(--vault-chart-1))" }} />
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-4">
              Next Appointment
            </p>

            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-[13px] font-bold text-primary">
                {nextAppt.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground truncate">{nextAppt.doctor}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {nextAppt.specialty} · {nextAppt.type}
                </p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-positive-light px-2.5 py-1 text-[10px] font-semibold text-vault-positive">
                <span className="size-1.5 rounded-full bg-vault-positive" />
                In {nextAppt.daysOut} days
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Date</p>
                  <p className="text-sm font-semibold text-foreground">{nextAppt.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-3 py-2.5">
                <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold text-foreground">{nextAppt.time}</p>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-2.5">
              <Button variant="outline" size="sm" className="h-8 flex-1 text-xs" asChild>
                <Link href="/dashboard/appointments">View Details</Link>
              </Button>
              <Button size="sm" className="h-8 flex-1 gap-1 text-xs" asChild>
                <Link href="/dashboard/appointments">
                  <Plus className="size-3" />
                  Book New
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right — 3 compact stat cards */}
        <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Active Prescriptions"
            value="3"
            sub="All current"
            icon={<Pill className="size-3.5" />}
            href="/dashboard/records"
          />
          <StatCard
            label="Last Visit"
            value="14 days ago"
            sub="Feb 10, 2026"
            icon={<Clock className="size-3.5" />}
          />
          <StatCard
            label="Vitamin D"
            value="28 ng/mL"
            sub="Below normal range"
            icon={<FlaskConical className="size-3.5" />}
            variant="warning"
            href="/dashboard/records"
          />
        </div>
      </section>

      {/* ── 3. Quick Actions ─────────────────────── */}
      <section
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up"
        style={{ animationDelay: "140ms" }}
      >
        {[
          { icon: <Calendar className="size-4" />,  label: "Book Appointment", href: "/dashboard/appointments", primary: true },
          { icon: <Sparkles className="size-4" />,   label: "AI Assistant",     href: "/dashboard/ai"           },
          { icon: <FileText className="size-4" />,   label: "My Records",       href: "/dashboard/records"      },
          { icon: <Pill className="size-4" />,        label: "Prescriptions",    href: "/dashboard/records"      },
        ].map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all hover:shadow-sm ${
              action.primary
                ? "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                : "border-border bg-card text-foreground hover:bg-muted/40"
            }`}
          >
            <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
              action.primary
                ? "bg-primary/10 text-primary"
                : "bg-muted/60 text-muted-foreground"
            }`}>
              {action.icon}
            </span>
            <span className="truncate">{action.label}</span>
            <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted-foreground/40" />
          </Link>
        ))}
      </section>

      {/* ── 4. Vitals Chart + Medications ────────── */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 animate-fade-up"
        style={{ animationDelay: "200ms" }}
      >
        {/* Vitals Chart */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                6-Month Trend
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Blood Pressure</h2>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: "var(--vault-chart-1)" }} />
                Systolic
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: "var(--vault-chart-3)" }} />
                Diastolic
              </span>
            </div>
          </div>

          <div className="px-2 pb-4 pt-3">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsData} margin={{ top: 8, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 5" stroke="var(--vault-border-subtle)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[60, 145]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontFamily: "var(--font-dm-sans)" }}
                    tickLine={false}
                    axisLine={false}
                    tickCount={5}
                  />
                  <RechartsTooltip content={<VitalsTooltip />} />
                  <ReferenceLine y={120} stroke="var(--vault-warning)" strokeDasharray="4 3" strokeWidth={1} />
                  <Line
                    type="monotone" dataKey="systolic" stroke="var(--vault-chart-1)" strokeWidth={2}
                    dot={{ r: 3, fill: "var(--vault-chart-1)", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--vault-chart-1)", stroke: "white", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone" dataKey="diastolic" stroke="var(--vault-chart-3)" strokeWidth={2}
                    dot={{ r: 3, fill: "var(--vault-chart-3)", strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: "var(--vault-chart-3)", stroke: "white", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

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

        {/* Medications */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Today</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Medications</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">{takenCount} of {medications.length} taken</span>
          </div>

          <div className="divide-y divide-border/50">
            {medications.map((med, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                  med.taken ? "bg-vault-positive-light" : "bg-muted/40"
                }`}>
                  {med.taken
                    ? <CheckCircle2 className="size-4 text-vault-positive" />
                    : <Circle className="size-4 text-muted-foreground/50" />
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{med.name}</p>
                  <p className="text-[11px] text-muted-foreground">{med.dose} · {med.frequency}</p>
                </div>
                {med.taken && (
                  <span className="shrink-0 text-[10px] font-semibold text-vault-positive">Taken</span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-border/60 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-vault-positive transition-all duration-500"
                  style={{ width: `${takenPct}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{takenPct}% today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Lab Results + Upcoming ────────────── */}
      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 animate-fade-up"
        style={{ animationDelay: "260ms" }}
      >
        {/* Lab Results */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Lab Results</h2>
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
              <Link href="/dashboard/records">View all <ChevronRight className="size-3" /></Link>
            </Button>
          </div>

          <div className="divide-y divide-border/50">
            {labResults.map((lab, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className={`size-1.5 shrink-0 rounded-full ${
                    lab.status === "normal" ? "bg-vault-positive"
                    : lab.status === "low"   ? "bg-vault-warning"
                    : "bg-vault-negative"
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{lab.test}</p>
                    <p className="text-[11px] text-muted-foreground">{lab.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold tabular-nums text-foreground">{lab.value}</p>
                  <div className={`flex items-center gap-0.5 text-[11px] font-medium ${
                    lab.change < 0 || (lab.change > 0 && lab.status === "low")
                      ? "text-vault-positive" : "text-muted-foreground"
                  }`}>
                    {lab.change <= 0
                      ? <TrendingDown className="size-3" />
                      : <TrendingUp className="size-3" />
                    }
                    {Math.abs(lab.change)}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    lab.status === "normal" ? "bg-vault-positive-light text-vault-positive"
                    : lab.status === "low"   ? "bg-vault-warning-light text-vault-warning"
                    : "bg-vault-negative-light text-vault-negative"
                  }`}>
                    {lab.status === "normal" ? "Normal" : lab.status === "low" ? "Low" : "High"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Schedule</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Upcoming</h2>
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
              <Link href="/dashboard/appointments">View all <ChevronRight className="size-3" /></Link>
            </Button>
          </div>

          <div className="divide-y divide-border/50">
            {upcomingAppointments.map((appt, i) => (
              <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                  <span className="text-[11px] font-semibold text-primary">{appt.avatar}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{appt.doctor}</p>
                  <p className="text-[11px] text-muted-foreground">{appt.specialty} · {appt.type}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground">{appt.date}</p>
                  <p className="text-[11px] text-muted-foreground">{appt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  variant = "default",
  href,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ReactNode;
  variant?: "default" | "warning";
  href?: string;
}) {
  const inner = (
    <div className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md h-full ${
      variant === "warning" ? "border-vault-warning/25" : "border-border"
    }`}>
      {variant === "warning" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.75 rounded-b-2xl bg-vault-warning/30" />
      )}
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <span className={`flex size-6 items-center justify-center rounded-lg ${
          variant === "warning"
            ? "bg-vault-warning-light text-vault-warning"
            : "bg-muted/60 text-muted-foreground"
        }`}>
          {icon}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-xl font-semibold text-foreground leading-none">{value}</p>
        {sub && <p className="mt-1.5 text-[11px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );

  if (href) return <Link href={href} className="block h-full">{inner}</Link>;
  return inner;
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{value}</p>
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
          <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{names[entry.name] ?? entry.name}:</span>
          <span className="font-semibold tabular-nums text-foreground">{entry.value}</span>
          <span className="text-[10px] text-muted-foreground">mmHg</span>
        </div>
      ))}
    </div>
  );
}
