"use client";

import {
  useState,
  useMemo,
  useEffect,
  useTransition,
  useRef,
  useCallback,
} from "react";
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
  Trash2,
  Loader2,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  getPatientPrescriptionsAction,
  getPatientDocumentsAction,
  saveDocumentAction,
  deleteDocumentAction,
  type PatientPrescription,
  type PatientRxStatus,
  type PatientDocument,
  type DocumentType,
} from "./actions";
import { DOC_TYPE_LABELS } from "./constants";

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

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isActive(status: PatientRxStatus) {
  return status === "active" || status === "refill-due";
}

// Sanitize filename for storage path
function storagePath(userId: string, fileName: string): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${userId}/${Date.now()}-${safe}`;
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

function DocSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 animate-pulse"
        >
          <div className="size-10 shrink-0 rounded-xl bg-muted/50" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 rounded bg-muted/50" />
            <div className="h-3 w-1/2 rounded bg-muted/30" />
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
  const [tab,        setTab]       = useState<Tab>("prescriptions");
  const [search,     setSearch]    = useState("");
  const [rxList,     setRxList]    = useState<PatientPrescription[]>([]);
  const [docList,    setDocList]   = useState<PatientDocument[]>([]);
  const [rxLoading,  setRxLoading] = useState(true);
  const [docLoading, setDocLoading]= useState(true);
  const [rxError,    setRxError]   = useState<string | null>(null);
  const [docError,   setDocError]  = useState<string | null>(null);
  const [uploading,  setUploading] = useState(false);
  const [uploadErr,  setUploadErr] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const loadRx = useCallback(() => {
    setRxLoading(true);
    setRxError(null);
    getPatientPrescriptionsAction()
      .then(setRxList)
      .catch(() => setRxError("Could not load prescriptions. Please try again."))
      .finally(() => setRxLoading(false));
  }, []);

  const loadDocs = useCallback(() => {
    setDocLoading(true);
    setDocError(null);
    getPatientDocumentsAction()
      .then(setDocList)
      .catch(() => setDocError("Could not load documents. Please try again."))
      .finally(() => setDocLoading(false));
  }, []);

  useEffect(() => { loadRx(); },   [loadRx]);
  useEffect(() => { loadDocs(); }, [loadDocs]);

  // ── Derived ──
  const activePrescriptions = useMemo(
    () => rxList.filter((r) => isActive(r.status)),
    [rxList]
  );

  const filteredRx = useMemo(
    () =>
      rxList.filter(
        (r) =>
          r.medication.toLowerCase().includes(search.toLowerCase()) ||
          (r.condition ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (r.doctor?.full_name ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [rxList, search]
  );

  const filteredDocs = useMemo(
    () =>
      docList.filter(
        (d) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (DOC_TYPE_LABELS[d.type] ?? "").toLowerCase().includes(search.toLowerCase())
      ),
    [docList, search]
  );

  // ── File Upload ──
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const maxBytes = 20 * 1024 * 1024;
    if (file.size > maxBytes) {
      setUploadErr("File exceeds the 20 MB limit.");
      return;
    }
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setUploadErr("Only PDF, JPG, PNG, and WEBP files are supported.");
      return;
    }

    setUploading(true);
    setUploadErr(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      const path = storagePath(user.id, file.name);
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file);

      if (uploadError) throw new Error(uploadError.message);

      // Determine type from file name heuristic
      const lc = file.name.toLowerCase();
      const type: DocumentType =
        lc.includes("lab") || lc.includes("result") || lc.includes("blood")
          ? "lab-report"
          : lc.includes("prescription") || lc.includes("rx")
          ? "prescription-record"
          : lc.includes("summary") || lc.includes("checkup") || lc.includes("physical")
          ? "checkup-summary"
          : lc.includes("note") || lc.includes("consult")
          ? "consultation-note"
          : "other";

      const { error: saveError } = await saveDocumentAction({
        name:            file.name,
        type,
        file_path:       path,
        file_size_bytes: file.size,
      });

      if (saveError) throw new Error(saveError);
      loadDocs();
    } catch (err: any) {
      setUploadErr(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      // Optimistic remove
      setDocList((prev) => prev.filter((d) => d.id !== id));
      const { error } = await deleteDocumentAction(id);
      if (error) loadDocs(); // revert
    });
  }

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
              {rxLoading ? "—" : activePrescriptions.length}
            </strong>{" "}
            active prescriptions
          </span>
          <span className="text-border">·</span>
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" />
            <strong className="font-semibold text-foreground">
              {docLoading ? "—" : docList.length}
            </strong>{" "}
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
          {rxLoading && <RxSkeleton />}

          {!rxLoading && rxError && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="size-4 shrink-0 text-vault-negative" />
                {rxError}
              </div>
              <Button size="sm" variant="outline" onClick={loadRx} className="h-8 gap-1.5 text-xs">
                <RefreshCw className="size-3" />
                Retry
              </Button>
            </div>
          )}

          {!rxLoading && !rxError && filteredRx.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {search ? "No prescriptions match your search." : "No prescriptions on file."}
              </p>
            </div>
          )}

          {!rxLoading && !rxError && (
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
          <div
            className="flex items-center justify-center rounded-2xl border border-dashed border-primary/30 bg-primary/5 py-8 cursor-pointer transition-colors hover:bg-primary/10"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-primary/10">
                {uploading
                  ? <Loader2 className="size-5 text-primary animate-spin" />
                  : <Upload className="size-5 text-primary" />
                }
              </div>
              <p className="text-sm font-medium text-foreground">
                {uploading ? "Uploading…" : "Drop files here or click to browse"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                PDF, JPG, PNG, WEBP · up to 20 MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {uploadErr && (
            <div className="flex items-center gap-2.5 rounded-xl border border-vault-negative/20 bg-vault-negative-light px-4 py-2.5 text-[12px] text-vault-negative">
              <AlertCircle className="size-4 shrink-0" />
              {uploadErr}
            </div>
          )}

          {docLoading && <DocSkeleton />}

          {!docLoading && docError && (
            <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-6 py-5">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <AlertCircle className="size-4 shrink-0 text-vault-negative" />
                {docError}
              </div>
              <Button size="sm" variant="outline" onClick={loadDocs} className="h-8 gap-1.5 text-xs">
                <RefreshCw className="size-3" />
                Retry
              </Button>
            </div>
          )}

          {!docLoading && !docError && filteredDocs.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center">
              <File className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search
                  ? "No documents match your search."
                  : "No documents on file. Upload lab results or reports above."}
              </p>
            </div>
          )}

          {!docLoading && !docError && filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={() => handleDelete(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PrescriptionCard ────────────────────────────────────────────

function PrescriptionCard({ rx }: { rx: PatientPrescription }) {
  const meta        = STATUS_META[rx.status];
  const active      = isActive(rx.status);
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
              <span>&middot; {rx.doctor.full_name}</span>
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

        {/* Refill CTA */}
        {active && refillsLeft > 0 && (
          <Button size="sm" variant="outline" className="h-8 shrink-0 gap-1.5 text-xs">
            Request Refill
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── DocumentCard ────────────────────────────────────────────────

function DocumentCard({
  doc,
  onDelete,
}: {
  doc: PatientDocument;
  onDelete: () => void;
}) {
  const [loadingUrl, setLoadingUrl] = useState(false);
  const supabase = createClient();

  const typeLabel = DOC_TYPE_LABELS[doc.type] ?? "Document";

  async function openSignedUrl(download = false) {
    setLoadingUrl(true);
    try {
      const { data } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 3600);

      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        if (download) a.download = doc.name;
        else a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
      }
    } finally {
      setLoadingUrl(false);
    }
  }

  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {typeLabel} &middot; {formatDateTime(doc.created_at)}
          {doc.file_size_bytes ? ` · ${fmtFileSize(doc.file_size_bytes)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 text-xs"
          disabled={loadingUrl}
          onClick={() => openSignedUrl(false)}
        >
          {loadingUrl ? <Loader2 className="size-3 animate-spin" /> : <Eye className="size-3" />}
          View
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          disabled={loadingUrl}
          onClick={() => openSignedUrl(true)}
        >
          <Download className="size-3" />
          Download
        </Button>
        <button
          onClick={onDelete}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground/30 opacity-0 transition-all hover:bg-vault-negative-light hover:text-vault-negative group-hover:opacity-100"
          title="Delete document"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
