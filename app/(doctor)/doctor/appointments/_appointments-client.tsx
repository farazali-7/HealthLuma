"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Play,
  FileText,
  RefreshCw,
  Search,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDoctorAppointmentsAction,
  updateAppointmentStatusAction,
  type DoctorAppointment,
  type ApptStatus,
} from "./actions";

// ─── Types ──────────────────────────────────────────────────────

type UIStatus = ApptStatus | "in-progress";
type FilterOption = "All" | "Today" | "Upcoming" | "Completed" | "Cancelled";

// ─── Helpers ────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  "consultation":        "Consultation",
  "follow-up":           "Follow-up",
  "checkup":             "Annual Checkup",
  "prescription-review": "Prescription Review",
};

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function dateLabel(dateStr: string) {
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split("T")[0];
  if (dateStr === today)    return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function sortAppointments(appts: DoctorAppointment[]) {
  const today = new Date().toISOString().split("T")[0];
  return [...appts].sort((a, b) => {
    const aToday  = a.appointment_date === today;
    const bToday  = b.appointment_date === today;
    const aFuture = a.appointment_date >  today;
    const bFuture = b.appointment_date >  today;

    if (aToday  && !bToday)  return -1;
    if (!aToday &&  bToday)  return  1;
    if (aToday  &&  bToday)  return a.start_time.localeCompare(b.start_time);
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return  1;
    if (aFuture &&  bFuture) {
      const dc = a.appointment_date.localeCompare(b.appointment_date);
      return dc !== 0 ? dc : a.start_time.localeCompare(b.start_time);
    }
    const dc = b.appointment_date.localeCompare(a.appointment_date);
    return dc !== 0 ? dc : a.start_time.localeCompare(b.start_time);
  });
}

const STATUS_META: Record<UIStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  upcoming:      { label: "Scheduled",   cls: "bg-primary/10 text-primary",                   icon: <Clock className="size-3" /> },
  "in-progress": { label: "In Progress", cls: "bg-[#4D9A7F]/15 text-[#4D9A7F]",               icon: <div className="size-1.5 rounded-full bg-[#4D9A7F] animate-pulse" /> },
  completed:     { label: "Completed",   cls: "bg-vault-positive-light text-vault-positive",   icon: <CheckCircle2 className="size-3" /> },
  cancelled:     { label: "Cancelled",   cls: "bg-vault-negative-light text-vault-negative",   icon: <XCircle className="size-3" /> },
  "no-show":     { label: "No Show",     cls: "bg-vault-warning-light text-vault-warning",     icon: <AlertCircle className="size-3" /> },
};

// ─── Client Component ────────────────────────────────────────────

