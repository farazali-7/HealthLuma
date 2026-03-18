"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import {
  FileText,
  Pill,
  Upload,
  Download,
  Eye,
  Search,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getPatientPrescriptionsAction,
  type PatientPrescription,
  type PatientRxStatus,
} from "./actions";

// ─── Mock documents (no storage yet) ────────────────────────────

const DOCUMENTS = [
  {
    name: "Follow-up Notes — Feb 2026",
    date: "Feb 10, 2026",
    type: "Consultation Note",
    size: "84 KB",
  },
  {
    name: "Lab Results — Feb 2026",
    date: "Feb 10, 2026",
    type: "Lab Report",
    size: "210 KB",
  },
  {
    name: "Annual Physical Summary — 2025",
    date: "Oct 14, 2025",
    type: "Checkup Summary",
    size: "142 KB",
  },
  {
    name: "Prescription Summary — Jan 2026",
    date: "Jan 5, 2026",
    type: "Prescription Record",
    size: "56 KB",
  },
];

// ─── Status meta ─────────────────────────────────────────────────

const STATUS_META: Record<
  PatientRxStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  active: {
    label: "Active",
    icon: <CheckCircle2 className="size-3" />,
    className: "bg-[color:var(--vault-positive)]/10 text-[color:var(--vault-positive)]",
  },
  "refill-due": {
    label: "Refill Due",
    icon: <Clock className="size-3" />,
    className: "bg-[color:var(--vault-warning)]/10 text-[color:var(--vault-warning)]",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="size-3" />,
    className: "bg-muted/60 text-muted-foreground",
  },
  discontinued: {
    label: "Discontinued",
    icon: <XCircle className="size-3" />,
    className: "bg-[color:var(--vault-negative)]/10 text-[color:var(--vault-negative)]",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isActive(status: PatientRxStatus) {
  return status === "active" || status === "refill-due";
}

// ─── Skeleton ────────────────────────────────────────────────────

function RxSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse"
        >
          <div className="flex gap-4">
            <div className="size-11 shrink-0 rounded-xl bg-muted/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-muted/50" />
              <div className="h-3 w-1/2 rounded bg-muted/40" />
              <div className="h-3 w-2/5 rounded bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────

type Tab = "prescriptions" | "documents";

// ─── Page ────────────────────────────────────────────────────────

export default function RecordsPage() {
  const [tab, setTab]     = useState<Tab>("prescriptions");
  const [search, setSearch] = useState("");
  const [rxList, setRxList] = useState<PatientPrescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const load = () => {
    setLoading(true);
    setFetchError(null);
    startTransition(async () => {
      try {
        const data = await getPatientPrescriptionsAction();
        setRxList(data);
      } catch {
        setFetchError("Could not load prescriptions. Please try again.");
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ──
  const activePrescriptions = useMemo(
    () => rxList.filter((r) => isActive(r.status)),
    [rxList]
  );

  const filteredRx = useMemo(
    () =>
      rxList.filter((r) =>
        r.medication.toLowerCase().includes(search.toLowerCase()) ||
        (r.condition ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.doctor?.full_name ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [rxList, search]
  );

  const filteredDocs = useMemo(
    () =>
      DOCUMENTS.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.type.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Health Records
        </h1>
        <div className="mt-2 flex items-center gap-5 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Pill className="size-3.5 text-primary" />
            <strong className="font-semibold text-foreground">
              {activePrescriptions.length}
            </strong>{" "}
            active prescriptions
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" />
            <strong className="font-semibold text-foreground">{DOCUMENTS.length}</strong>{" "}
            documents
          </span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search records…"
          className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow sm:max-w-xs"
        />
      </div>

      {/* ── Tabs ── */}
      <div className="flex w-fit gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(
          [
            { id: "prescriptions", label: "Prescriptions", icon: <Pill className="size-3.5" /> },
            { id: "documents",     label: "Documents",     icon: <FileText className="size-3.5" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Prescriptions ── */}
      {tab === "prescriptions" && (
        <div className="space-y-5">
          {loading && <RxSkeleton />}

          {!loading && fetchError && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="size-4 shrink-0 text-[color:var(--vault-negative)]" />
                {fetchError}
              </div>
              <Button size="sm" variant="outline" onClick={load} className="h-8 gap-1.5 text-xs">
                <RefreshCw className="size-3" />
                Retry
              </Button>
            </div>
          )}

          {!loading && !fetchError && filteredRx.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? "No prescriptions match your search." : "No prescriptions on file."}
              </p>
            </div>
          )}

          {!loading && !fetchError && (
            <>
              {/* Active / Refill-due group */}
              {filteredRx.filter((r) => isActive(r.status)).length > 0 && (
                <div className="space-y-3">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Active
                  </p>
                  {filteredRx
                    .filter((r) => isActive(r.status))
                    .map((rx) => (
                      <PrescriptionCard key={rx.id} rx={rx} />
                    ))}
                </div>
              )}

              {/* Past / Discontinued group */}
              {filteredRx.filter((r) => !isActive(r.status)).length > 0 && (
                <div className="space-y-3">
                  <p className="px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Past
                  </p>
                  {filteredRx
                    .filter((r) => !isActive(r.status))
                    .map((rx) => (
                      <PrescriptionCard key={rx.id} rx={rx} />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Documents ── */}
      {tab === "documents" && (
        <div className="space-y-3">
          {/* Upload zone */}
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 py-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
                <Upload className="size-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Drop files here or browse</p>
              <p className="mt-0.5 text-xs text-muted-foreground">PDF, JPG, PNG up to 20 MB</p>
            </div>
          </div>

          {filteredDocs.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No documents match your search.</p>
            </div>
          )}
          {filteredDocs.map((doc, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
                <FileText className="size-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {doc.type} &middot; {doc.date} &middot; {doc.size}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-xs">
                  <Eye className="size-3" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
                  <Download className="size-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PrescriptionCard ────────────────────────────────────────────

function PrescriptionCard({ rx }: { rx: PatientPrescription }) {
  const meta   = STATUS_META[rx.status];
  const active = isActive(rx.status);
  const refillsLeft = rx.refills_total - rx.refills_used;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {/* Icon */}
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
            active ? "bg-primary/10" : "bg-muted/40"
          }`}
        >
          <Pill
            className={`size-5 ${active ? "text-primary" : "text-muted-foreground/50"}`}
          />
        </div>

        {/* Body */}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{rx.medication}</h3>
            <span className="text-xs font-medium text-muted-foreground">{rx.dose}</span>
            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
            >
              {meta.icon}
              {meta.label}
            </span>
          </div>

          <p className="text-[12px] text-muted-foreground">{rx.frequency}</p>

          {rx.condition && (
            <p className="text-[11px] text-muted-foreground">For: {rx.condition}</p>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            <span>Prescribed {formatDate(rx.prescribed_at)}</span>
            {rx.doctor && (
              <span>&middot; Dr. {rx.doctor.full_name.split(" ").slice(-1)[0]}</span>
            )}
            {active && (
              <span>
                &middot;{" "}
                {refillsLeft > 0
                  ? `${refillsLeft} refill${refillsLeft === 1 ? "" : "s"} remaining`
                  : "No refills remaining"}
              </span>
            )}
            {rx.expires_at && active && (
              <span>&middot; Expires {formatDate(rx.expires_at)}</span>
            )}
          </div>

          {rx.notes && (
            <p className="mt-1 text-[11px] italic text-muted-foreground/80">{rx.notes}</p>
          )}
        </div>

        {/* Refill CTA — only when active and refills remain */}
        {active && refillsLeft > 0 && (
          <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 text-xs">
            Request Refill
          </Button>
        )}
      </div>
    </div>
  );
}
