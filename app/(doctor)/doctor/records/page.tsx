"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  FileText,
  Upload,
  Download,
  Eye,
  ChevronRight,
  FlaskConical,
  Pill,
  Stethoscope,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type RecordType = "note" | "lab" | "prescription" | "report" | "referral";

interface MedRecord {
  id: string;
  patient: string;
  avatar: string;
  age: number;
  type: RecordType;
  title: string;
  date: string;
  size?: string;
  summary?: string;
  status?: "normal" | "abnormal" | "pending";
}

const RECORDS: MedRecord[] = [
  { id: "1",  patient: "Sara Qureshi",  avatar: "SQ", age: 28, type: "lab",          title: "CBC Panel",                        date: "Mar 10, 2026", size: "180 KB", status: "pending", summary: "Awaiting final review." },
  { id: "2",  patient: "Aisha Malik",   avatar: "AM", age: 34, type: "note",         title: "Follow-up Clinical Note",          date: "Mar 10, 2026",              summary: "BP stable at 126/82. Lifestyle modifications discussed." },
  { id: "3",  patient: "Bilal Hassan",  avatar: "BH", age: 52, type: "note",         title: "Diabetes Management Note",         date: "Mar 10, 2026",              summary: "Metformin adjusted to 1000mg. HbA1c 6.8% — improving." },
  { id: "4",  patient: "Aisha Malik",   avatar: "AM", age: 34, type: "lab",          title: "Full Blood Count",                 date: "Feb 10, 2026", size: "210 KB", status: "normal",  summary: "All values within reference range." },
  { id: "5",  patient: "Bilal Hassan",  avatar: "BH", age: 52, type: "lab",          title: "HbA1c & Metabolic Panel",          date: "Feb 10, 2026", size: "245 KB", status: "normal",  summary: "HbA1c 6.8% — good control." },
  { id: "6",  patient: "Zainab Raza",   avatar: "ZR", age: 61, type: "lab",          title: "ESR & CRP — Inflammation Markers", date: "Feb 5, 2026",  size: "190 KB", status: "abnormal",summary: "CRP elevated at 18 mg/L. Arthritis flare confirmed." },
  { id: "7",  patient: "Omar Farooq",   avatar: "OF", age: 45, type: "report",       title: "Annual Health Summary 2025",       date: "Oct 14, 2025", size: "350 KB" },
  { id: "8",  patient: "Ahmed Rehman",  avatar: "AR", age: 66, type: "referral",     title: "Cardiology Referral — Dr. Rahman", date: "Feb 15, 2026", size: "62 KB" },
  { id: "9",  patient: "Tariq Mehmood", avatar: "TM", age: 58, type: "report",       title: "Renal Function Upload",            date: "Feb 10, 2026", size: "156 KB" },
  { id: "10", patient: "Fatima Shah",   avatar: "FS", age: 27, type: "lab",          title: "TSH + Free T4 Panel",              date: "Jan 20, 2026", size: "170 KB", status: "normal" },
];

const TYPE_META: Record<RecordType, { label: string; icon: React.ReactNode; cls: string }> = {
  note:         { label: "Clinical Note",  icon: <FileText className="size-4" />,    cls: "bg-primary/10 text-primary" },
  lab:          { label: "Lab Result",     icon: <FlaskConical className="size-4" />, cls: "bg-[#4D9A7F]/10 text-[#4D9A7F]" },
  prescription: { label: "Prescription",   icon: <Pill className="size-4" />,        cls: "bg-vault-warning-light text-vault-warning" },
  report:       { label: "Report",         icon: <FileText className="size-4" />,    cls: "bg-muted/60 text-muted-foreground" },
  referral:     { label: "Referral",       icon: <Stethoscope className="size-4" />, cls: "bg-violet-500/10 text-violet-600" },
};

type FilterOption = "All" | "Notes" | "Labs" | "Reports" | "Referrals";

// ─── Page ──────────────────────────────────────────────────────

export default function RecordsPage() {
  const [filter, setFilter] = useState<FilterOption>("All");
  const [search, setSearch] = useState("");

  const filtered = RECORDS.filter((r) => {
    const matchFilter =
      filter === "All"      ? true :
      filter === "Notes"    ? r.type === "note" :
      filter === "Labs"     ? r.type === "lab" :
      filter === "Reports"  ? r.type === "report" :
      r.type === "referral";

    const matchSearch = search
      ? r.patient.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
            Medical Records
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Clinical notes, lab results, reports, and referrals
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 self-start sm:self-auto">
            <Upload className="size-4" />
            Upload
          </Button>
          <Button className="gap-2 self-start sm:self-auto" style={{ background: "#4D9A7F", color: "white" }}>
            <Plus className="size-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            type="text"
            placeholder="Search patient or record…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          {(["All", "Notes", "Labs", "Reports", "Referrals"] as FilterOption[]).map((f) => (
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

      {/* Records list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No records found.</p>
          </div>
        ) : (
          filtered.map((rec) => {
            const meta = TYPE_META[rec.type];
            return (
              <div
                key={rec.id}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Type icon */}
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
                  {meta.icon}
                </div>

                {/* Patient + info */}
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-[10px] font-bold text-foreground">
                    {rec.avatar}
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground">{rec.patient} · {rec.age}y</p>
                    <p className="text-sm font-medium text-foreground">{rec.title}</p>
                    {rec.summary && (
                      <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">{rec.summary}</p>
                    )}
                  </div>
                </div>

                {/* Right: meta */}
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-[11px] text-muted-foreground">{rec.date}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.cls}`}>
                        {meta.label}
                      </span>
                      {rec.status && (
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase ${
                          rec.status === "normal" ? "bg-vault-positive-light text-vault-positive" :
                          rec.status === "abnormal" ? "bg-vault-negative-light text-vault-negative" :
                          "bg-vault-warning-light text-vault-warning"
                        }`}>
                          {rec.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" title="View">
                      <Eye className="size-3.5" />
                    </button>
                    {rec.size && (
                      <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground" title="Download">
                        <Download className="size-3.5" />
                      </button>
                    )}
                    <button className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {RECORDS.length} records shown
      </p>
    </div>
  );
}
