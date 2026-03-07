import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/queries";
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
} from "lucide-react";
import type { ReactNode } from "react";

// ─── Mock data (replace with DB queries) ─────────────────────

const todayPatients = [
  {
    id: "1",
    name: "Aisha Malik",
    age: 34,
    time: "09:00 AM",
    type: "Follow-up",
    condition: "Hypertension",
    status: "completed" as const,
    avatar: "AM",
  },
  {
    id: "2",
    name: "Bilal Hassan",
    age: 52,
    time: "10:00 AM",
    type: "Consultation",
    condition: "Type 2 Diabetes",
    status: "completed" as const,
    avatar: "BH",
  },
  {
    id: "3",
    name: "Sara Qureshi",
    age: 28,
    time: "11:30 AM",
    type: "New Patient",
    condition: "Fatigue / CBC",
    status: "in-progress" as const,
    avatar: "SQ",
  },
  {
    id: "4",
    name: "Omar Farooq",
    age: 45,
    time: "02:00 PM",
    type: "Annual Checkup",
    condition: "General Wellness",
    status: "upcoming" as const,
    avatar: "OF",
  },
  {
    id: "5",
    name: "Zainab Raza",
    age: 61,
    time: "03:30 PM",
    type: "Follow-up",
    condition: "Arthritis",
    status: "upcoming" as const,
    avatar: "ZR",
  },
];

const recentNotes = [
  {
    patient: "Bilal Hassan",
    note: "Adjusted Metformin to 1000mg twice daily. HbA1c down to 6.8%. Follow up in 3 months.",
    time: "10 min ago",
    avatar: "BH",
  },
  {
    patient: "Aisha Malik",
    note: "BP stable at 126/82. Continue Amlodipine 5mg. Lifestyle modifications discussed.",
    time: "1 hr ago",
    avatar: "AM",
  },
  {
    patient: "Khaled Noor",
    note: "Lab results reviewed. Vitamin D deficiency confirmed. Prescribed 50,000 IU weekly.",
    time: "Yesterday",
    avatar: "KN",
  },
];

const pendingTasks = [
  { label: "Review CBC results — Sara Qureshi", urgent: true },
  { label: "Sign referral letter — Omar Farooq", urgent: false },
  { label: "Update treatment plan — Zainab Raza", urgent: false },
  { label: "Prior auth form — Bilal Hassan", urgent: true },
];

// ─── Page ────────────────────────────────────────────────────

