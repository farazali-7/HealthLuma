"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type AudienceType       = "all" | "pro" | "specific";
type AnnouncementStatus = "published" | "draft" | "scheduled";

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AudienceType;
  status: AnnouncementStatus;
  date: string;
  reads?: number;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Clinic Hours — Easter Week",
    body: "Please note that the clinic will be operating reduced hours from April 18–21. Urgent appointments remain available via the same-day booking system.",
    audience: "all",
    status: "published",
    date: "Mar 9, 2026",
    reads: 142,
  },
  {
    id: "2",
    title: "Online Booking Now Live",
    body: "You can now book, reschedule, and cancel appointments directly from the patient portal — no phone call needed. Same-day slots are released each morning at 8 AM.",
    audience: "all",
    status: "published",
    date: "Mar 1, 2026",
    reads: 218,
  },
  {
    id: "3",
    title: "Family Care Members — Priority Slots Extended",
    body: "Pro members now have access to extended priority booking — up to 72 hours in advance. This applies to all family members on your account.",
    audience: "pro",
    status: "published",
    date: "Feb 20, 2026",
    reads: 64,
  },
  {
    id: "4",
    title: "Flu Season Reminder",
    body: "Annual flu vaccines are now available. Book a 15-minute nurse appointment from the patient portal. No doctor consultation required.",
    audience: "all",
    status: "scheduled",
    date: "Mar 15, 2026",
  },
  {
    id: "5",
    title: "Summer Clinic Schedule Draft",
    body: "Draft note — planning reduced summer hours from July 1 to August 31. Subject to confirmation.",
    audience: "all",
    status: "draft",
    date: "Mar 10, 2026",
  },
];

const AUDIENCE_META: Record<AudienceType, { label: string; icon: React.ReactNode; bigIcon: React.ReactNode; cls: string; dot: string }> = {
  all:      { label: "All Patients", icon: <Globe className="size-3" />,  bigIcon: <Globe className="size-4" />,  cls: "bg-primary/10 text-primary",         dot: "bg-primary"    },
  pro:      { label: "Pro Members",  icon: <Crown className="size-3" />,  bigIcon: <Crown className="size-4" />,  cls: "bg-[#C4975A]/15 text-[#C4975A]",    dot: "bg-[#C4975A]"  },
  specific: { label: "Specific",     icon: <Users className="size-3" />,  bigIcon: <Users className="size-4" />,  cls: "bg-muted/60 text-muted-foreground",  dot: "bg-muted-foreground" },
};

const STATUS_META: Record<AnnouncementStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  published: { label: "Published",  icon: <CheckCircle2 className="size-3" />, cls: "bg-vault-positive-light text-vault-positive" },
  draft:     { label: "Draft",      icon: <Edit2 className="size-3" />,        cls: "bg-muted/60 text-muted-foreground"           },
  scheduled: { label: "Scheduled",  icon: <Clock className="size-3" />,        cls: "bg-vault-warning-light text-vault-warning"   },
};

// ─── Compose Modal ─────────────────────────────────────────────

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [audience, setAudience] = useState<AudienceType>("all");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-[#4D9A7F]/10 text-[#4D9A7F]">
              <Megaphone className="size-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-foreground">New Announcement</h2>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              placeholder="Announcement title"
              className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea
              rows={5}
              placeholder="Write your announcement here…"
              className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Audience</label>
            <div className="flex gap-2">
              {(["all", "pro"] as AudienceType[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAudience(a)}
                  className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
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
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="gap-1.5" onClick={onClose}>
              Save Draft
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={onClose}>
              <Clock className="size-3.5" />
              Schedule
            </Button>
            <Button
              className="ml-auto gap-2"
              style={{ background: "#4D9A7F", color: "white" }}
              onClick={onClose}
            >
              <Send className="size-3.5" />
              Publish Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────

type FilterOption = "All" | "Published" | "Scheduled" | "Draft";

export default function AnnouncementsPage() {
  const [filter,    setFilter]    = useState<FilterOption>("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = ANNOUNCEMENTS.filter((a) =>
    filter === "All"       ? true :
    filter === "Published" ? a.status === "published" :
    filter === "Scheduled" ? a.status === "scheduled" :
    a.status === "draft"
  );

  const published   = ANNOUNCEMENTS.filter((a) => a.status === "published");
  const scheduled   = ANNOUNCEMENTS.filter((a) => a.status === "scheduled");
  const drafts      = ANNOUNCEMENTS.filter((a) => a.status === "draft");
  const totalReads  = published.reduce((sum, a) => sum + (a.reads ?? 0), 0);

  return (
    <>
      {showModal && <ComposeModal onClose={() => setShowModal(false)} />}

      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
              Announcements
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {published.length} published &middot; {totalReads} total reads
            </p>
          </div>
          <Button
            className="gap-2 self-start sm:self-auto"
            style={{ background: "#4D9A7F", color: "white" }}
            onClick={() => setShowModal(true)}
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
              <p className={`text-xl font-semibold tabular-nums ${stat.cls}`} style={{ fontFamily: "var(--font-playfair)" }}>
                {stat.value}
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

        {/* Announcement cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card py-16 text-center">
              <Megaphone className="mx-auto mb-3 size-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No announcements in this category.</p>
            </div>
          ) : (
            filtered.map((ann) => {
              const audience   = AUDIENCE_META[ann.audience];
              const statusMeta = STATUS_META[ann.status];
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
                      <div className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${audience.cls}`}>
                        {audience.bigIcon}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="text-sm font-semibold text-foreground">{ann.title}</h3>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusMeta.cls}`}>
                            {statusMeta.icon}
                            {statusMeta.label}
                          </span>
                          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${audience.cls}`}>
                            {audience.icon}
                            {audience.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{ann.body}</p>
                        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                          <span>
                            {ann.status === "scheduled" ? `Scheduled: ${ann.date}` : ann.date}
                          </span>
                          {ann.reads !== undefined && (
                            <>
                              <span>&middot;</span>
                              <span className="flex items-center gap-1">
                                <Eye className="size-3" />
                                {ann.reads} reads
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 gap-1">
                      <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground">
                        <Edit2 className="size-3.5" />
                      </button>
                      <button className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-vault-negative-light hover:text-vault-negative">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
