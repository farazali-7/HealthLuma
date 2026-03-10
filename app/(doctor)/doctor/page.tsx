"use client";

import { useState } from "react";
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
  DollarSign,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

// ─── Mock data ────────────────────────────────────────────────

type QueueStatus = "completed" | "in-progress" | "upcoming";

interface QueuePatient {
  id: string;
  name: string;
  age: number;
  time: string;
  type: string;
  condition: string;
  status: QueueStatus;
  avatar: string;
}

const INITIAL_QUEUE: QueuePatient[] = [
  { id: "1", name: "Aisha Malik",   age: 34, time: "09:00 AM", type: "Follow-up",     condition: "Hypertension",    status: "completed",   avatar: "AM" },
  { id: "2", name: "Bilal Hassan",  age: 52, time: "10:00 AM", type: "Consultation",  condition: "Type 2 Diabetes", status: "completed",   avatar: "BH" },
  { id: "3", name: "Sara Qureshi",  age: 28, time: "11:30 AM", type: "New Patient",   condition: "Fatigue / CBC",   status: "in-progress", avatar: "SQ" },
  { id: "4", name: "Omar Farooq",   age: 45, time: "02:00 PM", type: "Annual Checkup",condition: "General Wellness",status: "upcoming",    avatar: "OF" },
  { id: "5", name: "Zainab Raza",   age: 61, time: "03:30 PM", type: "Follow-up",     condition: "Arthritis",       status: "upcoming",    avatar: "ZR" },
];

const INITIAL_NOTES = [
  { patient: "Bilal Hassan", avatar: "BH", note: "Adjusted Metformin to 1000mg twice daily. HbA1c down to 6.8%. Follow up in 3 months.",      time: "10 min ago" },
  { patient: "Aisha Malik",  avatar: "AM", note: "BP stable at 126/82. Continue Amlodipine 5mg. Lifestyle modifications discussed.",            time: "1 hr ago" },
  { patient: "Khaled Noor",  avatar: "KN", note: "Lab results reviewed. Vitamin D deficiency confirmed. Prescribed 50,000 IU weekly.",          time: "Yesterday" },
];

const INITIAL_TASKS = [
  { id: "1", label: "Review CBC results — Sara Qureshi",    urgent: true,  done: false },
  { id: "2", label: "Sign referral letter — Omar Farooq",   urgent: false, done: false },
  { id: "3", label: "Update treatment plan — Zainab Raza",  urgent: false, done: false },
  { id: "4", label: "Prior auth form — Bilal Hassan",       urgent: true,  done: false },
];

const QUICK_ACTIONS = [
  { icon: <Calendar className="size-4" />, label: "Book Appointment", href: "/doctor/appointments", color: "bg-[#4D9A7F]/10 text-[#4D9A7F] border-[#4D9A7F]/20" },
  { icon: <FileText className="size-4" />, label: "Write Note",       href: "/doctor/records",      color: "bg-primary/10 text-primary border-primary/20" },
  { icon: <Pill className="size-4" />,     label: "New Prescription", href: "/doctor/prescriptions",color: "bg-vault-warning-light text-vault-warning border-vault-warning/20" },
  { icon: <Megaphone className="size-4" />,label: "Announcement",     href: "/doctor/announcements",color: "bg-muted/60 text-muted-foreground border-border" },
];

// ─── Page ─────────────────────────────────────────────────────

