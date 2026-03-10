"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  avatar: string;
  date: string;
  time: string;
  type: string;
  mode: "in-person" | "video";
  location?: string;
  status: AppointmentStatus;
  notes?: string;
}

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    doctor: "Dr. Sarah Ahmed",
    specialty: "Family Medicine",
    avatar: "SA",
    date: "Mar 15, 2026",
    time: "10:30 AM",
    type: "Follow-up",
    mode: "in-person",
    location: "Suite 204, HealthLuma Clinic",
    status: "upcoming",
  },
  {
    id: "2",
    doctor: "Dr. Omar Khan",
    specialty: "Cardiology",
    avatar: "OK",
    date: "Mar 22, 2026",
    time: "2:00 PM",
    type: "Consultation",
    mode: "video",
    status: "upcoming",
    notes: "Bring 6-month BP log",
  },
  {
    id: "3",
    doctor: "Dr. Sarah Ahmed",
    specialty: "Family Medicine",
    avatar: "SA",
    date: "Apr 1, 2026",
    time: "11:00 AM",
    type: "Annual Checkup",
    mode: "in-person",
    location: "Suite 204, HealthLuma Clinic",
    status: "upcoming",
  },
  {
    id: "4",
    doctor: "Dr. Sarah Ahmed",
    specialty: "Family Medicine",
    avatar: "SA",
    date: "Feb 10, 2026",
    time: "9:00 AM",
    type: "Follow-up",
    mode: "in-person",
    location: "Suite 204, HealthLuma Clinic",
    status: "completed",
    notes: "Reviewed lab results. Continue Vitamin D3 supplementation.",
  },
  {
    id: "5",
    doctor: "Dr. Ayesha Malik",
    specialty: "Dermatology",
    avatar: "AM",
    date: "Jan 28, 2026",
    time: "3:30 PM",
    type: "Consultation",
    mode: "video",
    status: "completed",
  },
  {
    id: "6",
    doctor: "Dr. Omar Khan",
    specialty: "Cardiology",
    avatar: "OK",
    date: "Jan 15, 2026",
    time: "11:00 AM",
    type: "Consultation",
    mode: "in-person",
    location: "Cardiac Centre, Block B",
    status: "cancelled",
    notes: "Rescheduled to March 22",
  },
];

const STATUS_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

// ─── Page ──────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [filter, setFilter] = useState<FilterOption>("All");

  const filtered = APPOINTMENTS.filter((a) => {
    if (filter === "All") return true;
    return a.status === filter.toLowerCase();
  });

  const upcomingCount = APPOINTMENTS.filter((a) => a.status === "upcoming").length;

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {upcomingCount} upcoming · book a new slot below
          </p>
        </div>
        <Button
          className="gap-2 self-start sm:self-auto"
          style={{ background: "var(--primary)" }}
        >
          <Plus className="size-4" />
          Book Appointment
        </Button>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
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

      {/* ── Appointment List ── */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No appointments in this category.</p>
          </div>
        )}

        {filtered.map((appt) => (
          <AppointmentCard key={appt.id} appt={appt} />
        ))}
      </div>

      {/* ── Empty CTA ── */}
      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/3 p-8 text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <Calendar className="size-5 text-primary" />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Need to see Dr. Harrison?
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          View live availability and book in under 60 seconds.
        </p>
        <Button size="sm" className="gap-2" style={{ background: "var(--primary)" }}>
          <Calendar className="size-3.5" />
          See Available Slots
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Appointment Card ──────────────────────────────────────────

function AppointmentCard({ appt }: { appt: Appointment }) {
  const statusConfig = {
    upcoming: {
      label: "Upcoming",
      icon: <Clock className="size-3" />,
      className: "bg-primary/10 text-primary",
    },
    completed: {
      label: "Completed",
      icon: <CheckCircle2 className="size-3" />,
      className: "bg-vault-positive-light text-vault-positive",
    },
    cancelled: {
      label: "Cancelled",
      icon: <XCircle className="size-3" />,
      className: "bg-vault-negative-light text-vault-negative",
    },
  };

  const status = statusConfig[appt.status];

  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        appt.status === "upcoming" ? "border-border" : "border-border/50"
      }`}
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">

        {/* Avatar */}
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10">
          <span className="text-sm font-bold text-primary">{appt.avatar}</span>
        </div>

        {/* Main info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{appt.doctor}</h3>
            <span className="text-xs text-muted-foreground">&middot;</span>
            <span className="text-xs text-muted-foreground">{appt.specialty}</span>
            <span
              className={`ml-auto flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${status.className}`}
            >
              {status.icon}
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-[12px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0" />
              {appt.date} &middot; {appt.time}
            </span>
            {appt.mode === "video" ? (
              <span className="flex items-center gap-1.5">
                <Video className="size-3.5 shrink-0" />
                Video call
              </span>
            ) : appt.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5 shrink-0" />
                {appt.location}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
                {appt.type}
              </span>
            </span>
          </div>

          {appt.notes && (
            <p className="rounded-lg bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
              {appt.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        {appt.status === "upcoming" && (
          <div className="flex shrink-0 gap-2 sm:flex-col">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
              {appt.mode === "video" ? (
                <>
                  <Video className="size-3" />
                  Join call
                </>
              ) : (
                <>
                  <MapPin className="size-3" />
                  Directions
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-muted-foreground"
            >
              <RotateCcw className="size-3" />
              Reschedule
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
