"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  ClipboardList,
  Clock,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Pill,
  FileText,
  Megaphone,
  Play,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  getDoctorDashboardAction,
  toggleDoctorTaskAction,
  type QueueAppointment,
  type RecentNote,
  type DashboardTask,
} from "./actions";
import { updateAppointmentStatusAction } from "./appointments/actions";

// ─── Helpers ─────────────────────────────────────────────────────

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

function relativeTime(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function computeAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const TYPE_LABELS: Record<string, string> = {
  "consultation":        "Consultation",
  "follow-up":           "Follow-up",
  "checkup":             "Annual Checkup",
  "prescription-review": "Prescription Review",
};

const QUICK_ACTIONS = [
  { icon: <Calendar className="size-4" />, label: "Appointments", href: "/doctor/appointments", color: "bg-[#4D9A7F]/10 text-[#4D9A7F] border-[#4D9A7F]/20"      },
  { icon: <FileText  className="size-4" />, label: "Write Note",   href: "/doctor/patients",     color: "bg-primary/10 text-primary border-primary/20"              },
  { icon: <Pill      className="size-4" />, label: "New Rx",       href: "/doctor/prescriptions",color: "bg-vault-warning-light text-vault-warning border-vault-warning/20" },
  { icon: <Megaphone className="size-4" />, label: "Announce",     href: "/doctor/announcements",color: "bg-muted/60 text-muted-foreground border-border"           },
];

// ─── Page ─────────────────────────────────────────────────────────

export default function DoctorPage() {
  const [doctorName, setDoctorName] = useState("");
  const [queue,      setQueue]      = useState<QueueAppointment[]>([]);
  const [notes,      setNotes]      = useState<RecentNote[]>([]);
  const [tasks,      setTasks]      = useState<DashboardTask[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [inProgress, setInProgress] = useState<Set<string>>(new Set());
  const [isPending,  startTransition] = useTransition();

  // ── Load ──
  const load = useCallback(() => {
    setLoading(true);
    getDoctorDashboardAction()
      .then(({ doctorName: name, queue: q, notes: n, tasks: t }) => {
        setDoctorName(name);
        setQueue(q);
        setNotes(n);
        setTasks(t);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived stats ──
  const seen     = queue.filter((p) => p.status === "completed").length;
  const total    = queue.length;
  const pending  = tasks.filter((t) => !t.is_done);
  const urgent   = pending.filter((t) => t.is_urgent);
  const nextAppt = queue.find((p) => p.status === "upcoming");
  const activeId = [...inProgress][inProgress.size - 1];

  // ── Queue actions ──
  function startPatient(id: string) {
    setInProgress((prev) => new Set([...prev, id]));
  }

  function completePatient(id: string) {
    // Optimistic update
    setQueue((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "completed" as const } : p))
    );
    setInProgress((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    startTransition(async () => {
      const { error } = await updateAppointmentStatusAction(id, "completed");
      if (error) load(); // revert on failure
    });
  }

  // ── Task toggle ──
  function toggleTask(id: string) {
    // Optimistic
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_done: !t.is_done } : t))
    );
    startTransition(async () => {
      const { error } = await toggleDoctorTaskAction(id);
      if (error) load(); // revert
    });
  }

  // ── Greeting ──
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const displayName = doctorName
    ? `Dr. ${doctorName.split(" ").at(-1) ?? doctorName}` // "Dr. Lastname"
    : "Doctor";

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── 1. Greeting ── */}
      <section>
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {loading ? (
                <span className="inline-block h-8 w-56 animate-pulse rounded-lg bg-muted/40" />
              ) : (
                `${greeting}, ${displayName}`
              )}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateStr}
              {!loading && total > 0 && ` — ${seen} of ${total} patients seen today`}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#4D9A7F]/10 px-3 py-1 text-[11px] font-semibold text-[#4D9A7F] sm:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[#4D9A7F]" />
            Clinic Active
          </span>
        </div>
      </section>

      {/* ── 2. Quick Actions ── */}
      <section>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all hover:shadow-sm ${action.color}`}
            >
              <span className="shrink-0">{action.icon}</span>
              {action.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. KPI Strip ── */}
      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Patients Today"
            value={loading ? "—" : String(total)}
            subvalue={loading ? undefined : `${seen} completed`}
            icon={<Users className="size-3.5" />}
            variant="primary"
          />
          <StatCard
            label="Seen So Far"
            value={loading ? "—" : String(seen)}
            subvalue={loading || total === 0 ? undefined : `${Math.round((seen / total) * 100)}% done`}
            icon={<CheckCircle2 className="size-3.5" />}
          />
          <StatCard
            label="Next Patient"
            value={loading ? "—" : nextAppt ? fmtTime(nextAppt.start_time) : "All seen"}
            subvalue={loading ? undefined : nextAppt?.patient?.full_name?.split(" ")[0] ?? undefined}
            icon={<Clock className="size-3.5" />}
          />
          <StatCard
            label="Pending Tasks"
            value={loading ? "—" : String(pending.length)}
            subvalue={loading ? undefined : `${urgent.length} urgent`}
            icon={<ClipboardList className="size-3.5" />}
            variant={urgent.length > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* ── 4. Patient Queue + Clinical Notes ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Queue */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Today</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Patient Queue</h2>
            </div>
            {!loading && (
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
                <Calendar className="size-3" />
                {seen}/{total} seen
              </div>
            )}
          </div>

          {loading ? (
            <QueueSkeleton />
          ) : total === 0 ? (
            <div className="py-14 text-center">
              <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No patients scheduled today.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {queue.map((patient) => {
                const uiStatus = inProgress.has(patient.id) ? "in-progress" : patient.status;
                const patName  = patient.patient?.full_name ?? "Unknown Patient";
                const age      = computeAge(patient.patient?.date_of_birth ?? null);
                const typeLabel = TYPE_LABELS[patient.type] ?? patient.type;

                return (
                  <div
                    key={patient.id}
                    className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20 ${
                      uiStatus === "in-progress" ? "bg-[#4D9A7F]/5" : ""
                    }`}
                  >
                    {/* Status icon */}
                    <div className="flex size-5 shrink-0 items-center justify-center">
                      {uiStatus === "completed" ? (
                        <CheckCircle2 className="size-4 text-[#4D9A7F]" />
                      ) : uiStatus === "in-progress" ? (
                        <div className="size-3 animate-pulse rounded-full bg-[#4D9A7F] ring-2 ring-[#4D9A7F]/30" />
                      ) : uiStatus === "no-show" ? (
                        <AlertCircle className="size-4 text-vault-warning" />
                      ) : (
                        <Circle className="size-4 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${
                      uiStatus === "in-progress"
                        ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                        : uiStatus === "completed"
                        ? "bg-muted/60 text-muted-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}>
                      {initials(patName)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-sm font-medium ${
                          uiStatus === "completed"
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}>
                          {patName}
                        </p>
                        {age && <span className="text-[10px] text-muted-foreground/70">· {age}y</span>}
                        {uiStatus === "in-progress" && (
                          <span className="rounded-full bg-[#4D9A7F]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#4D9A7F]">
                            Active
                          </span>
                        )}
                        {patient.is_priority && (
                          <span className="rounded-full bg-vault-warning-light px-1.5 py-0.5 text-[9px] font-semibold uppercase text-vault-warning">
                            Priority
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{typeLabel}</p>
                    </div>

                    {/* Time + action */}
                    <div className="flex shrink-0 items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {fmtTime(patient.start_time)}
                      </p>
                      {uiStatus === "upcoming" && (
                        <button
                          onClick={() => startPatient(patient.id)}
                          className="flex items-center gap-1 rounded-lg bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F] transition-colors hover:bg-[#4D9A7F]/20"
                        >
                          <Play className="size-2.5" />
                          Start
                        </button>
                      )}
                      {uiStatus === "in-progress" && (
                        <button
                          onClick={() => completePatient(patient.id)}
                          disabled={isPending}
                          className="flex items-center gap-1 rounded-lg bg-vault-positive-light px-2.5 py-1 text-[10px] font-semibold text-vault-positive transition-colors hover:bg-vault-positive/20 disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="size-2.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-2.5" />
                          )}
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clinical Notes */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Recent</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Clinical Notes</h2>
            </div>
            <Link
              href="/doctor/patients"
              className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Write note <ChevronRight className="size-3" />
            </Link>
          </div>

          {loading ? (
            <NotesSkeleton />
          ) : notes.length === 0 ? (
            <div className="py-10 text-center">
              <FileText className="mx-auto mb-3 size-7 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No clinical notes yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {notes.map((note) => (
                <div key={note.id} className="px-5 py-4 transition-colors hover:bg-muted/20">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[10px] font-semibold text-[#4D9A7F]">
                      {initials(note.patient?.full_name ?? "?")}
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                      {note.patient?.full_name ?? "Unknown Patient"}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {relativeTime(note.created_at)}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. Pending Tasks + Progress ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">

        {/* Tasks */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Action Required</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Pending Tasks</h2>
            </div>
            {!loading && tasks.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {tasks.filter((t) => t.is_done).length}/{tasks.length} done
              </span>
            )}
          </div>

          {loading ? (
            <TaskSkeleton />
          ) : tasks.length === 0 ? (
            <div className="py-10 text-center">
              <ClipboardList className="mx-auto mb-3 size-7 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No pending tasks.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border/50">
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    disabled={isPending}
                    className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-muted/20 disabled:cursor-not-allowed ${
                      task.is_done ? "opacity-50" : ""
                    }`}
                  >
                    <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      task.is_done
                        ? "border-[#4D9A7F] bg-[#4D9A7F]"
                        : task.is_urgent
                        ? "border-destructive/50"
                        : "border-muted-foreground/30"
                    }`}>
                      {task.is_done && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {!task.is_done && task.is_urgent && (
                        <AlertCircle className="size-3 text-destructive" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-sm transition-all ${
                        task.is_done ? "text-muted-foreground line-through" : "text-foreground"
                      }`}>
                        {task.label}
                      </p>
                      {task.patient && (
                        <p className="text-[11px] text-muted-foreground">
                          {task.patient.full_name}
                        </p>
                      )}
                    </div>

                    {task.is_urgent && !task.is_done && (
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                        Urgent
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {tasks.every((t) => t.is_done) && (
                <div className="flex items-center justify-center gap-2 border-t border-border/60 px-5 py-4">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-[#4D9A7F]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-sm font-medium text-[#4D9A7F]">All tasks complete</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Today's Progress */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Overview</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Today&apos;s Progress</h2>
          </div>
          <div className="space-y-5 p-5">

            {/* Patient throughput */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patient throughput</span>
                <span className="text-sm font-semibold text-foreground">
                  {loading ? "—" : `${seen}/${total}`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-[#4D9A7F] transition-all duration-700"
                  style={{ width: total > 0 ? `${(seen / total) * 100}%` : "0%" }}
                />
              </div>
            </div>

            {/* Task completion */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks completed</span>
                <span className="text-sm font-semibold text-foreground">
                  {loading ? "—" : `${tasks.filter((t) => t.is_done).length}/${tasks.length}`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: tasks.length > 0
                      ? `${(tasks.filter((t) => t.is_done).length / tasks.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">
                  {loading ? "—" : seen}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Seen</p>
              </div>
              <div className="border-x border-border/60 text-center">
                <p className="text-xl font-semibold text-foreground">
                  {loading ? "—" : total - seen}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Remaining</p>
              </div>
              <div className="text-center">
                <p className="flex items-center justify-center gap-1 text-xl font-semibold text-[#4D9A7F]">
                  <TrendingUp className="size-4" />
                  {loading ? "—" : total}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Scheduled today</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function StatCard({
  label, value, subvalue, icon, variant = "default",
}: {
  label: string; value: string; subvalue?: string; icon: ReactNode;
  variant?: "default" | "primary" | "warning";
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
      variant === "primary" ? "border-[#4D9A7F]/20" :
      variant === "warning"  ? "border-destructive/20" : "border-border"
    }`}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        <span className={`flex size-6 items-center justify-center rounded-lg ${
          variant === "primary" ? "bg-[#4D9A7F]/10 text-[#4D9A7F]" :
          variant === "warning"  ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground"
        }`}>
          {icon}
        </span>
      </div>
      <div className="mt-2">
        <div className="text-xl font-semibold leading-none text-foreground">{value}</div>
        {subvalue && <p className="mt-1.5 text-[11px] text-muted-foreground">{subvalue}</p>}
      </div>
    </div>
  );
}

// ─── Skeletons ─────────────────────────────────────────────────────

function QueueSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3.5 px-5 py-3.5" style={{ opacity: 1 - i * 0.25 }}>
          <div className="size-5 rounded-full bg-muted/40 animate-pulse" />
          <div className="size-9 rounded-xl bg-muted/40 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
          </div>
          <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2].map((i) => (
        <div key={i} className="px-5 py-4" style={{ opacity: 1 - i * 0.4 }}>
          <div className="mb-2 flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-muted/40 animate-pulse" />
            <div className="h-3.5 w-28 rounded bg-muted/40 animate-pulse flex-1" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-muted/30 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted/20 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3.5 px-5 py-3.5" style={{ opacity: 1 - i * 0.25 }}>
          <div className="size-5 rounded-full bg-muted/40 animate-pulse" />
          <div className="h-3.5 flex-1 rounded bg-muted/40 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
