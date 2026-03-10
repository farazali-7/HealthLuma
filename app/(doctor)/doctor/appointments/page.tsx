"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Video,
  MapPin,
  Plus,
  Search,
  Play,
  RotateCcw,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type ApptStatus = "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";

interface Appointment {
  id: string;
  patient: string;
  age: number;
  avatar: string;
  date: string;
  time: string;
  type: string;
  mode: "in-person" | "video";
  condition: string;
  status: ApptStatus;
}

const APPOINTMENTS: Appointment[] = [
  { id: "1",  patient: "Aisha Malik",    age: 34, avatar: "AM", date: "Today",     time: "09:00 AM", type: "Follow-up",     mode: "in-person", condition: "Hypertension",    status: "completed" },
  { id: "2",  patient: "Bilal Hassan",   age: 52, avatar: "BH", date: "Today",     time: "10:00 AM", type: "Consultation",  mode: "in-person", condition: "Type 2 Diabetes", status: "completed" },
  { id: "3",  patient: "Sara Qureshi",   age: 28, avatar: "SQ", date: "Today",     time: "11:30 AM", type: "New Patient",   mode: "in-person", condition: "Fatigue / CBC",   status: "in-progress" },
  { id: "4",  patient: "Omar Farooq",    age: 45, avatar: "OF", date: "Today",     time: "02:00 PM", type: "Annual Checkup",mode: "in-person", condition: "General Wellness",status: "scheduled" },
  { id: "5",  patient: "Zainab Raza",    age: 61, avatar: "ZR", date: "Today",     time: "03:30 PM", type: "Follow-up",     mode: "in-person", condition: "Arthritis",       status: "scheduled" },
  { id: "6",  patient: "Khaled Noor",    age: 39, avatar: "KN", date: "Tomorrow",  time: "09:30 AM", type: "Follow-up",     mode: "video",     condition: "Vitamin D",       status: "scheduled" },
  { id: "7",  patient: "Fatima Shah",    age: 27, avatar: "FS", date: "Tomorrow",  time: "11:00 AM", type: "Consultation",  mode: "in-person", condition: "Thyroid",         status: "scheduled" },
  { id: "8",  patient: "Ahmed Rehman",   age: 66, avatar: "AR", date: "Tomorrow",  time: "03:00 PM", type: "Follow-up",     mode: "in-person", condition: "Cardiac",         status: "scheduled" },
  { id: "9",  patient: "Nadia Jamil",    age: 43, avatar: "NJ", date: "Mar 8",     time: "10:00 AM", type: "Annual Checkup",mode: "in-person", condition: "Wellness",        status: "completed" },
  { id: "10", patient: "Tariq Mehmood",  age: 58, avatar: "TM", date: "Mar 7",     time: "02:30 PM", type: "Consultation",  mode: "video",     condition: "Hypertension",    status: "no-show" },
  { id: "11", patient: "Sana Iqbal",     age: 32, avatar: "SI", date: "Mar 6",     time: "11:00 AM", type: "Follow-up",     mode: "in-person", condition: "Anemia",          status: "cancelled" },
];

type FilterOption = "All" | "Today" | "Upcoming" | "Completed" | "Cancelled";

const STATUS_META: Record<ApptStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  scheduled:    { label: "Scheduled",    cls: "bg-primary/10 text-primary",                        icon: <Clock className="size-3" /> },
  "in-progress":{ label: "In Progress",  cls: "bg-[#4D9A7F]/15 text-[#4D9A7F]",                  icon: <div className="size-1.5 rounded-full bg-[#4D9A7F] animate-pulse" /> },
  completed:    { label: "Completed",    cls: "bg-vault-positive-light text-vault-positive",        icon: <CheckCircle2 className="size-3" /> },
  cancelled:    { label: "Cancelled",    cls: "bg-vault-negative-light text-vault-negative",        icon: <XCircle className="size-3" /> },
  "no-show":    { label: "No Show",      cls: "bg-vault-warning-light text-vault-warning",          icon: <AlertCircle className="size-3" /> },
};

