"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type PatientStatus = "active" | "inactive" | "new";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  avatar: string;
  dob: string;
  phone: string;
  conditions: string[];
  lastVisit: string;
  nextAppt: string | null;
  prescriptions: number;
  status: PatientStatus;
}

const PATIENTS: Patient[] = [
  { id: "1",  name: "Aisha Malik",   age: 34, gender: "F", avatar: "AM", dob: "Mar 12, 1991", phone: "+44 7700 123456", conditions: ["Hypertension"],          lastVisit: "Mar 10, 2026", nextAppt: "Mar 15, 2026", prescriptions: 2, status: "active"   },
  { id: "2",  name: "Bilal Hassan",  age: 52, gender: "M", avatar: "BH", dob: "Jun 3, 1973",  phone: "+44 7700 234567", conditions: ["Type 2 Diabetes"],       lastVisit: "Mar 10, 2026", nextAppt: null,           prescriptions: 3, status: "active"   },
  { id: "3",  name: "Sara Qureshi",  age: 28, gender: "F", avatar: "SQ", dob: "Jan 18, 1998", phone: "+44 7700 345678", conditions: ["Fatigue"],               lastVisit: "Mar 10, 2026", nextAppt: null,           prescriptions: 1, status: "new"      },
  { id: "4",  name: "Omar Farooq",   age: 45, gender: "M", avatar: "OF", dob: "Sep 22, 1980", phone: "+44 7700 456789", conditions: ["General Wellness"],      lastVisit: "Oct 14, 2025", nextAppt: "Mar 10, 2026", prescriptions: 0, status: "active"   },
  { id: "5",  name: "Zainab Raza",   age: 61, gender: "F", avatar: "ZR", dob: "Feb 7, 1965",  phone: "+44 7700 567890", conditions: ["Arthritis", "Anemia"],   lastVisit: "Mar 10, 2026", nextAppt: "Mar 10, 2026", prescriptions: 2, status: "active"   },
  { id: "6",  name: "Khaled Noor",   age: 39, gender: "M", avatar: "KN", dob: "Apr 30, 1986", phone: "+44 7700 678901", conditions: ["Vitamin D Deficiency"],  lastVisit: "Feb 28, 2026", nextAppt: "Mar 11, 2026", prescriptions: 1, status: "active"   },
  { id: "7",  name: "Fatima Shah",   age: 27, gender: "F", avatar: "FS", dob: "Nov 14, 1998", phone: "+44 7700 789012", conditions: ["Hypothyroidism"],        lastVisit: "Jan 20, 2026", nextAppt: "Mar 11, 2026", prescriptions: 1, status: "active"   },
  { id: "8",  name: "Ahmed Rehman",  age: 66, gender: "M", avatar: "AR", dob: "May 5, 1959",  phone: "+44 7700 890123", conditions: ["Cardiac", "HTN"],        lastVisit: "Feb 15, 2026", nextAppt: "Mar 11, 2026", prescriptions: 4, status: "active"   },
  { id: "9",  name: "Nadia Jamil",   age: 43, gender: "F", avatar: "NJ", dob: "Jul 8, 1982",  phone: "+44 7700 901234", conditions: ["Migraine"],              lastVisit: "Mar 8, 2026",  nextAppt: null,           prescriptions: 1, status: "active"   },
  { id: "10", name: "Tariq Mehmood", age: 58, gender: "M", avatar: "TM", dob: "Dec 1, 1967",  phone: "+44 7700 012345", conditions: ["Hypertension", "CKD"],   lastVisit: "Feb 10, 2026", nextAppt: null,           prescriptions: 3, status: "inactive" },
];

// Per-patient appointment history for the profile panel
const PATIENT_HISTORY: Record<string, { date: string; type: string; status: "completed" | "cancelled" }[]> = {
  "1": [
    { date: "Mar 10, 2026", type: "Follow-up",      status: "completed" },
    { date: "Feb 10, 2026", type: "Consultation",   status: "completed" },
    { date: "Oct 14, 2025", type: "Annual Checkup", status: "completed" },
  ],
  "2": [
    { date: "Mar 10, 2026", type: "Consultation",   status: "completed" },
    { date: "Jan 22, 2026", type: "Follow-up",      status: "completed" },
  ],
};

// Per-patient prescription list
const PATIENT_RX: Record<string, string[]> = {
  "1": ["Amlodipine 5 mg — Once daily", "Lisinopril 10 mg — Once daily"],
  "2": ["Metformin 1000 mg — Twice daily", "Atorvastatin 20 mg — Once nightly", "Bisoprolol 5 mg — Once daily"],
  "5": ["Naproxen 500 mg — Twice daily PRN", "Ferrous sulfate 325 mg — Once daily"],
  "6": ["Vitamin D3 50,000 IU — Once weekly"],
  "7": ["Levothyroxine 50 mcg — Once daily AM"],
  "8": ["Bisoprolol 5 mg — Once daily", "Lisinopril 10 mg — Once daily", "Atorvastatin 20 mg — Nightly", "Aspirin 81 mg — Once daily"],
  "9": ["Sumatriptan 50 mg — As needed"],
  "10": ["Lisinopril 10 mg — Once daily", "Amlodipine 5 mg — Once daily", "Furosemide 20 mg — Once daily"],
};

