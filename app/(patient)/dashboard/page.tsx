"use client";

import { useState } from "react";
import Link from "next/link";
import { type ReactNode } from "react";
import {
  Calendar,
  Pill,
  FileText,
  ChevronRight,
  TrendingDown,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  X,
  MapPin,
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

// ─── Types ────────────────────────────────────────────────────

interface UpcomingAppt {
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  avatar: string;
  daysOut: number;
  location: string;
}

// ─── Health Data ──────────────────────────────────────────────

const vitalsData = [
  { month: "Sep", systolic: 128, diastolic: 82 },
  { month: "Oct", systolic: 124, diastolic: 80 },
  { month: "Nov", systolic: 122, diastolic: 78 },
  { month: "Dec", systolic: 126, diastolic: 82 },
  { month: "Jan", systolic: 120, diastolic: 76 },
  { month: "Feb", systolic: 118, diastolic: 75 },
];

const upcomingAppointments: UpcomingAppt[] = [
  {
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Feb 27",
    time: "10:30 AM",
    type: "Follow-up",
    avatar: "DJ",
    daysOut: 2,
    location: "Suite 204, Medical Arts Building",
  },
  {
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Mar 3",
    time: "2:00 PM",
    type: "Consultation",
    avatar: "DJ",
    daysOut: 6,
    location: "Suite 204, Medical Arts Building",
  },
  {
    doctor: "Dr. Jack",
    specialty: "Family Medicine",
    date: "Apr 1",
    time: "11:00 AM",
    type: "Annual Checkup",
    avatar: "DJ",
    daysOut: 35,
    location: "Suite 204, Medical Arts Building",
  },
];

const medications = [
  { name: "Vitamin D3",          dose: "2000 IU",  frequency: "Once daily · morning", taken: true  },
  { name: "Omega-3 Fatty Acids", dose: "1000 mg",  frequency: "Once daily · evening", taken: true  },
  { name: "Metformin",           dose: "500 mg",   frequency: "Twice daily",           taken: false },
];

const takenCount = medications.filter((m) => m.taken).length;
const takenPct   = Math.round((takenCount / medications.length) * 100);

// ─── Appointment Detail Slide-over ────────────────────────────

function AppointmentPanel({
  appt,
  onClose,
}: {
  appt: UpcomingAppt;
  onClose: () => void;
}) {
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
            <div className="flex size-9 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-[11px] font-bold text-primary">
              {appt.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{appt.doctor}</p>
              <p className="text-[11px] text-muted-foreground">{appt.specialty}</p>
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

          {/* Status + type */}
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                <span className="size-1.5 rounded-full bg-vault-positive" />
                Upcoming
              </span>
              <span className="text-[11px] text-muted-foreground">
                In {appt.daysOut} {appt.daysOut === 1 ? "day" : "days"}
              </span>
            </div>
            <p
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {appt.type}
            </p>
          </div>

          {/* Details */}
          <div>
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Details
            </p>
            <div className="space-y-1.5">
              {[
                { icon: <Calendar className="size-3.5" />, label: "Date",     value: appt.date     },
                { icon: <Clock className="size-3.5" />,    label: "Time",     value: appt.time     },
                { icon: <MapPin className="size-3.5" />,   label: "Location", value: appt.location },
              ].map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm odd:bg-muted/20"
                >
                  <span className="flex items-center gap-2 text-muted-foreground">
                    {icon}
                    {label}
                  </span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/60 px-5 py-4 flex flex-col gap-2">
          <Button asChild className="w-full gap-1.5">
            <Link href="/dashboard/appointments">
              View all appointments
              <ChevronRight className="size-3.5" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/appointments">Reschedule</Link>
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────

export default function DashboardPage() {
  const user = useUser();
  const [selectedAppt, setSelectedAppt] = useState<UpcomingAppt | null>(null);

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Patient";

  const firstName = displayName.split(" ")[0];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const nextAppt = upcomingAppointments[0];

  return (
    <>
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
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                  onClick={() => setSelectedAppt(nextAppt)}
                >
                  View Details
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

          {/* Right — Stats strip */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <Link href="/dashboard/records" className="group flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Prescriptions</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <Pill className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>3</p>
                <p className="text-[11px] text-muted-foreground">All current</p>
              </Link>

              <div className="flex flex-col gap-1 px-4 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last Visit</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <Clock className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>14d</p>
                <p className="text-[11px] text-muted-foreground">Feb 10, 2026</p>
              </div>

              <Link href="/dashboard/records" className="group flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Documents</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <FileText className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>6</p>
                <p className="text-[11px] text-muted-foreground">Most recent: Feb 10</p>
              </Link>
            </div>
          </div>
        </section>

        {/* ── 3. Vitals Chart + Medications ────────── */}
        <section
          className="grid grid-cols-1 gap-4 lg:grid-cols-12 animate-fade-up"
          style={{ animationDelay: "140ms" }}
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

        {/* ── 4. Upcoming Appointments ─────────────── */}
        <section
          className="animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Schedule</p>
                <h2 className="mt-0.5 text-sm font-semibold text-foreground">Upcoming Appointments</h2>
              </div>
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
                <Link href="/dashboard/appointments">View all <ChevronRight className="size-3" /></Link>
              </Button>
            </div>

            <div className="divide-y divide-border/50">
              {upcomingAppointments.map((appt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedAppt(appt)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/20"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10">
                    <span className="text-[11px] font-semibold text-primary">{appt.avatar}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{appt.doctor}</p>
                    <p className="text-[11px] text-muted-foreground">{appt.specialty} · {appt.type}</p>
                  </div>
                  <div className="hidden shrink-0 sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="size-3" />
                    <span className="max-w-45 truncate">{appt.location}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-foreground">{appt.date}</p>
                    <p className="text-[11px] text-muted-foreground">{appt.time}</p>
                  </div>
                  <span className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold sm:inline-flex ${
                    appt.daysOut <= 3
                      ? "bg-vault-positive-light text-vault-positive"
                      : appt.daysOut <= 14
                      ? "bg-primary/10 text-primary"
                      : "bg-muted/60 text-muted-foreground"
                  }`}>
                    In {appt.daysOut}d
                  </span>
                  <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Appointment Detail Slide-over ── */}
      {selectedAppt && (
        <AppointmentPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────

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