export default function AppointmentsClient({
  initialData,
  initialHasMore,
}: {
  initialData: DoctorAppointment[];
  initialHasMore: boolean;
}) {
  const router = useRouter();
  const [appointments, setAppointments] = useState(() => sortAppointments(initialData));
  const [inProgress,   setInProgress]   = useState<Set<string>>(new Set());
  const [filter,       setFilter]       = useState<FilterOption>("All");
  const [search,       setSearch]       = useState("");
  const [isPending,    startTransition] = useTransition();
  const [hasMore,      setHasMore]      = useState(initialHasMore);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [loadingMore,  setLoadingMore]  = useState(false);

  const todayStr    = new Date().toISOString().split("T")[0];
  const todayAppts  = appointments.filter((a) => a.appointment_date === todayStr);
  const todaySeen   = todayAppts.filter((a) => a.status === "completed").length;
  const totalToday  = todayAppts.length;
  const activeId    = [...inProgress][inProgress.size - 1];
  const activeAppt  = activeId ? appointments.find((a) => a.id === activeId) : null;
  const upcomingCount = appointments.filter(
    (a) => a.status === "upcoming" && a.appointment_date >= todayStr
  ).length;

  const filtered = appointments.filter((a) => {
    const uiStatus: UIStatus = inProgress.has(a.id) ? "in-progress" : a.status;
    const matchFilter =
      filter === "All"       ? true :
      filter === "Today"     ? a.appointment_date === todayStr :
      filter === "Upcoming"  ? (uiStatus === "upcoming" || uiStatus === "in-progress") :
      filter === "Completed" ? uiStatus === "completed" :
      (uiStatus === "cancelled" || uiStatus === "no-show");

    const matchSearch = search
      ? (a.patient?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (a.notes ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (TYPE_LABELS[a.type] ?? a.type).toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  function startConsult(id: string) {
    setInProgress((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  function markStatus(id: string, status: "completed" | "cancelled" | "no-show") {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    setInProgress((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    startTransition(async () => {
      const { error } = await updateAppointmentStatusAction(id, status);
      if (error) router.refresh(); // revert via server re-render
    });
  }

  function loadMore() {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    getDoctorAppointmentsAction(nextPage).then(({ data, hasMore: more }) => {
      setAppointments((prev) => sortAppointments([...prev, ...data]));
      setHasMore(more);
      setCurrentPage(nextPage);
      setLoadingMore(false);
    }).catch(() => setLoadingMore(false));
  }

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
            {totalToday} today · {upcomingCount} upcoming
          </p>
        </div>
        <Button
          className="gap-2 self-start sm:self-auto"
          style={{ background: "#4D9A7F", color: "white" }}
          onClick={() => router.refresh()}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {/* ── Today Summary Strip ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Today's patients", value: String(totalToday),  accent: false },
          { label: "Seen so far",      value: String(todaySeen),   accent: false },
          {
            label: "Now with",
            value: activeAppt ? activeAppt.patient?.full_name?.split(" ")[0] ?? "—" : "—",
            accent: !!activeAppt,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 ${
              stat.accent ? "border-[#4D9A7F]/20 bg-[#4D9A7F]/5" : "border-border bg-card"
            }`}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={`mt-1.5 text-2xl font-semibold tracking-tight ${
                stat.accent ? "text-[#4D9A7F]" : "text-foreground"
              }`}
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search patient or appointment type…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {(["All", "Today", "Upcoming", "Completed", "Cancelled"] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="hidden grid-cols-[1fr_110px_130px_100px_120px_150px] gap-3 border-b border-border/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
          <span>Patient</span>
          <span>Date / Time</span>
          <span>Type</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              {search ? `No appointments matching "${search}".` : "No appointments match this filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((appt) => {
              const uiStatus: UIStatus = inProgress.has(appt.id) ? "in-progress" : appt.status;
              const meta      = STATUS_META[uiStatus];
              const patName   = appt.patient?.full_name ?? "Unknown Patient";
              const typeLabel = TYPE_LABELS[appt.type] ?? appt.type;

              return (
                <div
                  key={appt.id}
                  className={`flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_110px_130px_100px_120px_150px] sm:items-center sm:gap-3 ${
                    uiStatus === "in-progress" ? "bg-[#4D9A7F]/5" : ""
                  }`}
                >
                  {/* Patient */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                        uiStatus === "in-progress"
                          ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                          : uiStatus === "completed"
                          ? "bg-muted/50 text-muted-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      {initials(patName)}
                    </div>
                    <p className={`text-sm font-medium ${uiStatus === "completed" ? "text-muted-foreground" : "text-foreground"}`}>
                      {patName}
                    </p>
                  </div>

                  {/* Date / Time */}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{dateLabel(appt.appointment_date)}</p>
                    <p className="text-[11px] text-muted-foreground">{fmtTime(appt.start_time)}</p>
                  </div>

                  {/* Type */}
                  <p className="text-xs text-foreground">{typeLabel}</p>

                  {/* Priority */}
                  <div>
                    {appt.is_priority ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-vault-warning-light px-2 py-0.5 text-[10px] font-semibold text-vault-warning">
                        <Star className="size-2.5" />
                        Priority
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>
                    {meta.icon}
                    {meta.label}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {uiStatus === "upcoming" && (
                      <>
                        <ActionBtn
                          cls="bg-[#4D9A7F]/10 text-[#4D9A7F] hover:bg-[#4D9A7F]/20"
                          icon={<Play className="size-2.5" />}
                          label="Start"
                          onClick={() => startConsult(appt.id)}
                          disabled={isPending}
                        />
                        <ActionBtn
                          cls="bg-vault-warning-light text-vault-warning hover:bg-vault-warning/20"
                          icon={<AlertCircle className="size-2.5" />}
                          label="No-show"
                          onClick={() => markStatus(appt.id, "no-show")}
                          disabled={isPending}
                        />
                        <IconBtn
                          title="Cancel"
                          onClick={() => markStatus(appt.id, "cancelled")}
                          disabled={isPending}
                          cls="hover:bg-vault-negative-light hover:text-vault-negative"
                        >
                          <XCircle className="size-3.5" />
                        </IconBtn>
                      </>
                    )}
                    {uiStatus === "in-progress" && (
                      <>
                        <ActionBtn
                          cls="bg-vault-positive-light text-vault-positive hover:bg-vault-positive/20"
                          icon={<CheckCircle2 className="size-2.5" />}
                          label="Done"
                          onClick={() => markStatus(appt.id, "completed")}
                          disabled={isPending}
                        />
                        <IconBtn
                          title="Cancel"
                          onClick={() => markStatus(appt.id, "cancelled")}
                          disabled={isPending}
                          cls="hover:bg-vault-negative-light hover:text-vault-negative"
                        >
                          <XCircle className="size-3.5" />
                        </IconBtn>
                      </>
                    )}
                    {uiStatus === "completed" && (
                      <ActionBtn
                        cls="bg-muted/40 text-muted-foreground hover:bg-muted/70"
                        icon={<FileText className="size-2.5" />}
                        label="Note"
                        onClick={() => {}}
                        disabled={false}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-3">
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loadingMore || isPending}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
          >
            {loadingMore ? <Loader2 className="size-4 animate-spin" /> : null}
            {loadingMore ? "Loading…" : "Load More"}
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          Showing {filtered.length} of {appointments.length} appointments
          {hasMore ? " · more available" : ""}
        </p>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function ActionBtn({
  cls, icon, label, onClick, disabled,
}: {
  cls: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-50 ${cls}`}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({
  title, onClick, disabled, cls, children,
}: {
  title: string;
  onClick: () => void;
  disabled: boolean;
  cls: string;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}