export default function DoctorPage() {
  const [queue, setQueue]   = useState<QueuePatient[]>(INITIAL_QUEUE);
  const [tasks, setTasks]   = useState(INITIAL_TASKS);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr  = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const seen       = queue.filter((p) => p.status === "completed").length;
  const total      = queue.length;
  const inProgress = queue.find((p) => p.status === "in-progress");
  const pending    = tasks.filter((t) => !t.done);
  const urgent     = pending.filter((t) => t.urgent);

  // Queue row transitions
  const startPatient = (id: string) => {
    setQueue((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: "in-progress" }
          : p.status === "in-progress"
          ? { ...p, status: "upcoming" }   // demote old active
          : p
      )
    );
  };

  const completePatient = (id: string) => {
    setQueue((prev) => prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p)));
  };

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── 1. Greeting ── */}
      <section className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {greeting}, Dr. Harrison
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateStr} &mdash; {seen} of {total} patients seen today
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-[#4D9A7F]/10 px-3 py-1 text-[11px] font-semibold text-[#4D9A7F] sm:inline-flex">
            <span className="size-1.5 rounded-full bg-[#4D9A7F] animate-pulse" />
            Clinic Active
          </span>
        </div>
      </section>

      {/* ── 2. Quick Actions ── */}
      <section className="animate-fade-up" style={{ animationDelay: "40ms" }}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all hover:shadow-md ${action.color}`}
            >
              <span className="shrink-0">{action.icon}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. KPI Strip ── */}
      <section className="animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Patients Today"
            value={String(total)}
            subvalue={`${seen} completed`}
            icon={<Users className="size-3.5" />}
            variant="primary"
          />
          <StatCard
            label="Seen So Far"
            value={String(seen)}
            subvalue={`${Math.round((seen / total) * 100)}% done`}
            icon={<CheckCircle2 className="size-3.5" />}
            trend={`+${seen} today`}
          />
          <StatCard
            label="Revenue Today"
            value={`$${seen * 100}`}
            subvalue={`${total - seen} appts remaining`}
            icon={<DollarSign className="size-3.5" />}
          />
          <StatCard
            label="Pending Tasks"
            value={String(pending.length)}
            subvalue={`${urgent.length} urgent`}
            icon={<ClipboardList className="size-3.5" />}
            variant={urgent.length > 0 ? "warning" : "default"}
          />
        </div>
      </section>

      {/* ── 4. Patient Queue + Clinical Notes ── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "160ms" }}
      >
        {/* Queue */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Today</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Patient Queue</h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3" />
              {seen}/{total} seen
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {queue.map((patient) => (
              <div
                key={patient.id}
                className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20 ${
                  patient.status === "in-progress" ? "bg-[#4D9A7F]/4" : ""
                }`}
              >
                {/* Status icon */}
                <div className="flex size-5 shrink-0 items-center justify-center">
                  {patient.status === "completed" ? (
                    <CheckCircle2 className="size-4 text-[#4D9A7F]" />
                  ) : patient.status === "in-progress" ? (
                    <div className="size-3 animate-pulse rounded-full bg-[#4D9A7F] ring-2 ring-[#4D9A7F]/30" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/40" />
                  )}
                </div>

                {/* Avatar */}
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${
                  patient.status === "in-progress" ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                  : patient.status === "completed"  ? "bg-muted/60 text-muted-foreground"
                  : "border border-border bg-card text-foreground"
                }`}>
                  {patient.avatar}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-sm font-medium ${patient.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {patient.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70">· {patient.age}y</span>
                    {patient.status === "in-progress" && (
                      <span className="rounded-full bg-[#4D9A7F]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#4D9A7F]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {patient.condition} · {patient.type}
                  </p>
                </div>

                {/* Time + action */}
                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-xs font-semibold text-foreground">{patient.time}</p>

                  {patient.status === "upcoming" && (
                    <button
                      onClick={() => startPatient(patient.id)}
                      className="flex items-center gap-1 rounded-lg bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F] transition-colors hover:bg-[#4D9A7F]/20"
                    >
                      <Play className="size-2.5" />
                      Start
                    </button>
                  )}
                  {patient.status === "in-progress" && (
                    <button
                      onClick={() => completePatient(patient.id)}
                      className="flex items-center gap-1 rounded-lg bg-vault-positive-light px-2.5 py-1 text-[10px] font-semibold text-vault-positive transition-colors hover:bg-vault-positive/20"
                    >
                      <CheckCircle2 className="size-2.5" />
                      Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Notes */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Clinical Notes</h2>
            </div>
            <Link href="/doctor/records" className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              View all <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {INITIAL_NOTES.map((note, i) => (
              <div key={i} className="px-5 py-4 transition-colors hover:bg-muted/20">
                <div className="mb-2 flex items-center gap-2.5">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[10px] font-semibold text-[#4D9A7F]">
                    {note.avatar}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{note.patient}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{note.time}</span>
                </div>
                <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{note.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Pending Tasks + Progress ── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "240ms" }}
      >
        {/* Pending Tasks — checkable */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Action Required</p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">Pending Tasks</h2>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {tasks.filter((t) => t.done).length}/{tasks.length} done
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {tasks.map((task) => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors hover:bg-muted/20 ${task.done ? "opacity-50" : ""}`}
              >
                <div className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  task.done
                    ? "border-[#4D9A7F] bg-[#4D9A7F]"
                    : task.urgent
                    ? "border-destructive/50"
                    : "border-muted-foreground/30"
                }`}>
                  {task.done && <CheckCircle2 className="size-3 text-white" strokeWidth={3} />}
                  {!task.done && task.urgent && <AlertCircle className="size-3 text-destructive" />}
                </div>
                <p className={`flex-1 text-sm transition-all ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {task.label}
                </p>
                {task.urgent && !task.done && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    Urgent
                  </span>
                )}
              </button>
            ))}
          </div>
          {tasks.every((t) => t.done) && (
            <div className="border-t border-border/60 px-5 py-4 text-center">
              <p className="text-sm font-medium text-[#4D9A7F]">All tasks complete ✓</p>
            </div>
          )}
        </div>

        {/* Today's Progress */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overview</p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">Today's Progress</h2>
          </div>
          <div className="space-y-5 p-5">
            {/* Patient throughput */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patient throughput</span>
                <span className="text-sm font-semibold text-foreground">{seen}/{total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-[#4D9A7F] transition-all duration-700"
                  style={{ width: `${(seen / total) * 100}%` }}
                />
              </div>
            </div>
            {/* Tasks */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks completed</span>
                <span className="text-sm font-semibold text-foreground">
                  {tasks.filter((t) => t.done).length}/{tasks.length}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${(tasks.filter((t) => t.done).length / tasks.length) * 100}%` }}
                />
              </div>
            </div>
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 border-t border-border/60 pt-4">
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">{seen}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Seen</p>
              </div>
              <div className="border-x border-border/60 text-center">
                <p className="text-xl font-semibold text-foreground">{total - seen}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-[#4D9A7F]">↑12%</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">vs last week</p>
              </div>
            </div>
            {/* Weekly bar */}
            <div className="flex items-end gap-1.5 pt-1">
              {[3, 5, 4, 6, 5, 4, seen].map((count, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${i === 6 ? "bg-[#4D9A7F]" : "bg-muted/60"}`}
                    style={{ height: `${(count / 7) * 48}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "T"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function StatCard({
  label, value, subvalue, icon, trend, variant = "default",
}: {
  label: string; value: string; subvalue?: string; icon: ReactNode; trend?: string;
  variant?: "default" | "primary" | "warning";
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
      variant === "primary" ? "border-[#4D9A7F]/20" :
      variant === "warning"  ? "border-destructive/20" : "border-border"
    }`}>
      {variant === "primary" && <div className="pointer-events-none absolute inset-0 bg-[#4D9A7F]/2" />}
      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        <span className={`flex size-6 items-center justify-center rounded-lg ${
          variant === "primary" ? "bg-[#4D9A7F]/10 text-[#4D9A7F]" :
          variant === "warning"  ? "bg-destructive/10 text-destructive" : "bg-muted/60 text-muted-foreground"
        }`}>
          {icon}
        </span>
      </div>
      <div className="relative mt-2">
        <div className="text-xl font-semibold leading-none text-foreground">{value}</div>
        {subvalue && <p className="mt-1.5 text-[11px] text-muted-foreground">{subvalue}</p>}
        {trend && (
          <div className="mt-1.5 flex items-center gap-1">
            <TrendingUp className="size-3 text-[#4D9A7F]" />
            <span className="text-[11px] font-medium text-[#4D9A7F]">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
