"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  MapPin,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingModal } from "../_components/BookingModal";
import {
  cancelAppointmentAction,
  getPatientAppointmentsAction,
  type PatientAppointment,
} from "./actions";

// ─── Types ─────────────────────────────────────────────────────

type FilterOption = "All" | "Upcoming" | "Completed" | "Cancelled";
const STATUS_FILTERS: FilterOption[] = ["All", "Upcoming", "Completed", "Cancelled"];

// ─── Helpers ────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "consultation":       "New Consultation",
  "follow-up":          "Follow-up",
  "checkup":            "Annual Checkup",
  "prescription-review": "Prescription Review",
};

function parseDateParts(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return {
    day:     String(d.getUTCDate()),
    month:   d.toLocaleDateString("en-US", { month: "short",    timeZone: "UTC" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "long",   timeZone: "UTC" }),
  };
}

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// ─── Client Component ───────────────────────────────────────────

export default function AppointmentsClient({
  initialData,
  initialHasMore,
}: {
  initialData: PatientAppointment[];
  initialHasMore: boolean;
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<PatientAppointment[]>(initialData);
  const [filter,       setFilter]       = useState<FilterOption>("All");
  const [search,       setSearch]       = useState("");
  const [bookingOpen,  setBookingOpen]  = useState(false);
  const [isPending,    startTransition] = useTransition();
  const [hasMore,      setHasMore]      = useState(initialHasMore);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [loadingMore,  setLoadingMore]  = useState(false);

  // ── Derived stats ──
  const todayStr      = new Date().toISOString().split("T")[0];
  const upcomingList  = appointments.filter(
    (a) => a.status === "upcoming" && a.appointment_date >= todayStr
  );
  const completedCount = appointments.filter((a) => a.status === "completed").length;
  const nextAppt = upcomingList.sort(
    (a, b) =>
      a.appointment_date.localeCompare(b.appointment_date) ||
      a.start_time.localeCompare(b.start_time)
  )[0];

  // ── Filtered list ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchStatus =
        filter === "All"       ? true :
        filter === "Upcoming"  ? a.status === "upcoming" :
        filter === "Completed" ? a.status === "completed" :
        a.status === "cancelled" || a.status === "no-show";

      if (!q) return matchStatus;
      const typeLabel = TYPE_LABELS[a.type] ?? a.type;
      const { month, weekday, day } = parseDateParts(a.appointment_date);
      const matchSearch =
        typeLabel.toLowerCase().includes(q) ||
        (a.doctor?.full_name ?? "").toLowerCase().includes(q) ||
        month.toLowerCase().includes(q) ||
        weekday.toLowerCase().includes(q) ||
        day.includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, filter, search]);

  // ── Cancel ──
  function handleCancel(id: string) {
    // Optimistic update
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled" as const } : a))
    );
    startTransition(async () => {
      const { error } = await cancelAppointmentAction(id);
      if (error) {
        // Revert on failure
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "upcoming" as const } : a))
        );
      } else {
        router.refresh();
      }
    });
  }

  // ── Load More ──
  function loadMore() {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    getPatientAppointmentsAction(nextPage).then(({ data, hasMore: more }) => {
      setAppointments((prev) => [...prev, ...data]);
      setHasMore(more);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  }

  return (
    <>
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
              Your visit history and upcoming schedule
            </p>
          </div>
          <Button
            className="shrink-0 gap-2 self-start sm:self-auto"
            onClick={() => setBookingOpen(true)}
          >
            <Plus className="size-4" />
            Book Appointment
          </Button>
        </div>

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Upcoming",  value: String(upcomingList.length),  accent: false },
            { label: "Completed", value: String(completedCount),        accent: false },
            {
              label: "Next visit",
              value: nextAppt
                ? `${parseDateParts(nextAppt.appointment_date).month} ${parseDateParts(nextAppt.appointment_date).day}`
                : "—",
              accent: true,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border p-4 ${
                stat.accent ? "border-primary/20 bg-primary/5" : "border-border bg-card"
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

        {/* ── Search + Filter ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type, doctor, or date…"
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow sm:w-72"
            />
          </div>

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
        </div>

        {/* ── List ── */}
        <div className="space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? `No appointments matching "${search.trim()}".`
                  : filter === "All"
                  ? "You haven't booked any appointments yet."
                  : `No ${filter.toLowerCase()} appointments.`}
              </p>
              {filter === "All" && !search.trim() && (
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setBookingOpen(true)}
                >
                  <Plus className="size-3.5" />
                  Book your first appointment
                </Button>
              )}
            </div>
          ) : (
            filtered.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                onReschedule={() => setBookingOpen(true)}
                onCancel={handleCancel}
                cancelling={isPending}
              />
            ))
          )}
          {hasMore && !search.trim() && filter === "All" && (
            <div className="flex justify-center pt-2">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
              >
                {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Booking Modal ── */}
      <BookingModal
        open={bookingOpen}
        onClose={() => {
          setBookingOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}

// ─── Appointment Card ─────────────────────────────────────────────

function AppointmentCard({
  appt,
  onReschedule,
  onCancel,
  cancelling,
}: {
  appt: PatientAppointment;
  onReschedule: () => void;
  onCancel: (id: string) => void;
  cancelling: boolean;
}) {
  const isUpcoming  = appt.status === "upcoming";
  const isCompleted = appt.status === "completed";
  const isCancelled = appt.status === "cancelled" || appt.status === "no-show";

  const { day, month, weekday } = parseDateParts(appt.appointment_date);
  const typeLabel = TYPE_LABELS[appt.type] ?? appt.type;
  const doctorName = appt.doctor?.full_name ?? "Your Doctor";

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
              isUpcoming   ? "text-primary/70"
              : isCompleted ? "text-vault-positive/70"
              : "text-muted-foreground"
            }`}
          >
            {month}
          </span>
          <span
            className={`text-xl font-bold leading-none ${
              isUpcoming   ? "text-primary"
              : isCompleted ? "text-vault-positive"
              : "text-muted-foreground/60"
            }`}
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {day}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{typeLabel}</span>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {doctorName}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  {weekday}, {fmtTime(appt.start_time)}
                </span>
                {appt.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 shrink-0" />
                    {appt.location}
                  </span>
                )}
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
            <div className="mt-3 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={onReschedule}
              >
                <RotateCcw className="size-3" />
                Reschedule
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-vault-negative hover:bg-vault-negative-light"
                disabled={cancelling}
                onClick={() => onCancel(appt.id)}
              >
                {cancelling ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <XCircle className="size-3" />
                )}
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: PatientAppointment["status"] }) {
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
  if (status === "no-show") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-warning-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-warning">
        <AlertCircle className="size-3" />
        No-show
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
