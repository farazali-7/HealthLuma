"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Users,
  Globe,
  Clock,
  CheckCircle2,
  Edit2,
  Trash2,
  Send,
  Crown,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getAnnouncementsAction,
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  type Announcement,
  type AnnouncementStatus,
  type AudienceType,
} from "./actions";

// ─── Constants ─────────────────────────────────────────────────

const AUDIENCE_META: Record<AudienceType, { label: string; icon: React.ReactNode; bigIcon: React.ReactNode; cls: string; dot: string }> = {
  all: { label: "All Patients", icon: <Globe className="size-3" />,  bigIcon: <Globe className="size-4" />,  cls: "bg-primary/10 text-primary",        dot: "bg-primary"    },
  pro: { label: "Pro Members",  icon: <Crown className="size-3" />,  bigIcon: <Crown className="size-4" />,  cls: "bg-[#C4975A]/15 text-[#C4975A]",   dot: "bg-[#C4975A]"  },
};

const STATUS_META: Record<AnnouncementStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  published: { label: "Published", icon: <CheckCircle2 className="size-3" />, cls: "bg-vault-positive-light text-vault-positive" },
  draft:     { label: "Draft",     icon: <Edit2 className="size-3" />,        cls: "bg-muted/60 text-muted-foreground"           },
  scheduled: { label: "Scheduled", icon: <Clock className="size-3" />,        cls: "bg-vault-warning-light text-vault-warning"   },
};

type FilterOption = "All" | "Published" | "Scheduled" | "Draft";

// ─── Skeleton ──────────────────────────────────────────────────

function AnnouncementSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm animate-pulse">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 size-10 shrink-0 rounded-xl bg-muted/50" />
            <div className="flex-1 space-y-2.5">
              <div className="h-3.5 w-48 rounded-full bg-muted/50" />
              <div className="h-3 w-full rounded-full bg-muted/40" />
              <div className="h-3 w-3/4 rounded-full bg-muted/40" />
              <div className="h-2.5 w-24 rounded-full bg-muted/30" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Compose Modal ─────────────────────────────────────────────