type FilterOption = "All" | "Active" | "New" | "Inactive";

// ─── Page ──────────────────────────────────────────────────────

export default function PatientsPage() {
  const [filter,   setFilter]   = useState<FilterOption>("All");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Record<string, string[]>>({
    "1": ["Mar 10, 2026 — BP stable at 126/82. Continue Amlodipine 5 mg. Lifestyle modifications discussed."],
    "2": ["Mar 10, 2026 — Metformin adjusted to 1000 mg twice daily. HbA1c down to 6.8%. Follow up in 3 months."],
  });

  const submitNote = () => {
    if (!noteText.trim() || !selected) return;
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setNotes((prev) => ({
      ...prev,
      [selected.id]: [`${today} — ${noteText.trim()}`, ...(prev[selected.id] ?? [])],
    }));
    setNoteText("");
  };

  const filtered = PATIENTS.filter((p) => {
    const matchFilter =
      filter === "All"      ? true :
      filter === "Active"   ? p.status === "active" :
      filter === "New"      ? p.status === "new" :
      p.status === "inactive";

    const matchSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.conditions.some((c) => c.toLowerCase().includes(search.toLowerCase()))
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
              <span className="ml-2 text-sm font-normal text-muted-foreground">({PATIENTS.length})</span>
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
        <div className="flex-1 divide-y divide-border/40 overflow-y-auto">
          {filtered.map((patient) => (
            <button
              key={patient.id}
              onClick={() => setSelected(patient)}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 ${
                selected?.id === patient.id ? "border-r-2 border-[#4D9A7F] bg-[#4D9A7F]/6" : ""
              }`}
            >
              <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                patient.status === "new"      ? "border border-[#4D9A7F]/30 bg-[#4D9A7F]/15 text-[#4D9A7F]" :
                patient.status === "inactive" ? "bg-muted/50 text-muted-foreground" :
                "border border-border bg-card text-foreground"
              }`}>
                {patient.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{patient.name}</p>
                  {patient.status === "new" && (
                    <span className="shrink-0 rounded-full bg-[#4D9A7F]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#4D9A7F]">NEW</span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {patient.age}y · {patient.gender} · {patient.conditions[0]}
                  {patient.conditions.length > 1 ? ` +${patient.conditions.length - 1}` : ""}
                </p>
                <p className="text-[10px] text-muted-foreground/60">Last: {patient.lastVisit}</p>
              </div>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No patients match this filter.</p>
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
              {selected.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-playfair)" }}>
                    {selected.name}
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {selected.age} yrs · {selected.gender === "M" ? "Male" : "Female"} · DOB: {selected.dob}
                  </p>
                  <p className="text-sm text-muted-foreground">{selected.phone}</p>
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
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selected.conditions.map((c) => (
                  <span key={c} className="rounded-full bg-[#4D9A7F]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#4D9A7F]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border/60 bg-muted/20 px-5 py-3">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Last visit</span>
              <span className="text-xs font-semibold text-foreground">{selected.lastVisit}</span>
            </div>
            <span className="hidden text-border sm:block">·</span>
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-[#4D9A7F]" />
              <span className="text-xs text-muted-foreground">Next appt</span>
              <span className="text-xs font-semibold text-foreground">{selected.nextAppt ?? "Not scheduled"}</span>
            </div>
            <span className="hidden text-border sm:block">·</span>
            <div className="flex items-center gap-2">
              <Pill className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="text-xs font-semibold text-foreground">{selected.prescriptions}</span>
              <span className="text-xs text-muted-foreground">active prescription{selected.prescriptions !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
              <Calendar className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Recent Appointments</h3>
            </div>
            <div className="divide-y divide-border/40">
              {(PATIENT_HISTORY[selected.id] ?? []).length > 0 ? (
                (PATIENT_HISTORY[selected.id] ?? []).map((appt, j) => (
                  <div key={j} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{appt.type}</p>
                      <p className="text-[11px] text-muted-foreground">{appt.date}</p>
                    </div>
                    {appt.status === "completed" ? (
                      <span className="flex items-center gap-1 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                        <CheckCircle2 className="size-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-full bg-vault-negative-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-negative">
                        <XCircle className="size-3" />
                        Cancelled
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground/60">No visit history recorded.</p>
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
              {(PATIENT_RX[selected.id] ?? []).length > 0 ? (
                (PATIENT_RX[selected.id] ?? []).map((item, j) => (
                  <div key={j} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#4D9A7F]/10">
                      <Pill className="size-3 text-[#4D9A7F]" />
                    </div>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground">No active prescriptions.</p>
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
                  disabled={!noteText.trim()}
                  className="flex size-10 shrink-0 items-center justify-center self-end rounded-xl bg-[#4D9A7F] text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="divide-y divide-border/40">
              {(notes[selected.id] ?? []).length > 0 ? (
                (notes[selected.id] ?? []).map((item, j) => (
                  <div key={j} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted/40">
                      <Clock className="size-3 text-muted-foreground/60" />
                    </div>
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </div>
                ))
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground/60">No notes yet.</p>
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
            <p className="text-sm font-medium text-muted-foreground">Select a patient to view their profile</p>
          </div>
        </div>
      )}
    </div>
  );
}
