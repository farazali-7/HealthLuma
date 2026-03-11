"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Pill,
  Upload,
  Download,
  Eye,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

const PRESCRIPTIONS = [
  {
    name: "Vitamin D3",
    dose: "2000 IU",
    frequency: "Once daily, morning",
    prescribed: "Feb 10, 2026",
    refills: 5,
    status: "active" as const,
  },
  {
    name: "Omega-3 Fatty Acids",
    dose: "1000 mg",
    frequency: "Once daily, evening",
    prescribed: "Feb 10, 2026",
    refills: 5,
    status: "active" as const,
  },
  {
    name: "Metformin",
    dose: "500 mg",
    frequency: "Twice daily with meals",
    prescribed: "Jan 5, 2026",
    refills: 2,
    status: "active" as const,
  },
  {
    name: "Amoxicillin",
    dose: "500 mg",
    frequency: "Three times daily",
    prescribed: "Oct 12, 2025",
    refills: 0,
    status: "completed" as const,
  },
];

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

type Tab = "prescriptions" | "documents";

// ─── Page ──────────────────────────────────────────────────────

export default function RecordsPage() {
  const [tab, setTab]   = useState<Tab>("prescriptions");
  const [search, setSearch] = useState("");

  const filteredRx = useMemo(
    () => PRESCRIPTIONS.filter((r) =>
      r.name.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const filteredDocs = useMemo(
    () => DOCUMENTS.filter((d) =>
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
        <p className="mt-1 text-sm text-muted-foreground">
          Prescriptions and clinical documents
        </p>
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
            { id: "prescriptions", label: "Prescriptions", icon: <Pill className="size-3.5" />     },
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
        <div className="space-y-3">
          {filteredRx.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">No prescriptions match your search.</p>
            </div>
          )}
          {filteredRx.map((rx, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  rx.status === "active" ? "bg-primary/10" : "bg-muted/40"
                }`}>
                  <Pill className={`size-5 ${
                    rx.status === "active" ? "text-primary" : "text-muted-foreground/50"
                  }`} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{rx.name}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{rx.dose}</span>
                    <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      rx.status === "active"
                        ? "bg-vault-positive-light text-vault-positive"
                        : "bg-muted/60 text-muted-foreground"
                    }`}>
                      {rx.status === "active" ? "Active" : "Completed"}
                    </span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">{rx.frequency}</p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                    <span>Prescribed {rx.prescribed}</span>
                    <span>&middot; Dr. Jack</span>
                    {rx.status === "active" && (
                      <span>&middot; {rx.refills} refills remaining</span>
                    )}
                  </div>
                </div>
                {rx.status === "active" && (
                  <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 text-xs">
                    Request Refill
                  </Button>
                )}
              </div>
            </div>
          ))}
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
