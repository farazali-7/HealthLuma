"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import {
  Calendar,
  Pill,
  FileText,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Minus,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  X,
  MapPin,
  AlertCircle,
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
import { BookingModal } from "./_components/BookingModal";
import type { DashboardData, DashboardAppointment } from "./dashboard-data";

// ─── Types ──────────────────────────────────────────────────

interface UpcomingAppt {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: string;
  avatar: string;
  daysOut: number;
  location: string;
}

// ─── Helpers ────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "consultation":        "New Consultation",
  "follow-up":           "Follow-up",
  "checkup":             "Annual Checkup",
  "prescription-review": "Prescription Review",
};

function fmtShortDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function computeDaysOut(dateStr: string): number {
  const appt = new Date(`${dateStr}T12:00:00Z`).getTime();
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  return Math.ceil((appt - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
}

function getInitials(name: string): string {
  return (
    name
      .split(" ")
      .filter((w) => !["Dr.", "Dr", "MD", "PhD", "DO"].includes(w))
      .slice(0, 2)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase() || "DR"
  );
}

function daysSince(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(`${dateStr}T12:00:00Z`).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days < 30) return `${days}d`;
  if (days < 365) return `${Math.floor(days / 30)}mo`;
  return `${Math.floor(days / 365)}yr`;
}

function toUpcomingAppt(a: DashboardAppointment): UpcomingAppt {
  return {
    id:       a.id,
    doctor:   a.doctor_name,
    specialty: a.doctor_specialty ?? "General Practice",
    date:     fmtShortDate(a.appointment_date),
    time:     fmtTime(a.start_time),
    type:     TYPE_LABELS[a.type] ?? a.type,
    avatar:   getInitials(a.doctor_name),
    daysOut:  computeDaysOut(a.appointment_date),
    location: a.location,
  };
}

// ─── Appointment Detail Slide-over ──────────────────────────

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

// ─── Sub-components ─────────────────────────────────────────

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
  const names: Record<string, string> = { systolic: "Systolic", diastolic: "Diastolic" };
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

// ─── Main Client Component ───────────────────────────────────

export function DashboardClient({
  data,
  displayName,
}: {
  data: DashboardData;
  displayName: string;
}) {
  const router = useRouter();
  const [selectedAppt, setSelectedAppt] = useState<UpcomingAppt | null>(null);
  const [bookingOpen, setBookingOpen]   = useState(false);

  const firstName = displayName.split(" ")[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr   = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });

  // Derive display values from server-fetched data
  const upcomingAppts = data.upcomingAppointments.map(toUpcomingAppt);
  const nextAppt      = upcomingAppts[0] ?? null;
  const vitalsData    = data.vitals;
  const medications   = data.prescriptions;
  const stats         = data.stats;

  const takenCount = medications.filter((m) => m.status === "active").length;
  const takenPct   = medications.length > 0
    ? Math.round((takenCount / medications.length) * 100)
    : 0;

  const latestVital   = vitalsData[vitalsData.length - 1];
  const earliestVital = vitalsData[0];
  const trend: "improving" | "worsening" | "stable" = (() => {
    if (!latestVital || !earliestVital || vitalsData.length < 2) return "stable";
    const delta = latestVital.systolic - earliestVital.systolic;
    if (delta < -2) return "improving";
    if (delta > 2)  return "worsening";
    return "stable";
  })();

  return (
    <>
      <BookingModal
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          // Re-run the server component to get fresh data
          router.refresh();
        }}
      />

      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* ── 1. Header ───────────────────────────── */}
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
            size="sm"
            className="hidden shrink-0 items-center gap-1.5 sm:flex"
            onClick={() => setBookingOpen(true)}
          >
            <Plus className="size-3.5" />
            Book Appointment
          </Button>
        </section>

        {/* ── 2. Next Appointment + Stats ─────────── */}
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

              {nextAppt ? (
                <>
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
                      In {nextAppt.daysOut} {nextAppt.daysOut === 1 ? "day" : "days"}
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
                    <Button
                      size="sm"
                      className="h-8 flex-1 gap-1 text-xs"
                      onClick={() => setBookingOpen(true)}
                    >
                      <Plus className="size-3" />
                      Book New
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center py-4">
                  <Calendar className="size-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                  <Button size="sm" className="gap-1.5 text-xs" onClick={() => setBookingOpen(true)}>
                    <Plus className="size-3.5" />
                    Book Now
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right — Stats + Upcoming List */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <Link href="/dashboard/records" className="group flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Prescriptions</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <Pill className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
                  {stats.prescriptionCount || "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.prescriptionCount > 0 ? "All current" : "None active"}
                </p>
              </Link>

              <div className="flex flex-col gap-1 px-4 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Last Visit</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <Clock className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
                  {daysSince(stats.lastVisitDate)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.lastVisitDate ? fmtShortDate(stats.lastVisitDate) : "No visits yet"}
                </p>
              </div>

              <Link href="/dashboard/records" className="group flex flex-col gap-1 px-4 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Documents</span>
                  <span className="flex size-5 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
                    <FileText className="size-3" />
                  </span>
                </div>
                <p className="text-2xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
                  {stats.documentCount || "—"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {stats.documentCount > 0 ? "On file" : "None uploaded"}
                </p>
              </Link>
            </div>

            {/* Upcoming appointments — compact list */}
            <div className="flex-1 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Schedule</p>
                  <h2 className="mt-0.5 text-sm font-semibold text-foreground">Upcoming</h2>
                </div>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-[11px] text-muted-foreground" asChild>
                  <Link href="/dashboard/appointments">View all <ChevronRight className="size-3" /></Link>
                </Button>
              </div>

              {upcomingAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                  <Calendar className="size-6 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {upcomingAppts.map((appt) => (
                    <button
                      key={appt.id}
                      onClick={() => setSelectedAppt(appt)}
                      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/20"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                        <span className="text-[10px] font-bold text-primary">{appt.avatar}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{appt.type}</p>
                        <p className="text-[11px] text-muted-foreground">{appt.date} · {appt.time}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        appt.daysOut <= 3
                          ? "bg-vault-positive-light text-vault-positive"
                          : appt.daysOut <= 14
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/60 text-muted-foreground"
                      }`}>
                        {appt.daysOut}d
                      </span>
                      <ChevronRight className="size-3 shrink-0 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 3. Vitals Chart + Medications ───────── */}
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
              {vitalsData.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center gap-2 text-center">
                  <AlertCircle className="size-6 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No vitals recorded yet</p>
                  <p className="text-[11px] text-muted-foreground/70">Your doctor records these at each visit</p>
                </div>
              ) : (
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
              )}

              {vitalsData.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border/60 px-3 pt-3">
                  <MiniStat
                    label="Latest reading"
                    value={latestVital ? `${latestVital.systolic}/${latestVital.diastolic}` : "—"}
                  />
                  <MiniStat
                    label="6-month avg"
                    value={
                      vitalsData.length > 0
                        ? `${Math.round(vitalsData.reduce((s, v) => s + v.systolic, 0) / vitalsData.length)}/${Math.round(vitalsData.reduce((s, v) => s + v.diastolic, 0) / vitalsData.length)}`
                        : "—"
                    }
                  />
                  <MiniStat
                    label="Trend"
                    value={
                      trend === "improving" ? (
                        <span className="flex items-center gap-1 text-vault-positive">
                          <TrendingDown className="size-3" /> Improving
                        </span>
                      ) : trend === "worsening" ? (
                        <span className="flex items-center gap-1 text-vault-negative">
                          <TrendingUp className="size-3" /> Rising
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Minus className="size-3" /> Stable
                        </span>
                      )
                    }
                  />
                </div>
              )}
            </div>
          </div>

          {/* Medications */}
          <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active</p>
                <h2 className="mt-0.5 text-sm font-semibold text-foreground">Medications</h2>
              </div>
              <span className="text-[11px] text-muted-foreground">
                {medications.length > 0 ? `${takenCount} of ${medications.length} active` : "None prescribed"}
              </span>
            </div>

            {medications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
                <Pill className="size-6 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No active prescriptions</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border/50">
                  {medications.map((med, i) => {
                    const isActive    = med.status === "active";
                    const isRefillDue = med.status === "refill-due";
                    return (
                      <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20">
                        <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                          isActive    ? "bg-vault-positive-light" :
                          isRefillDue ? "bg-vault-warning-light"  :
                          "bg-muted/40"
                        }`}>
                          {isActive
                            ? <CheckCircle2 className="size-4 text-vault-positive" />
                            : isRefillDue
                            ? <AlertCircle className="size-4 text-vault-warning" />
                            : <Circle className="size-4 text-muted-foreground/50" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">{med.name}</p>
                          <p className="text-[11px] text-muted-foreground">{med.dose} · {med.frequency}</p>
                        </div>
                        {isActive    && <span className="shrink-0 text-[10px] font-semibold text-vault-positive">Active</span>}
                        {isRefillDue && <span className="shrink-0 text-[10px] font-semibold text-vault-warning">Refill due</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border/60 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                      <div
                        className="h-full rounded-full bg-vault-positive transition-all duration-500"
                        style={{ width: `${takenPct}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{takenPct}% active</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </div>

      {/* ── Appointment Detail Slide-over ─── */}
      {selectedAppt && (
        <AppointmentPanel
          appt={selectedAppt}
          onClose={() => setSelectedAppt(null)}
        />
      )}
    </>
  );
}
