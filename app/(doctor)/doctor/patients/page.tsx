"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Search,
  Plus,
  ChevronLeft,
  Calendar,
  Clock,
  Pill,
  FileText,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPatientListAction,
  getPatientDetailAction,
  savePatientNoteAction,
  type PatientSummary,
  type PatientDetail,
} from "./actions";

// ─── Helpers ──────────────────────────────────────────────────

function computeAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob + "T12:00:00Z");
  const today = new Date();
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const m = today.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

const TYPE_LABELS: Record<string, string> = {
  "follow-up":           "Follow-up",
  consultation:          "Consultation",
  checkup:               "Checkup",
  "prescription-review": "Prescription Review",
};

function fmtDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(mins / 60);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type FilterOption = "All" | "Active" | "New" | "Inactive";

// ─── Skeletons ────────────────────────────────────────────────

function PatientListSkeleton() {
  return (
    <div className="divide-y divide-border/40">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <div className="size-10 rounded-xl bg-muted/40 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-28 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted/30 animate-pulse" />
            <div className="h-2.5 w-16 rounded bg-muted/20 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="divide-y divide-border/40">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-5 py-3"
          style={{ opacity: 1 - i * 0.4 }}
        >
          <div className="size-6 rounded-full bg-muted/40 animate-pulse shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-40 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted/30 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function PatientsPage() {
  const [patients,      setPatients]      = useState<PatientSummary[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState<FilterOption>("All");
  const [search,        setSearch]        = useState("");
  const [selected,      setSelected]      = useState<PatientSummary | null>(null);
  const [detail,        setDetail]        = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteText,      setNoteText]      = useState("");
  const [noteError,     setNoteError]     = useState<string | null>(null);
  const [noteSaving,    startNoteTransition] = useTransition();

  // ── Load patient list on mount ──
  useEffect(() => {
    getPatientListAction().then((data) => {
      setPatients(data);
      setLoading(false);
    });
  }, []);

  // ── Load patient detail when selection changes ──
  const loadDetail = useCallback((patient: PatientSummary) => {
    setDetail(null);
    setDetailLoading(true);
    getPatientDetailAction(patient.id).then((d) => {
      setDetail(d);
      setDetailLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selected) {
      loadDetail(selected);
    } else {
      setDetail(null);
    }
  }, [selected, loadDetail]);

  // ── Note submission ──
  function submitNote() {
    if (!noteText.trim() || !selected) return;
    setNoteError(null);
    startNoteTransition(async () => {
      const { error } = await savePatientNoteAction(selected.id, noteText);
      if (error) {
        setNoteError(error);
        return;
      }
      setNoteText("");
      // Refresh detail to show new note
      const refreshed = await getPatientDetailAction(selected.id);
      setDetail(refreshed);
    });
  }

  // ── Filter + search ──
  const filtered = patients.filter((p) => {
    const matchFilter =
      filter === "All"      ? true :
      filter === "Active"   ? p.status === "active" :
      filter === "New"      ? p.status === "new" :
      p.status === "inactive";

    const matchSearch = search
      ? p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        (p.conditions[0] ?? "").toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  return (
    <div className="flex h-[calc(100vh-72px)] gap-0 overflow-hidden">

      {/* ── Left: Patient List ── */}
      <div className={`flex flex-col border-r border-border bg-card transition-all ${selected ? "hidden w-0 lg:flex lg:w-96" : "w-full lg:w-96"}`}>

        {/* Header */}
        <div className="border-b border-border/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
              Patients
              <span className="ml-2 text-sm font-normal text-muted-foreground">({patients.length})</span>
            </h1>
            <Button size="sm" className="h-8 gap-1.5 text-xs" style={{ background: "#4D9A7F", color: "white" }}>
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search patients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-muted/20 py-2 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-1 focus:ring-[#4D9A7F]/20"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
            {(["All", "Active", "New", "Inactive"] as FilterOption[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 rounded-md py-1 text-[11px] font-medium transition-all ${
                  filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <PatientListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No patients found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((patient) => {
                const age = computeAge(patient.date_of_birth);
                const primaryCondition = patient.conditions[0] ?? "General";
                const extraConditions = patient.conditions.length > 1
                  ? ` +${patient.conditions.length - 1}`
                  : "";

                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelected(patient)}
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 ${
                      selected?.id === patient.id
                        ? "border-r-2 border-[#4D9A7F] bg-[#4D9A7F]/6"
                        : ""
                    }`}
                  >
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                      patient.status === "new"
                        ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]"
                        : patient.status === "inactive"
                        ? "bg-muted/50 text-muted-foreground"
                        : "border border-border bg-card text-foreground"
                    }`}>
                      {patient.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{patient.full_name}</p>
                        {patient.status === "new" && (
                          <span className="shrink-0 rounded-full bg-[#4D9A7F]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#4D9A7F]">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {age !== null ? `${age}y · ` : ""}{primaryCondition}{extraConditions}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">
                        Last: {patient.last_visit ? fmtDate(patient.last_visit) : "No visits"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Patient Profile ── */}
      {selected ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Back button (mobile) */}
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ChevronLeft className="size-4" />
            Back to patients
          </button>

          {/* Profile header */}
          <div className="flex items-start gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted/40 text-xl font-bold text-foreground">
              {selected.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    className="text-xl font-semibold text-foreground"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {selected.full_name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {computeAge(selected.date_of_birth) !== null
                      ? `${computeAge(selected.date_of_birth)} yrs · `
                      : ""}
                    {selected.date_of_birth
                      ? `DOB: ${fmtDate(selected.date_of_birth)}`
                      : "DOB: —"}
                  </p>
                  {selected.phone && (
                    <p className="text-sm text-muted-foreground">{selected.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                    <Calendar className="size-3.5" />
                    Book Appt
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                    <Pill className="size-3.5" />
                    New Rx
                  </Button>
                </div>
              </div>
              {selected.conditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.conditions.map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-[#4D9A7F]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4D9A7F]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/60 bg-muted/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last visit</span>
              <span className="text-xs font-semibold text-foreground">
                {selected.last_visit ? fmtDate(selected.last_visit) : "No visits"}
              </span>
            </div>
            <span className="hidden text-border sm:block">·</span>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-[#4D9A7F]" />
              <span className="text-xs text-muted-foreground">Next appt</span>
              <span className="text-xs font-semibold text-foreground">
                {selected.next_appointment ? fmtDate(selected.next_appointment) : "Not scheduled"}
              </span>
            </div>
            <span className="hidden text-border sm:block">·</span>
            <div className="flex items-center gap-2">
              <Pill className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">
                {selected.active_prescription_count}
              </span>
              <span className="text-xs text-muted-foreground">
                active prescription{selected.active_prescription_count !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
              <Calendar className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Recent Appointments</h3>
            </div>
            <div className="divide-y divide-border/40">
              {detailLoading ? (
                <SectionSkeleton />
              ) : (detail?.appointments ?? []).length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground/60">
                  No visit history recorded.
                </p>
              ) : (
                (detail?.appointments ?? []).map((appt) => (
                  <div
                    key={appt.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {TYPE_LABELS[appt.type] ?? appt.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {fmtDate(appt.appointment_date)}
                        {appt.start_time ? ` · ${fmtTime(appt.start_time)}` : ""}
                      </p>
                    </div>
                    {appt.status === "completed" && (
                      <span className="flex items-center gap-1 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                        <CheckCircle2 className="size-3" />
                        Completed
                      </span>
                    )}
                    {appt.status === "cancelled" && (
                      <span className="flex items-center gap-1 rounded-full bg-vault-negative-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-negative">
                        <XCircle className="size-3" />
                        Cancelled
                      </span>
                    )}
                    {appt.status === "no-show" && (
                      <span className="flex items-center gap-1 rounded-full bg-vault-warning-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-warning">
                        <AlertCircle className="size-3" />
                        No-show
                      </span>
                    )}
                    {appt.status === "upcoming" && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        <Clock className="size-3" />
                        Upcoming
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Prescriptions */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
              <Pill className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Active Prescriptions</h3>
            </div>
            <div className="divide-y divide-border/40">
              {detailLoading ? (
                <SectionSkeleton />
              ) : (detail?.prescriptions ?? []).length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground">No active prescriptions.</p>
              ) : (
                (detail?.prescriptions ?? []).map((rx) => (
                  <div key={rx.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#4D9A7F]/10">
                      <Pill className="size-3 text-[#4D9A7F]" />
                    </div>
                    <p className="text-sm text-foreground">
                      {rx.medication} {rx.dose} — {rx.frequency}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Clinical Notes */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
              <FileText className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Clinical Notes</h3>
            </div>

            {/* Note composer */}
            <div className="border-b border-border/60 p-4">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitNote();
                  }}
                  placeholder="Write a clinical note… (⌘↵ to save)"
                  className="flex-1 resize-none rounded-xl border border-border bg-muted/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
                />
                <button
                  onClick={submitNote}
                  disabled={!noteText.trim() || noteSaving}
                  className="flex size-10 shrink-0 items-center justify-center self-end rounded-xl bg-[#4D9A7F] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {noteSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </div>
              {noteError && (
                <p className="mt-1.5 text-[11px] text-vault-negative">{noteError}</p>
              )}
            </div>

            {/* Notes list */}
            <div className="divide-y divide-border/40">
              {detailLoading ? (
                <SectionSkeleton />
              ) : (detail?.notes ?? []).length === 0 ? (
                <p className="px-5 py-4 text-sm text-muted-foreground/60">No notes yet.</p>
              ) : (
                (detail?.notes ?? []).map((note) => (
                  <div key={note.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/40">
                      <Clock className="size-3 text-muted-foreground/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">{note.content}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/50">
                        {relativeTime(note.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted/30">
              <Search className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Select a patient to view their profile
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
