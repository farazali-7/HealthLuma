"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  notes?: string;
}

// ─── Data ──────────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    day: "15",
    month: "Mar",
    weekday: "Sunday",
    time: "10:30 AM",
    type: "Follow-up",
    status: "upcoming",
  },
  {
    id: "2",
    day: "1",
    month: "Apr",
    weekday: "Wednesday",
    time: "11:00 AM",
    type: "Annual Checkup",
    status: "upcoming",
  },
  {
    id: "3",
    day: "18",
    month: "Apr",
    weekday: "Saturday",
    time: "9:30 AM",
    type: "Prescription Review",
    status: "upcoming",
  },
  {
    id: "4",
    day: "10",
    month: "Feb",
    weekday: "Tuesday",
    time: "9:00 AM",
    type: "Follow-up",
    status: "completed",
    notes:
      "Reviewed lab results. Continue Vitamin D3 supplementation. Recheck in 3 months.",
  },
  {
    id: "5",
    day: "22",
    month: "Jan",
    weekday: "Thursday",
    time: "2:00 PM",
    type: "Consultation",
    status: "completed",
  },
  {
    id: "6",
    day: "8",
    month: "Jan",
    weekday: "Thursday",
    time: "11:00 AM",
    type: "Annual Checkup",
    status: "cancelled",
    notes: "Rescheduled — rebooked for April 1.",
  },
];

const STATUS_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

// ─── Page ───────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<FilterOption>("All");

  const filtered = APPOINTMENTS.filter((a) => {
    if (filter === "All") return true;
    return a.status === filter.toLowerCase();
  });

  const upcomingCount  = APPOINTMENTS.filter((a) => a.status === "upcoming").length;
  const completedCount = APPOINTMENTS.filter((a) => a.status === "completed").length;
  const nextAppt       = APPOINTMENTS.find((a) => a.status === "upcoming");

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Dr. Jack · Family Medicine &amp; General Practice
          </p>
        </div>
        <Button className="shrink-0 gap-2 self-start sm:self-auto">
          <Plus className="size-4" />
          Book Appointment
        </Button>
      </div>

      {/* ── Summary Strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Upcoming",  value: String(upcomingCount),  accent: false },
          { label: "Completed", value: String(completedCount), accent: false },
          {
            label: "Next visit",
            value: nextAppt ? `${nextAppt.month} ${nextAppt.day}` : "—",
            accent: true,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 ${
              stat.accent
                ? "border-primary/20 bg-primary/5"
                : "border-border bg-card"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={`mt-1.5 text-2xl font-semibold tracking-tight ${
                stat.accent ? "text-primary" : "text-foreground"
              }`}
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              filter === f
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="space-y-2.5">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No appointments in this category.
            </p>
          </div>
        )}
        {filtered.map((appt) => (
          <AppointmentCard key={appt.id} appt={appt} />
        ))}
      </div>

      {/* ── Book CTA ── */}
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="size-5 text-primary" />
        </div>
        <h3
          className="mb-1 text-sm font-semibold text-foreground"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Book a visit with Dr. Jack
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Same-week slots available. Confirmed instantly.
        </p>
        <Button size="sm" className="gap-2">
          <Calendar className="size-3.5" />
          View Available Slots
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function AppointmentCard({ appt }: { appt: Appointment }) {
  const isUpcoming  = appt.status === "upcoming";
  const isCompleted = appt.status === "completed";

  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        isUpcoming ? "border-border" : "border-border/50"
      }`}
    >
      <div className="flex gap-4 p-5">

        {/* Date block */}
        <div
          className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-3 ${
            isUpcoming
              ? "border-primary/20 bg-primary/5"
              : isCompleted
              ? "border-vault-positive/20 bg-vault-positive-light"
              : "border-border bg-muted/30"
          }`}
        >
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isUpcoming  ? "text-primary/70"
              : isCompleted ? "text-vault-positive/70"
              : "text-muted-foreground"
            }`}
          >
            {appt.month}
          </span>
          <span
            className={`text-xl font-bold leading-none ${
              isUpcoming  ? "text-primary"
              : isCompleted ? "text-vault-positive"
              : "text-muted-foreground/60"
            }`}
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {appt.day}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {appt.type}
                </span>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Dr. Jack
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  {appt.weekday}, {appt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  Suite 204, Medical Arts Building
                </span>
              </div>
            </div>

            <StatusBadge status={appt.status} />
          </div>

          {appt.notes && (
            <p className="mt-2.5 rounded-lg bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
              {appt.notes}
            </p>
          )}

          {isUpcoming && (
            <div className="mt-3">
              <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                <RotateCcw className="size-3" />
                Reschedule
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "upcoming") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        Upcoming
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
        <CheckCircle2 className="size-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-negative-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-negative">
      <XCircle className="size-3" />
      Cancelled
    </span>
  );
}
