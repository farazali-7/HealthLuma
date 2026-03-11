"use client";

import { useState } from "react";
import {
  FileText,
  FlaskConical,
  Pill,
  Upload,
  Download,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

const LAB_RESULTS = [
  {
    test: "Complete Blood Count (CBC)",
    date: "Feb 10, 2026",
    ordered_by: "Dr. Jack",
    status: "normal" as const,
    results: [
      { label: "WBC",         value: "6.2 ×10³/µL", ref: "4.5–11.0", flag: null },
      { label: "RBC",         value: "5.1 ×10⁶/µL", ref: "4.5–5.9",  flag: null },
      { label: "Hemoglobin",  value: "14.8 g/dL",    ref: "13.5–17.5",flag: null },
      { label: "Hematocrit",  value: "44.2%",         ref: "41–53",    flag: null },
      { label: "Platelets",   value: "245 ×10³/µL",  ref: "150–400",  flag: null },
    ],
  },
  {
    test: "Metabolic Panel",
    date: "Feb 10, 2026",
    ordered_by: "Dr. Jack",
    status: "attention" as const,
    results: [
      { label: "Total Cholesterol",      value: "182 mg/dL", ref: "<200",    flag: null          },
      { label: "LDL",                    value: "108 mg/dL", ref: "<130",    flag: null          },
      { label: "HDL",                    value: "52 mg/dL",  ref: ">40",     flag: null          },
      { label: "Triglycerides",          value: "112 mg/dL", ref: "<150",    flag: null          },
      { label: "Vitamin D (25-OH)",      value: "28 ng/mL",  ref: "30–100",  flag: "low" as const },
      { label: "Blood Glucose (fasting)",value: "94 mg/dL",  ref: "70–99",   flag: null          },
    ],
  },
  {
    test: "Thyroid Function Panel",
    date: "Nov 5, 2025",
    ordered_by: "Dr. Jack",
    status: "normal" as const,
    results: [
      { label: "TSH",    value: "2.1 mIU/L", ref: "0.4–4.0", flag: null },
      { label: "Free T4",value: "1.2 ng/dL", ref: "0.8–1.8", flag: null },
    ],
  },
];

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

type Tab = "labs" | "prescriptions" | "documents";

// ─── Page ──────────────────────────────────────────────────────

export default function RecordsPage() {
  const [tab, setTab]             = useState<Tab>("labs");
  const [expandedLab, setExpandedLab] = useState<number | null>(0);

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Health Records
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lab results, prescriptions, and clinical documents
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start sm:self-auto">
          <Upload className="size-4" />
          Upload Document
        </Button>
      </div>

      {/* ── Tabs ── */}
      <div className="flex w-fit gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {(
          [
            { id: "labs",          label: "Lab Results",   icon: <FlaskConical className="size-3.5" /> },
            { id: "prescriptions", label: "Prescriptions", icon: <Pill className="size-3.5" />        },
            { id: "documents",     label: "Documents",     icon: <FileText className="size-3.5" />    },
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

      {/* ── Lab Results ── */}
      {tab === "labs" && (
        <div className="space-y-3">
          {LAB_RESULTS.map((lab, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <button
                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-muted/20"
                onClick={() => setExpandedLab(expandedLab === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                    lab.status === "normal" ? "bg-vault-positive-light" : "bg-vault-warning-light"
                  }`}>
                    <FlaskConical className={`size-4 ${
                      lab.status === "normal" ? "text-vault-positive" : "text-vault-warning"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{lab.test}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {lab.date} &middot; {lab.ordered_by}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    lab.status === "normal"
                      ? "bg-vault-positive-light text-vault-positive"
                      : "bg-vault-warning-light text-vault-warning"
                  }`}>
                    {lab.status === "normal" ? "All Normal" : "Needs Attention"}
                  </span>
                  <ChevronRight className={`size-4 text-muted-foreground transition-transform ${
                    expandedLab === i ? "rotate-90" : ""
                  }`} />
                </div>
              </button>

              {expandedLab === i && (
                <div className="border-t border-border/60">
                  <div className="grid grid-cols-4 gap-2 px-5 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <span>Test</span>
                    <span>Result</span>
                    <span>Reference</span>
                    <span>Flag</span>
                  </div>
                  {lab.results.map((r, j) => (
                    <div
                      key={j}
                      className={`grid grid-cols-4 gap-2 px-5 py-3 text-sm transition-colors ${
                        j % 2 === 0 ? "bg-muted/10" : ""
                      }`}
                    >
                      <span className="font-medium text-foreground">{r.label}</span>
                      <span className="tabular-nums text-foreground">{r.value}</span>
                      <span className="text-muted-foreground">{r.ref}</span>
                      <span>
                        {r.flag ? (
                          <span className="rounded-full bg-vault-warning-light px-2 py-0.5 text-[10px] font-semibold capitalize text-vault-warning">
                            {r.flag}
                          </span>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-vault-positive">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-3">
                    <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs">
                      <Eye className="size-3" />
                      Full Report
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                      <Download className="size-3" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Prescriptions ── */}
      {tab === "prescriptions" && (
        <div className="space-y-3">
          {PRESCRIPTIONS.map((rx, i) => (
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

          {DOCUMENTS.map((doc, i) => (
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
