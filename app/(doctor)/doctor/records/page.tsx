"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
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
  AlertCircle,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getRecordsAction,
  createClinicalNoteRecordAction,
  type MedRecord,
  type RecordType,
} from "./actions";
import {
  searchPatientsAction,
  type PatientOption,
} from "../prescriptions/actions";

// ─── Type meta ────────────────────────────────────────────────

const TYPE_META: Record<RecordType, { label: string; icon: React.ReactNode; cls: string }> = {
  note:         { label: "Clinical Note", icon: <FileText className="size-4" />,    cls: "bg-primary/10 text-primary"                },
  lab:          { label: "Lab Result",    icon: <FlaskConical className="size-4" />, cls: "bg-[#4D9A7F]/10 text-[#4D9A7F]"           },
  prescription: { label: "Prescription",  icon: <Pill className="size-4" />,        cls: "bg-vault-warning-light text-vault-warning" },
  report:       { label: "Report",        icon: <FileText className="size-4" />,    cls: "bg-muted/60 text-muted-foreground"         },
  referral:     { label: "Referral",      icon: <Stethoscope className="size-4" />, cls: "bg-violet-500/10 text-violet-600"          },
};

type FilterOption = "All" | "Notes" | "Labs" | "Reports" | "Referrals";

// ─── Skeletons ────────────────────────────────────────────────

function RecordsSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ opacity: 1 - i * 0.18 }}
        >
          <div className="size-10 shrink-0 rounded-xl bg-muted/40 animate-pulse" />
          <div className="flex items-center gap-3 flex-1">
            <div className="size-8 shrink-0 rounded-lg bg-muted/40 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 rounded bg-muted/40 animate-pulse" />
              <div className="h-3.5 w-40 rounded bg-muted/40 animate-pulse" />
              <div className="h-3 w-64 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:block h-3 w-20 rounded bg-muted/30 animate-pulse" />
          <div className="hidden sm:block h-5 w-20 rounded-full bg-muted/30 animate-pulse" />
          <div className="flex gap-1">
            <div className="size-7 rounded-lg bg-muted/20 animate-pulse" />
            <div className="size-7 rounded-lg bg-muted/20 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── New Note Modal ───────────────────────────────────────────

function NewNoteModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patient,   setPatient]   = useState<PatientOption | null>(null);
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState<PatientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDrop,  setShowDrop]  = useState(false);
  const [content,   setContent]   = useState("");
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [isPending, startTransition] = useTransition();

  // Debounced patient search
  useEffect(() => {
    if (!query.trim() || patient) {
      setResults([]);
      setShowDrop(false);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const data = await searchPatientsAction(query);
      setResults(data);
      setShowDrop(data.length > 0);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, patient]);

  function selectPatient(p: PatientOption) {
    setPatient(p);
    setQuery(p.full_name);
    setShowDrop(false);
    setResults([]);
  }

  function clearPatient() {
    setPatient(null);
    setQuery("");
    setResults([]);
    setShowDrop(false);
  }

  function handleSubmit() {
    setError(null);
    if (!patient) { setError("Please select a patient."); return; }
    if (!content.trim()) { setError("Note content cannot be empty."); return; }

    startTransition(async () => {
      const { error: err } = await createClinicalNoteRecordAction({
        patient_id: patient.id,
        content,
      });
      if (err) {
        setError(err);
        return;
      }
      setSaved(true);
      setTimeout(() => {
        onSuccess();
      }, 600);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">New Clinical Note</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Patient search */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Patient
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient by name…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (patient) setPatient(null);
                }}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
              {patient && (
                <button
                  type="button"
                  onClick={clearPatient}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground/50" />
              )}
              {showDrop && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="flex w-full items-center px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted/40"
                    >
                      {p.full_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Note Content
            </label>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write clinical note here…"
              className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-xs text-vault-negative">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={isPending || saved}
            style={{ background: saved ? "#185C45" : "#4D9A7F", color: "white" }}
            className="min-w-28 gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </>
            ) : saved ? (
              <>
                <Check className="size-3.5" />
                Saved
              </>
            ) : (
              "Save Note"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function RecordsPage() {
  const [records,      setRecords]      = useState<Omit<MedRecord, "_sortKey">[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<FilterOption>("All");
  const [search,       setSearch]       = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);

  const loadRecords = useCallback(async () => {
    const data = await getRecordsAction();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── Computed stats ──
  const notesCount    = records.filter((r) => r.type === "note").length;
  const labsCount     = records.filter((r) => r.type === "lab").length;
  const reportsCount  = records.filter((r) => r.type === "report" || r.type === "prescription").length;
  const referralCount = records.filter((r) => r.type === "referral").length;
  const abnormalCount = 0;

  // ── Filter + search ──
  const filtered = records.filter((r) => {
    const matchFilter =
      filter === "All"      ? true :
      filter === "Notes"    ? r.type === "note" :
      filter === "Labs"     ? r.type === "lab" :
      filter === "Reports"  ? (r.type === "report" || r.type === "prescription") :
      r.type === "referral";

    const matchSearch = search
      ? r.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        r.title.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
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
          <Button
            className="gap-2 self-start sm:self-auto"
            style={{ background: "#4D9A7F", color: "white" }}
            onClick={() => setShowNoteModal(true)}
          >
            <Plus className="size-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Abnormal alert */}
      {abnormalCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-vault-negative/30 bg-vault-negative-light px-4 py-3">
          <AlertCircle className="size-4 shrink-0 text-vault-negative" />
          <p className="text-sm">
            <span className="font-semibold text-vault-negative">
              {abnormalCount} abnormal result{abnormalCount > 1 ? "s" : ""}
            </span>{" "}
            <span className="text-muted-foreground">
              flagged — review before next consultation.
            </span>
          </p>
        </div>
      )}

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Clinical Notes", value: notesCount,    cls: "text-primary",          dot: "bg-primary"          },
          { label: "Lab Results",    value: labsCount,     cls: "text-[#4D9A7F]",        dot: "bg-[#4D9A7F]"        },
          { label: "Reports",        value: reportsCount,  cls: "text-muted-foreground", dot: "bg-muted-foreground" },
          { label: "Referrals",      value: referralCount, cls: "text-violet-600",       dot: "bg-violet-500"       },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`size-1.5 rounded-full ${s.dot}`} />
              <p className="text-[10px] font-medium text-muted-foreground">{s.label}</p>
            </div>
            <p className={`text-xl font-semibold tabular-nums ${s.cls}`}>{s.value}</p>
          </div>
        ))}
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

      {/* Records list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Column header */}
        <div className="hidden grid-cols-[40px_1fr_120px_80px_80px] gap-4 border-b border-border/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
          <span />
          <span>Patient · Record</span>
          <span>Date</span>
          <span>Type</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <RecordsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No records found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((rec) => {
              const meta = TYPE_META[rec.type];
              return (
                <div
                  key={rec.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20"
                >
                  {/* Type icon */}
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
                    {meta.icon}
                  </div>

                  {/* Patient + record info */}
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 text-[10px] font-bold text-foreground">
                      {rec.patient_initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-muted-foreground">
                        {rec.patient_name}
                        {rec.patient_age !== null ? ` · ${rec.patient_age}y` : ""}
                      </p>
                      <p className="text-sm font-medium text-foreground">{rec.title}</p>
                      {rec.summary && (
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                          {rec.summary}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Date */}
                  <div className="hidden shrink-0 sm:block">
                    <p className="text-xs text-muted-foreground">{rec.date}</p>
                    {rec.file_size && (
                      <p className="text-[10px] text-muted-foreground/60">{rec.file_size}</p>
                    )}
                  </div>

                  {/* Type badge */}
                  <div className="hidden shrink-0 sm:block">
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                      title="View"
                    >
                      <Eye className="size-3.5" />
                    </button>
                    {rec.file_url !== null && (
                      <a
                        href={rec.file_url}
                        download
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title="Download"
                      >
                        <Download className="size-3.5" />
                      </a>
                    )}
                    <button
                      className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} of {records.length} records shown
      </p>

      {/* New Note Modal */}
      {showNoteModal && (
        <NewNoteModal
          onClose={() => setShowNoteModal(false)}
          onSuccess={async () => {
            setShowNoteModal(false);
            setLoading(true);
            await loadRecords();
          }}
        />
      )}
    </div>
  );
}
