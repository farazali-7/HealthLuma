"use client";

import {
  useState,
  useEffect,
  useTransition,
  useCallback,
  useRef,
} from "react";
import {
  Pill,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  XCircle,
  RefreshCcw,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDoctorPrescriptionsAction,
  issuePrescriptionAction,
  searchPatientsAction,
  markRefillUsedAction,
  updatePrescriptionStatusAction,
  type DoctorPrescription,
  type RxStatus,
  type PatientOption,
  type IssueRxInput,
} from "./actions";

// ─── Helpers ─────────────────────────────────────────────────────

function fmtDate(d: string): string {
  return new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Constants ───────────────────────────────────────────────────

type FilterOption = "All" | "Active" | "Refill Due" | "Completed";

const STATUS_META: Record<RxStatus, { label: string; cls: string; icon: React.ReactNode }> = {
  active:       { label: "Active",      cls: "bg-vault-positive-light text-vault-positive", icon: <CheckCircle2 className="size-3" /> },
  "refill-due": { label: "Refill Due",  cls: "bg-vault-warning-light text-vault-warning",   icon: <AlertCircle  className="size-3" /> },
  completed:    { label: "Completed",   cls: "bg-muted/60 text-muted-foreground",           icon: <Clock        className="size-3" /> },
  discontinued: { label: "Discontinued",cls: "bg-vault-negative-light text-vault-negative", icon: <Ban          className="size-3" /> },
};

// ─── Patient Search ───────────────────────────────────────────────

function PatientSearch({
  value,
  onSelect,
}: {
  value: PatientOption | null;
  onSelect: (p: PatientOption | null) => void;
}) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<PatientOption[]>([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When a patient is already selected, show their name in the input
  useEffect(() => {
    if (value) { setQuery(value.full_name); setOpen(false); }
  }, [value]);

  function handleChange(q: string) {
    setQuery(q);
    if (value) onSelect(null); // clear selection if user edits
    if (timer.current) clearTimeout(timer.current);
    if (!q.trim()) { setResults([]); setOpen(false); return; }

    timer.current = setTimeout(async () => {
      setLoading(true);
      const r = await searchPatientsAction(q);
      setResults(r);
      setOpen(true);
      setLoading(false);
    }, 300);
  }

  return (
    <div className="relative">
      <div className="relative">
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
        )}
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Search patient by name…"
          autoComplete="off"
          className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/40"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[10px] font-bold text-[#4D9A7F]">
                {initials(p.full_name)}
              </span>
              {p.full_name}
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && !loading && query.length > 1 && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-lg">
          No patients found.
        </div>
      )}
    </div>
  );
}

// ─── New Prescription Modal ───────────────────────────────────────

function NewRxModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [patient,   setPatient]   = useState<PatientOption | null>(null);
  const [form,      setForm]      = useState({
    medication: "", dose: "", frequency: "", duration: "",
    condition: "", notes: "", refills: "0", expires_at: "",
  });
  const [error,     setError]     = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handleSubmit() {
    setError(null);
    if (!patient) { setError("Select a patient."); return; }

    const input: IssueRxInput = {
      patient_id:    patient.id,
      medication:    form.medication.trim(),
      dose:          form.dose.trim(),
      frequency:     form.frequency.trim(),
      duration:      form.duration.trim() || undefined,
      condition:     form.condition.trim() || undefined,
      notes:         form.notes.trim()    || undefined,
      refills_total: Math.max(0, Math.min(12, parseInt(form.refills, 10) || 0)),
      expires_at:    form.expires_at || undefined,
    };

    startTransition(async () => {
      const { error: err } = await issuePrescriptionAction(input);
      if (err) { setError(err); return; }
      onSuccess();
    });
  }

  const field = (label: string, key: string, placeholder: string, type = "text") => (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={form[key as keyof typeof form]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-card px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[#4D9A7F]">
              <Pill className="size-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">New Prescription</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <XCircle className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">

          {/* Patient */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Patient <span className="text-vault-negative">*</span>
            </label>
            <PatientSearch value={patient} onSelect={setPatient} />
          </div>

          {/* Medication + Dose */}
          <div className="grid grid-cols-2 gap-3">
            {field("Medication *", "medication", "e.g. Metformin")}
            {field("Dose *",       "dose",       "e.g. 500 mg")}
          </div>

          {/* Frequency + Duration */}
          <div className="grid grid-cols-2 gap-3">
            {field("Frequency *", "frequency", "e.g. Twice daily with meals")}
            {field("Duration",    "duration",  "e.g. 3 months / Ongoing")}
          </div>

          {/* Condition + Refills */}
          <div className="grid grid-cols-2 gap-3">
            {field("Indication / Condition", "condition", "e.g. Type 2 Diabetes")}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Refills (0–12)</label>
              <input
                type="number"
                min={0}
                max={12}
                value={form.refills}
                onChange={(e) => set("refills", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
            </div>
          </div>

          {/* Expiry date */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Expires{" "}
              <span className="font-normal text-muted-foreground/60">(optional)</span>
            </label>
            <input
              type="date"
              value={form.expires_at}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => set("expires_at", e.target.value)}
              className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Special Instructions{" "}
              <span className="font-normal text-muted-foreground/60">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="e.g. Take with food. Avoid grapefruit."
              className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              style={{ background: "#4D9A7F", color: "white" }}
              onClick={handleSubmit}
              disabled={isPending || !patient || !form.medication || !form.dose || !form.frequency}
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Issue Prescription
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<DoctorPrescription[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [hasMore,       setHasMore]       = useState(false);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [fetchError,    setFetchError]    = useState<string | null>(null);
  const [filter,        setFilter]        = useState<FilterOption>("All");
  const [search,        setSearch]        = useState("");
  const [showModal,     setShowModal]     = useState(false);
  const [isPending,     startTransition]  = useTransition();

  // ── Load first page ──
  const load = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    setCurrentPage(0);
    getDoctorPrescriptionsAction(0)
      .then(({ data, hasMore: more }) => {
        setPrescriptions(data);
        setHasMore(more);
      })
      .catch(() => setFetchError("Failed to load prescriptions. Please retry."))
      .finally(() => setLoading(false));
  }, []);

  // ── Load next page ──
  function loadMore() {
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    getDoctorPrescriptionsAction(nextPage)
      .then(({ data, hasMore: more }) => {
        setPrescriptions((prev) => [...prev, ...data]);
        setHasMore(more);
        setCurrentPage(nextPage);
      })
      .catch(() => setFetchError("Failed to load more. Please retry."))
      .finally(() => setLoadingMore(false));
  }

  useEffect(() => { load(); }, [load]);

  // ── Derived counts ──
  const activeCount    = prescriptions.filter((p) => p.status === "active").length;
  const refillDueCount = prescriptions.filter((p) => p.status === "refill-due").length;
  const completedCount = prescriptions.filter(
    (p) => p.status === "completed" || p.status === "discontinued"
  ).length;

  // ── Client-side filter ──
  const filtered = prescriptions.filter((p) => {
    const matchFilter =
      filter === "All"        ? true :
      filter === "Active"     ? p.status === "active" :
      filter === "Refill Due" ? p.status === "refill-due" :
      (p.status === "completed" || p.status === "discontinued");

    if (!search.trim()) return matchFilter;
    const q = search.toLowerCase();
    return matchFilter && (
      (p.patient?.full_name ?? "").toLowerCase().includes(q) ||
      p.medication.toLowerCase().includes(q) ||
      (p.condition ?? "").toLowerCase().includes(q)
    );
  });

  // ── Inline actions ──
  function handleMarkRefill(id: string) {
    // Optimistic: increment refills_used, possibly set status to refill-due
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newUsed = p.refills_used + 1;
        const newStatus: RxStatus = newUsed >= p.refills_total ? "refill-due" : p.status;
        return { ...p, refills_used: newUsed, status: newStatus };
      })
    );
    startTransition(async () => {
      const { error } = await markRefillUsedAction(id);
      if (error) load(); // revert on failure
    });
  }

  function handleSetStatus(id: string, status: DoctorPrescription["status"]) {
    // Optimistic
    setPrescriptions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    startTransition(async () => {
      const { error } = await updatePrescriptionStatusAction(id, status);
      if (error) load(); // revert on failure
    });
  }

  return (
    <>
      {showModal && (
        <NewRxModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            load();
          }}
        />
      )}

      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Prescriptions
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage active and historical prescriptions
            </p>
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

        {/* ── Summary strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active",     value: loading ? "—" : String(activeCount),    cls: "text-vault-positive" },
            { label: "Refill Due", value: loading ? "—" : String(refillDueCount), cls: "text-vault-warning"  },
            { label: "Completed",  value: loading ? "—" : String(completedCount), cls: "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3.5">
              <p className={`text-2xl font-semibold ${s.cls}`} style={{ fontFamily: "var(--font-playfair)" }}>
                {s.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Refill-due alert ── */}
        {!loading && refillDueCount > 0 && (
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

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
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

        {/* ── Error ── */}
        {fetchError && !loading && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            {fetchError}
            <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={load}>
              Retry
            </Button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="hidden grid-cols-[1fr_130px_110px_90px_80px_110px_100px] gap-3 border-b border-border/60 px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:grid">
            <span>Patient · Medication</span>
            <span>Dose &amp; Frequency</span>
            <span>Prescribed</span>
            <span>Expires</span>
            <span>Refills</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Pill className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? `No prescriptions matching "${search}".` : "No prescriptions found."}
              </p>
              {!search && filter === "All" && (
                <Button
                  size="sm"
                  className="mt-4 gap-1.5"
                  style={{ background: "#4D9A7F", color: "white" }}
                  onClick={() => setShowModal(true)}
                >
                  <Plus className="size-3.5" />
                  Issue first prescription
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((rx) => {
                const meta      = STATUS_META[rx.status];
                const patName   = rx.patient?.full_name ?? "Unknown Patient";
                const refLeft   = rx.refills_total - rx.refills_used;
                const isActive  = rx.status === "active";
                const canRefill = isActive && rx.refills_total > 0 && refLeft > 0;

                return (
                  <div
                    key={rx.id}
                    className={`flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[1fr_130px_110px_90px_80px_110px_100px] sm:items-center sm:gap-3 ${
                      rx.status === "refill-due" ? "bg-vault-warning-light/20" : ""
                    }`}
                  >
                    {/* Patient + medication */}
                    <div className="flex items-center gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
                        rx.status === "completed" || rx.status === "discontinued"
                          ? "bg-muted/50 text-muted-foreground"
                          : "border border-border bg-card text-foreground"
                      }`}>
                        {initials(patName)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{patName}</p>
                        <p className="text-xs font-semibold text-[#4D9A7F]">{rx.medication}</p>
                        {rx.condition && (
                          <p className="text-[10px] text-muted-foreground">{rx.condition}</p>
                        )}
                      </div>
                    </div>

                    {/* Dose & frequency */}
                    <div>
                      <p className="text-xs font-medium text-foreground">{rx.dose}</p>
                      <p className="text-[11px] text-muted-foreground">{rx.frequency}</p>
                    </div>

                    {/* Prescribed */}
                    <p className="text-xs text-muted-foreground">{fmtDate(rx.prescribed_at)}</p>

                    {/* Expires */}
                    <p className={`text-xs font-medium ${rx.status === "refill-due" ? "text-vault-warning" : "text-muted-foreground"}`}>
                      {rx.expires_at ? fmtDate(rx.expires_at) : "—"}
                    </p>

                    {/* Refills left */}
                    <p className="text-xs text-muted-foreground">
                      {refLeft}
                      <span className="text-muted-foreground/50"> / {rx.refills_total}</span>
                    </p>

                    {/* Status badge */}
                    <span className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${meta.cls}`}>
                      {meta.icon}
                      {meta.label}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {canRefill && (
                        <button
                          title="Mark refill dispensed"
                          disabled={isPending}
                          onClick={() => handleMarkRefill(rx.id)}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[10px] font-semibold text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
                        >
                          <RefreshCcw className="size-2.5" />
                          Refill
                        </button>
                      )}
                      {isActive && (
                        <button
                          title="Mark as completed"
                          disabled={isPending}
                          onClick={() => handleSetStatus(rx.id, "completed")}
                          className="flex items-center gap-1 rounded-lg bg-vault-positive-light px-2.5 py-1.5 text-[10px] font-semibold text-vault-positive transition-colors hover:bg-vault-positive/20 disabled:opacity-50"
                        >
                          <CheckCircle2 className="size-2.5" />
                          Complete
                        </button>
                      )}
                      {isActive && (
                        <button
                          title="Discontinue"
                          disabled={isPending}
                          onClick={() => handleSetStatus(rx.id, "discontinued")}
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-vault-negative-light hover:text-vault-negative disabled:opacity-50"
                        >
                          <Ban className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && (
          <div className="flex flex-col items-center gap-3">
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            )}
            <p className="text-xs text-muted-foreground">
              {filtered.length} of {prescriptions.length} prescriptions loaded
              {hasMore ? " · more available" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-4"
          style={{ opacity: 1 - i * 0.18 }}
        >
          <div className="size-9 shrink-0 rounded-xl bg-muted/40 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-32 rounded bg-muted/40 animate-pulse" />
            <div className="h-3 w-24 rounded bg-muted/30 animate-pulse" />
          </div>
          <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
          <div className="h-3 w-16 rounded bg-muted/30 animate-pulse" />
          <div className="h-3 w-8 rounded  bg-muted/30 animate-pulse" />
          <div className="h-5 w-20 rounded-full bg-muted/30 animate-pulse" />
          <div className="h-6 w-24 rounded-lg bg-muted/20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