function ComposeModal({
  onClose,
  editAnnouncement,
  onSaved,
}: {
  onClose: () => void;
  editAnnouncement: Announcement | null;
  onSaved: () => void;
}) {
  const [title,         setTitle]         = useState(editAnnouncement?.title     ?? "");
  const [body,          setBody]          = useState(editAnnouncement?.body      ?? "");
  const [audience,      setAudience]      = useState<AudienceType>(editAnnouncement?.audience ?? "all");
  const [status,        setStatus]        = useState<AnnouncementStatus>(editAnnouncement?.status ?? "published");
  const [scheduledDate, setScheduledDate] = useState(editAnnouncement?.scheduled_at ?? "");
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState<string | null>(null);

  async function handleSubmit(submitStatus: AnnouncementStatus) {
    setFormError(null);
    setSaving(true);

    const input = {
      title,
      body,
      audience,
      status: submitStatus,
      scheduled_at: submitStatus === "scheduled" ? scheduledDate || null : null,
    };

    let result: { error: string | null };

    if (editAnnouncement) {
      result = await updateAnnouncementAction(editAnnouncement.id, input);
    } else {
      result = await createAnnouncementAction(input);
    }

    setSaving(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    onSaved();
    onClose();
  }

  function handleScheduleClick() {
    if (status !== "scheduled") {
      setStatus("scheduled");
    } else {
      handleSubmit("scheduled");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[#4D9A7F]">
              <Megaphone className="size-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">
              {editAnnouncement ? "Edit Announcement" : "New Announcement"}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title"
              disabled={saving}
              className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement here…"
              disabled={saving}
              className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all disabled:opacity-60"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Audience</label>
            <div className="flex gap-2">
              {(["all", "pro"] as AudienceType[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  disabled={saving}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50 ${
                    audience === a
                      ? "border-[#4D9A7F]/40 bg-[#4D9A7F]/10 text-[#4D9A7F]"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  {AUDIENCE_META[a].icon}
                  {AUDIENCE_META[a].label}
                </button>
              ))}
            </div>
          </div>

          {status === "scheduled" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Schedule for</label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all disabled:opacity-60"
              />
            </div>
          )}

          {formError && (
            <p className="rounded-xl border border-vault-negative/20 bg-vault-negative-light px-4 py-2.5 text-xs text-vault-negative">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={saving}
              onClick={() => handleSubmit("draft")}
            >
              {saving && status === "draft" ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Save Draft
            </Button>
            <Button
              variant="outline"
              className="gap-1.5"
              disabled={saving}
              onClick={handleScheduleClick}
            >
              {saving && status === "scheduled" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Clock className="size-3.5" />
              )}
              Schedule
            </Button>
            <Button
              className="ml-auto gap-2"
              style={{ background: "#4D9A7F", color: "white" }}
              disabled={saving}
              onClick={() => handleSubmit("published")}
            >
              {saving && status === "published" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Publish Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

export default function AnnouncementsPage() {
  const [announcements,    setAnnouncements]    = useState<Announcement[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState<string | null>(null);
  const [filter,           setFilter]           = useState<FilterOption>("All");
  const [showModal,        setShowModal]        = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getAnnouncementsAction();
    if (result.error) {
      setError(result.error);
    } else {
      setAnnouncements(result.announcements);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = announcements.filter((a) =>
    filter === "All"       ? true :
    filter === "Published" ? a.status === "published" :
    filter === "Scheduled" ? a.status === "scheduled" :
    a.status === "draft"
  );

  const published  = announcements.filter((a) => a.status === "published");
  const scheduled  = announcements.filter((a) => a.status === "scheduled");
  const drafts     = announcements.filter((a) => a.status === "draft");
  const totalReads = published.reduce((sum, a) => sum + (a.reads_count ?? 0), 0);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this announcement?")) return;
    const result = await deleteAnnouncementAction(id);
    if (!result.error) {
      refresh();
    }
  }

  function openEdit(ann: Announcement) {
    setEditAnnouncement(ann);
    setShowModal(true);
  }

  function openNew() {
    setEditAnnouncement(null);
    setShowModal(true);
  }

  function formatDate(isoString: string) {
    return new Date(isoString).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });
  }

  return (
    <>
      {showModal && (
        <ComposeModal
          onClose={() => { setShowModal(false); setEditAnnouncement(null); }}
          editAnnouncement={editAnnouncement}
          onSaved={refresh}
        />
      )}

      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Announcements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {published.length} published &middot; {totalReads} total reads
            </p>
          </div>
          <Button
            className="gap-2 self-start sm:self-auto"
            style={{ background: "#4D9A7F", color: "white" }}
            onClick={openNew}
          >
            <Plus className="size-4" />
            New Announcement
          </Button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Published",   value: published.length,  cls: "text-vault-positive", dot: "bg-vault-positive"     },
            { label: "Total Reads", value: totalReads,        cls: "text-[#4D9A7F]",       dot: "bg-[#4D9A7F]"         },
            { label: "Scheduled",   value: scheduled.length,  cls: "text-vault-warning",   dot: "bg-vault-warning"     },
            { label: "Drafts",      value: drafts.length,     cls: "text-muted-foreground", dot: "bg-muted-foreground" },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`size-1.5 rounded-full ${stat.dot}`} />
                <p className="text-[10px] font-medium text-muted-foreground">{stat.label}</p>
              </div>
              <p
                className={`text-xl font-semibold tabular-nums ${stat.cls}`}
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {loading ? <span className="inline-block h-5 w-6 animate-pulse rounded bg-muted/50" /> : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1 w-fit">
          {(["All", "Published", "Scheduled", "Draft"] as FilterOption[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                filter === f ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Body */}
        {loading ? (
          <AnnouncementSkeleton />
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card py-16 text-center">
            <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refresh}>Retry</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card py-16 text-center">
                <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No announcements in this category.</p>
              </div>
            ) : (
              filtered.map((ann) => {
                const audienceMeta = AUDIENCE_META[ann.audience] ?? AUDIENCE_META["all"];
                const statusMeta   = STATUS_META[ann.status];
                const displayDate  = ann.status === "scheduled" && ann.scheduled_at
                  ? formatDate(ann.scheduled_at)
                  : formatDate(ann.created_at);
                return (
                  <div
                    key={ann.id}
                    className={`rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md ${
                      ann.status === "draft"     ? "border-border/50 opacity-80" :
                      ann.status === "scheduled" ? "border-vault-warning/20"     : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">

                        {/* Icon */}
                        <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${audienceMeta.cls}`}>
                          {audienceMeta.bigIcon}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.cls}`}>
                              {statusMeta.icon}
                              {statusMeta.label}
                            </span>
                            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${audienceMeta.cls}`}>
                              {audienceMeta.icon}
                              {audienceMeta.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ann.body}</p>
                          <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span>
                              {ann.status === "scheduled" ? `Scheduled: ${displayDate}` : displayDate}
                            </span>
                            {ann.status === "published" && (
                              <>
                                <span>&middot;</span>
                                <span className="flex items-center gap-1">
                                  <Eye className="size-3" />
                                  {ann.reads_count} reads
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() => openEdit(ann)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-vault-negative-light hover:text-vault-negative"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
