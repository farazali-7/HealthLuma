"use client";

import { useState } from "react";
import {
  Pill,
  Plus,
  Search,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type RxStatus = "active" | "completed" | "refill-due";

interface Prescription {
  id: string;
  patient: string;
  avatar: string;
  age: number;
  medication: string;
  dose: string;
  frequency: string;
  duration: string;
  prescribed: string;
  expires: string;
  refills: number;
  refillsUsed: number;
  status: RxStatus;
  condition: string;
}

const PRESCRIPTIONS: Prescription[] = [
  { id: "1",  patient: "Aisha Malik",   avatar: "AM", age: 34, medication: "Amlodipine",       dose: "5 mg",      frequency: "Once daily",        duration: "3 months", prescribed: "Mar 10, 2026", expires: "Jun 10, 2026", refills: 3, refillsUsed: 0, status: "active",      condition: "Hypertension"       },
  { id: "2",  patient: "Bilal Hassan",  avatar: "BH", age: 52, medication: "Metformin",         dose: "1000 mg",   frequency: "Twice daily",       duration: "Ongoing",  prescribed: "Mar 10, 2026", expires: "Sep 10, 2026", refills: 5, refillsUsed: 1, status: "active",      condition: "Type 2 Diabetes"    },
  { id: "3",  patient: "Bilal Hassan",  avatar: "BH", age: 52, medication: "Atorvastatin",      dose: "20 mg",     frequency: "Once nightly",      duration: "Ongoing",  prescribed: "Mar 10, 2026", expires: "Sep 10, 2026", refills: 5, refillsUsed: 0, status: "active",      condition: "Hyperlipidemia"     },
  { id: "4",  patient: "Zainab Raza",   avatar: "ZR", age: 61, medication: "Naproxen",          dose: "500 mg",    frequency: "Twice daily PRN",   duration: "1 month",  prescribed: "Mar 10, 2026", expires: "Apr 10, 2026", refills: 1, refillsUsed: 0, status: "active",      condition: "Arthritis"          },
  { id: "5",  patient: "Khaled Noor",   avatar: "KN", age: 39, medication: "Vitamin D3",        dose: "50,000 IU", frequency: "Once weekly",       duration: "3 months", prescribed: "Feb 28, 2026", expires: "May 28, 2026", refills: 2, refillsUsed: 0, status: "active",      condition: "Vitamin D Def."     },
  { id: "6",  patient: "Fatima Shah",   avatar: "FS", age: 27, medication: "Levothyroxine",     dose: "50 mcg",    frequency: "Once daily AM",     duration: "6 months", prescribed: "Jan 20, 2026", expires: "Jul 20, 2026", refills: 5, refillsUsed: 2, status: "active",      condition: "Hypothyroidism"     },
  { id: "7",  patient: "Ahmed Rehman",  avatar: "AR", age: 66, medication: "Bisoprolol",        dose: "5 mg",      frequency: "Once daily",        duration: "Ongoing",  prescribed: "Feb 15, 2026", expires: "Aug 15, 2026", refills: 5, refillsUsed: 0, status: "active",      condition: "Cardiac"            },
  { id: "8",  patient: "Tariq Mehmood", avatar: "TM", age: 58, medication: "Lisinopril",        dose: "10 mg",     frequency: "Once daily",        duration: "Ongoing",  prescribed: "Feb 10, 2026", expires: "Feb 10, 2026", refills: 0, refillsUsed: 3, status: "refill-due",  condition: "Hypertension"       },
  { id: "9",  patient: "Nadia Jamil",   avatar: "NJ", age: 43, medication: "Sumatriptan",       dose: "50 mg",     frequency: "As needed",         duration: "3 months", prescribed: "Mar 8, 2026",  expires: "Jun 8, 2026",  refills: 2, refillsUsed: 0, status: "active",      condition: "Migraine"           },
  { id: "10", patient: "Aisha Malik",   avatar: "AM", age: 34, medication: "Amoxicillin",       dose: "500 mg",    frequency: "Three times daily", duration: "7 days",   prescribed: "Jan 15, 2026", expires: "Jan 22, 2026", refills: 0, refillsUsed: 0, status: "completed",   condition: "Respiratory Inf."   },
];

type FilterOption = "All" | "Active" | "Refill Due" | "Completed";

const STATUS_META: Record<RxStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active:       { label: "Active",     cls: "bg-vault-positive-light text-vault-positive", icon: <CheckCircle2 className="size-3" /> },
  "refill-due": { label: "Refill Due", cls: "bg-vault-warning-light text-vault-warning",   icon: <AlertCircle  className="size-3" /> },
  completed:    { label: "Completed",  cls: "bg-muted/60 text-muted-foreground",           icon: <Clock        className="size-3" /> },
};

// ─── New Rx Modal ───────────────────────────────────────────────

function NewRxModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">New Prescription</h2>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="space-y-4 p-6">
          {[
            { label: "Patient",    placeholder: "Search patient…"             },
            { label: "Medication", placeholder: "Drug name"                   },
            { label: "Dose",       placeholder: "e.g. 500 mg"                 },
            { label: "Frequency",  placeholder: "e.g. Twice daily"            },
            { label: "Duration",   placeholder: "e.g. 7 days / Ongoing"       },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{f.label}</label>
              <input
                placeholder={f.placeholder}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Refills</label>
              <input
                type="number"
                placeholder="0"
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Notes</label>
              <input
                placeholder="Optional"
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" style={{ background: "#4D9A7F", color: "white" }} onClick={onClose}>
              Issue Prescription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function PrescriptionsPage() {
  const [filter,    setFilter]    = useState<FilterOption>("All");
  const [search,    setSearch]    = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = PRESCRIPTIONS.filter((p) => {
    const matchFilter =
      filter === "All"        ? true :
      filter === "Active"     ? p.status === "active" :
      filter === "Refill Due" ? p.status === "refill-due" :
      p.status === "completed";

    const matchSearch = search
      ? p.patient.toLowerCase().includes(search.toLowerCase()) ||
        p.medication.toLowerCase().includes(search.toLowerCase()) ||
        p.condition.toLowerCase().includes(search.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  const activeCount    = PRESCRIPTIONS.filter((p) => p.status === "active").length;
  const refillDueCount = PRESCRIPTIONS.filter((p) => p.status === "refill-due").length;
  const completedCount = PRESCRIPTIONS.filter((p) => p.status === "completed").length;

  return (
    <>
      {showModal && <NewRxModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
              Prescriptions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage active and historical prescriptions</p>
          </div>
          <Button
            className="gap-2 self-start sm:self-auto"
            style={{ background: "#4D9A7F", color: "white" }}
            onClick={() => setShowModal(true)}
          >
            <Plus className="size-4" />
            New Prescription
          </Button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active",     value: activeCount,    cls: "text-vault-positive", bg: "bg-vault-positive-light" },
            { label: "Refill Due", value: refillDueCount, cls: "text-vault-warning",  bg: "bg-vault-warning-light"  },
            { label: "Completed",  value: completedCount, cls: "text-muted-foreground", bg: "bg-muted/40"            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3.5">
              <p className={`text-2xl font-semibold ${s.cls}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Refill-due alert */}
        {refillDueCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-vault-warning/30 bg-vault-warning-light px-4 py-3">
            <AlertCircle className="size-4 shrink-0 text-vault-warning" />
            <p className="text-sm">
              <span className="font-semibold text-vault-warning">
                {refillDueCount} prescription{refillDueCount > 1 ? "s" : ""} need{refillDueCount === 1 ? "s" : ""} renewal.
              </span>{" "}
              <span className="text-muted-foreground">Review and renew to avoid treatment gaps.</span>
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search patient, medication, condition…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>
          <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
            {(["All", "Active", "Refill Due", "Completed"] as FilterOption[]).map((f) => (
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
          <div className="hidden grid-cols-[1fr_130px_120px_90px_80px_110px_72px] gap-3 border-b border-border/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
            <span>Patient · Medication</span>
            <span>Dose &amp; Frequency</span>
            <span>Prescribed</span>
            <span>Expires</span>
            <span>Refills</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Pill className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No prescriptions found.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((rx) => {
                const meta = STATUS_META[rx.status];
                return (
                  <div
                    key={rx.id}
                    className={`flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_130px_120px_90px_80px_110px_72px] sm:items-center sm:gap-3 ${
                      rx.status === "refill-due" ? "bg-vault-warning-light/30" : ""
                    }`}
                  >
                    {/* Patient + medication */}
                    <div className="flex items-center gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                        rx.status === "completed"
                          ? "bg-muted/50 text-muted-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}>
                        {rx.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{rx.patient}</p>
                        <p className="text-xs font-semibold text-[#4D9A7F]">{rx.medication}</p>
                        <p className="text-[10px] text-muted-foreground">{rx.condition}</p>
                      </div>
                    </div>

                    {/* Dose & frequency */}
                    <div>
                      <p className="text-xs font-medium text-foreground">{rx.dose}</p>
                      <p className="text-[11px] text-muted-foreground">{rx.frequency}</p>
                    </div>

                    {/* Prescribed */}
                    <p className="text-xs text-muted-foreground">{rx.prescribed}</p>

                    {/* Expires */}
                    <p className={`text-xs font-medium ${rx.status === "refill-due" ? "text-vault-warning" : "text-muted-foreground"}`}>
                      {rx.expires}
                    </p>

                    {/* Refills left */}
                    <p className="text-xs text-muted-foreground">
                      {rx.refills - rx.refillsUsed}
                      <span className="text-muted-foreground/50"> / {rx.refills}</span>
                    </p>

                    {/* Status badge */}
                    <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>
                      {meta.icon}
                      {meta.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title="Copy"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title="Download PDF"
                      >
                        <Download className="size-3.5" />
                      </button>
                      <button
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                        title="Open"
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
          {filtered.length} of {PRESCRIPTIONS.length} prescriptions shown
        </p>
      </div>
    </>
  );
}