export default async function DoctorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user ? await getUserProfile(user.id) : null;

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Doctor";

  const firstName = displayName.replace(/^Dr\.?\s*/i, "").split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const seen = todayPatients.filter((p) => p.status === "completed").length;
  const total = todayPatients.length;
  const inProgress = todayPatients.find((p) => p.status === "in-progress");

  return (
    <div className="space-y-7 px-4 py-7 sm:px-6 lg:px-8">
      {/* ── 1. Greeting ────────────────────────────────── */}
      <section className="animate-fade-up" style={{ animationDelay: "0ms" }}>
        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {greeting}, Dr. {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {dateStr} &mdash; {seen} of {total} patients seen today
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#4D9A7F]/10 px-3 py-1 text-[11px] font-semibold text-[#4D9A7F]">
              <span className="size-1.5 rounded-full bg-[#4D9A7F]" />
              Clinic Active
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. KPI Strip ──────────────────────────────── */}
      <section
        className="animate-fade-up"
        style={{ animationDelay: "80ms" }}
      >
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
            label="Next Patient"
            value={inProgress ? inProgress.time : "—"}
            subvalue={inProgress ? inProgress.name : "No active patient"}
            icon={<Clock className="size-3.5" />}
          />
          <StatCard
            label="Pending Tasks"
            value={String(pendingTasks.length)}
            subvalue={`${pendingTasks.filter((t) => t.urgent).length} urgent`}
            icon={<ClipboardList className="size-3.5" />}
            variant={
              pendingTasks.some((t) => t.urgent) ? "warning" : "default"
            }
          />
        </div>
      </section>

      {/* ── 3. Patient Queue + Recent Notes ──────────── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "160ms" }}
      >
        {/* Today's Queue */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Today
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Patient Queue
              </h2>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] text-muted-foreground">
              <Calendar className="size-3" />
              {seen}/{total} seen
            </div>
          </div>

          <div className="divide-y divide-border/50">
            {todayPatients.map((patient) => (
              <div
                key={patient.id}
                className={`flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20 ${
                  patient.status === "in-progress"
                    ? "bg-[#4D9A7F]/[0.04]"
                    : ""
                }`}
              >
                {/* Status icon */}
                <div className="flex size-5 shrink-0 items-center justify-center">
                  {patient.status === "completed" ? (
                    <CheckCircle2 className="size-4 text-[#4D9A7F]" />
                  ) : patient.status === "in-progress" ? (
                    <div className="size-3 rounded-full bg-[#4D9A7F] ring-2 ring-[#4D9A7F]/30 animate-pulse" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/40" />
                  )}
                </div>

                {/* Avatar */}
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold ${
                    patient.status === "in-progress"
                      ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                      : patient.status === "completed"
                      ? "bg-muted/60 text-muted-foreground"
                      : "border border-border bg-card text-foreground"
                  }`}
                >
                  {patient.avatar}
                </div>

                {/* Patient info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`truncate text-sm font-medium ${
                        patient.status === "completed"
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      }`}
                    >
                      {patient.name}
                    </p>
                    <span className="text-[10px] text-muted-foreground/70">
                      · {patient.age}y
                    </span>
                    {patient.status === "in-progress" && (
                      <span className="rounded-full bg-[#4D9A7F]/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#4D9A7F]">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {patient.condition} &middot; {patient.type}
                  </p>
                </div>

                {/* Time */}
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground">
                    {patient.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Recent
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-foreground">
                Clinical Notes
              </h2>
            </div>
            <button className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              View all
              <ChevronRight className="size-3" />
            </button>
          </div>

          <div className="divide-y divide-border/50">
            {recentNotes.map((note, i) => (
              <div key={i} className="px-5 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[10px] font-semibold text-[#4D9A7F]">
                    {note.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {note.patient}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {note.time}
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground line-clamp-2">
                  {note.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Pending Tasks + Progress ──────────────── */}
      <section
        className="animate-fade-up grid grid-cols-1 gap-4 lg:grid-cols-12"
        style={{ animationDelay: "240ms" }}
      >
        {/* Pending Tasks */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-5">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Action Required
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">
              Pending Tasks
            </h2>
          </div>
          <div className="divide-y divide-border/50">
            {pendingTasks.map((task, i) => (
              <div
                key={i}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/20"
              >
                <div
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full ${
                    task.urgent
                      ? "bg-destructive/10"
                      : "bg-muted/40"
                  }`}
                >
                  {task.urgent ? (
                    <AlertCircle className="size-3 text-destructive" />
                  ) : (
                    <Circle className="size-3 text-muted-foreground/50" />
                  )}
                </div>
                <p className="flex-1 text-sm text-foreground">{task.label}</p>
                {task.urgent && (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    Urgent
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Today's Progress */}
        <div className="rounded-2xl border border-border bg-card shadow-sm lg:col-span-7">
          <div className="border-b border-border/60 px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Overview
            </p>
            <h2 className="mt-0.5 text-sm font-semibold text-foreground">
              Today&apos;s Progress
            </h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Patient throughput */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Patient throughput
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {seen}/{total}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4D9A7F] transition-all duration-700"
                  style={{ width: `${(seen / total) * 100}%` }}
                />
              </div>
            </div>

            {/* Tasks done */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Tasks completed
                </span>
                <span className="text-sm font-semibold text-foreground">
                  0/{pendingTasks.length}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                <div className="h-full w-0 rounded-full bg-primary" />
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
              <div className="text-center">
                <p className="text-xl font-semibold text-foreground">
                  {seen}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Seen
                </p>
              </div>
              <div className="text-center border-x border-border/60">
                <p className="text-xl font-semibold text-foreground">
                  {total - seen}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Remaining
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xl font-semibold text-[#4D9A7F]">↑12%</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  vs last week
                </p>
              </div>
            </div>

            {/* Weekly trend strip */}
            <div className="flex items-end gap-1.5 pt-1">
              {[3, 5, 4, 6, 5, 4, seen].map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm transition-all ${
                      i === 6
                        ? "bg-[#4D9A7F]"
                        : "bg-muted/60"
                    }`}
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

// ─── Sub-components ───────────────────────────────────────────

function StatCard({
  label,
  value,
  subvalue,
  icon,
  trend,
  variant = "default",
}: {
  label: string;
  value: string;
  subvalue?: string;
  icon: ReactNode;
  trend?: string;
  variant?: "default" | "primary" | "warning";
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        variant === "primary"
          ? "border-[#4D9A7F]/20"
          : variant === "warning"
          ? "border-destructive/20"
          : "border-border"
      }`}
    >
      {variant === "primary" && (
        <div className="pointer-events-none absolute inset-0 bg-[#4D9A7F]/[0.02]" />
      )}

      <div className="relative flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <span
          className={`flex size-6 items-center justify-center rounded-lg text-[11px] ${
            variant === "primary"
              ? "bg-[#4D9A7F]/10 text-[#4D9A7F]"
              : variant === "warning"
              ? "bg-destructive/10 text-destructive"
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
        {trend && (
          <div className="mt-1.5 flex items-center gap-1">
            <TrendingUp className="size-3 text-[#4D9A7F]" />
            <span className="text-[11px] font-medium text-[#4D9A7F]">
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