// ─── Page ──────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [filter, setFilter]       = useState<FilterOption>("All");
  const [search, setSearch]       = useState("");
  const [appts, setAppts]         = useState<Appointment[]>(APPOINTMENTS);

  const startAppt    = (id: string) => setAppts((prev) => prev.map((a) =>
    a.id === id ? { ...a, status: "in-progress" } :
    a.status === "in-progress" ? { ...a, status: "scheduled" } : a
  ));
  const completeAppt = (id: string) => setAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "completed" }  : a));
  const cancelAppt   = (id: string) => setAppts((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled"  }  : a));

  const filtered = appts.filter((a) => {
    const matchFilter =
      filter === "All"       ? true :
      filter === "Today"     ? a.date === "Today" :
      filter === "Upcoming"  ? (a.status === "scheduled" || a.status === "in-progress") :
      filter === "Completed" ? a.status === "completed" :
      (a.status === "cancelled" || a.status === "no-show");

    const matchSearch = search
      ? a.patient.toLowerCase().includes(search.toLowerCase()) ||
        a.condition.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  const todayCount    = appts.filter((a) => a.date === "Today").length;
  const upcomingCount = appts.filter((a) => a.status === "scheduled" || a.status === "in-progress").length;

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Appointments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {todayCount} today · {upcomingCount} upcoming
          </p>
        </div>
        <Button className="gap-2 self-start sm:self-auto" style={{ background: "#4D9A7F", color: "white" }}>
          <Plus className="size-4" />
          Add Appointment
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search patient or condition…"
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="hidden grid-cols-[1fr_110px_110px_130px_110px_140px] gap-3 border-b border-border/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
          <span>Patient</span>
          <span>Date / Time</span>
          <span>Type</span>
          <span>Condition</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Calendar className="mx-auto mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No appointments match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((appt) => {
              const meta = STATUS_META[appt.status];
              return (
                <div
                  key={appt.id}
                  className={`flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_110px_110px_130px_110px_140px] sm:items-center sm:gap-3 ${
                    appt.status === "in-progress" ? "bg-[#4D9A7F]/[0.03]" : ""
                  }`}
                >
                  {/* Patient */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                        appt.status === "in-progress"
                          ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                          : appt.status === "completed"
                          ? "bg-muted/50 text-muted-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}
                    >
                      {appt.avatar}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${appt.status === "completed" ? "text-muted-foreground" : "text-foreground"}`}>
                        {appt.patient}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{appt.age} yrs</p>
                    </div>
                  </div>
                  {/* Date/Time */}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{appt.date}</p>
                    <p className="text-[11px] text-muted-foreground">{appt.time}</p>
                  </div>
                  {/* Type */}
                  <div>
                    <p className="text-xs text-foreground">{appt.type}</p>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      {appt.mode === "video" ? <Video className="size-2.5" /> : <MapPin className="size-2.5" />}
                      {appt.mode === "video" ? "Video" : "In-person"}
                    </span>
                  </div>
                  {/* Condition */}
                  <p className="truncate text-xs text-muted-foreground">{appt.condition}</p>
                  {/* Status */}
                  <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                  {/* Contextual Actions */}
                  <div className="flex items-center gap-1.5">
                    {appt.status === "scheduled" && (
                      <button
                        onClick={() => startAppt(appt.id)}
                        className="flex items-center gap-1 rounded-lg bg-[#4D9A7F]/10 px-2.5 py-1.5 text-[11px] font-semibold text-[#4D9A7F] transition-colors hover:bg-[#4D9A7F]/20"
                      >
                        <Play className="size-2.5" />
                        Start
                      </button>
                    )}
                    {appt.status === "in-progress" && (
                      <button
                        onClick={() => completeAppt(appt.id)}
                        className="flex items-center gap-1 rounded-lg bg-vault-positive-light px-2.5 py-1.5 text-[11px] font-semibold text-vault-positive transition-colors hover:bg-vault-positive/20"
                      >
                        <CheckCircle2 className="size-2.5" />
                        Done
                      </button>
                    )}
                    {(appt.status === "scheduled" || appt.status === "in-progress") && (
                      <button
                        onClick={() => cancelAppt(appt.id)}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-vault-negative-light hover:text-vault-negative"
                        title="Cancel"
                      >
                        <XCircle className="size-3.5" />
                      </button>
                    )}
                    {appt.status === "no-show" && (
                      <button
                        onClick={() => startAppt(appt.id)}
                        className="flex items-center gap-1 rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        <RotateCcw className="size-2.5" />
                        Reschedule
                      </button>
                    )}
                    {appt.status === "completed" && (
                      <button className="flex items-center gap-1 rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted/70">
                        <FileText className="size-2.5" />
                        Note
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {appts.length} appointments
      </p>
    </div>
  );
}
