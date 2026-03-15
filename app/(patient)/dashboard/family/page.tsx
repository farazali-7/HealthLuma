"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Users,
  Plus,
  Crown,
  Calendar,
  ChevronRight,
  User,
  Baby,
  Heart,
  UserCheck,
  X,
  Loader2,
  Trash2,
  AlertCircle,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getFamilyPageDataAction,
  addFamilyMemberAction,
  removeFamilyMemberAction,
  type FamilyPageData,
  type FamilyMemberRow,
  type FamilyRelation,
  type AddMemberInput,
} from "./actions";

// ─── Constants ──────────────────────────────────────────────────

const MAX_MEMBERS = 9;

type RelationOption = { value: FamilyRelation; label: string };
const RELATION_OPTIONS: RelationOption[] = [
  { value: "spouse",  label: "Spouse"  },
  { value: "child",   label: "Child"   },
  { value: "parent",  label: "Parent"  },
  { value: "sibling", label: "Sibling" },
  { value: "other",   label: "Other"   },
];

const RELATION_CONFIG: Record<
  FamilyRelation | "self",
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  self:    { label: "Primary", color: "text-primary",               bg: "bg-primary/10",           icon: <User className="size-4" />     },
  spouse:  { label: "Spouse",  color: "text-primary",               bg: "bg-primary/10",           icon: <Heart className="size-4" />    },
  child:   { label: "Child",   color: "text-vault-positive",        bg: "bg-vault-positive-light", icon: <Baby className="size-4" />     },
  parent:  { label: "Parent",  color: "text-muted-foreground",      bg: "bg-muted/50",             icon: <User className="size-4" />     },
  sibling: { label: "Sibling", color: "text-[#4D9A7F]",            bg: "bg-[#4D9A7F]/10",         icon: <UserCheck className="size-4" />},
  other:   { label: "Other",   color: "text-muted-foreground",      bg: "bg-muted/50",             icon: <Users className="size-4" />    },
};

// ─── Helpers ────────────────────────────────────────────────────

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

// ─── Page ────────────────────────────────────────────────────────

export default function FamilyPage() {
  const [data,         setData]         = useState<FamilyPageData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [addOpen,      setAddOpen]      = useState(false);
  const [removeId,     setRemoveId]     = useState<string | null>(null);
  const [isPending,    startTransition] = useTransition();

  const load = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    getFamilyPageDataAction()
      .then((d) => {
        if (!d) setFetchError("Failed to load data.");
        else setData(d);
      })
      .catch(() => setFetchError("Failed to load data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleRemove(id: string) {
    setRemoveId(id);
    // Optimistic update
    setData((prev) =>
      prev ? { ...prev, members: prev.members.filter((m) => m.id !== id) } : prev
    );
    startTransition(async () => {
      const { error } = await removeFamilyMemberAction(id);
      if (error) {
        setRemoveId(null);
        load(); // revert from server
      } else {
        setRemoveId(null);
      }
    });
  }

  if (loading) return <PageSkeleton />;

  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <AlertCircle className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{fetchError ?? "Something went wrong."}</p>
        <Button size="sm" variant="outline" onClick={load}>Retry</Button>
      </div>
    );
  }

  const { isPro, subscription, primaryUser, members } = data;
  const slotsUsed      = members.length;
  const slotsRemaining = Math.max(0, MAX_MEMBERS - slotsUsed);
  // Show up to 3 empty slot placeholders (don't overwhelm the grid)
  const emptySlots     = Math.min(slotsRemaining, isPro ? 3 : 2);

  return (
    <>
      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Family
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage healthcare for everyone in your household
            </p>
          </div>
          {isPro && slotsRemaining > 0 && (
            <Button
              className="gap-2 self-start sm:self-auto"
              style={{ background: "var(--primary)" }}
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add Member
            </Button>
          )}
        </div>

        {/* ── Pro Upgrade Gate ── */}
        {!isPro && (
          <div
            className="relative overflow-hidden rounded-2xl border p-8"
            style={{ background: "#0D1612", borderColor: "rgba(196,151,90,0.22)" }}
          >
            <div
              className="pointer-events-none absolute right-0 top-0 size-64 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(196,151,90,0.08) 0%, transparent 70%)",
              }}
            />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(196,151,90,0.15)" }}
              >
                <Crown className="size-7" style={{ color: "#C4975A" }} />
              </div>
              <div className="flex-1 space-y-1">
                <h2
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-playfair)", color: "#EDE8E0" }}
                >
                  Family management is a Pro feature
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#7D8A85" }}>
                  Upgrade to Family Care ($150/year) to add up to 9 family members — spouse, up to 6 children, and 2 parents — all under one account.
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    "20% off every visit for the whole family",
                    "Priority & same-day urgent booking",
                    "Centralised family health records",
                    "Book for any member from one account",
                  ].map((perk) => (
                    <li
                      key={perk}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#7D8A85" }}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{ background: "#C4975A" }}
                      />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="shrink-0">
                <a
                  href="/dashboard/billing"
                  className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{ background: "#C4975A", color: "#0D1612" }}
                >
                  Upgrade — $150/yr
                  <ChevronRight className="size-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {/* Primary user card */}
          <PrimaryCard
            user={primaryUser}
            isPro={isPro}
          />

          {/* Family member cards */}
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isPro={isPro}
              removing={removeId === member.id && isPending}
              onRemove={() => handleRemove(member.id)}
            />
          ))}

          {/* Empty slot placeholders */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <EmptySlot
              key={`empty-${i}`}
              isPro={isPro}
              onClick={() => isPro ? setAddOpen(true) : (window.location.href = "/dashboard/billing")}
            />
          ))}
        </div>

        {/* ── Slot usage bar (Pro only) ── */}
        {isPro && (
          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
            <Users className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{slotsUsed} of {MAX_MEMBERS} members added</span>
                <span>{slotsRemaining} slots remaining</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(slotsUsed / MAX_MEMBERS) * 100}%`,
                    background: "#C4975A",
                  }}
                />
              </div>
            </div>
            {subscription?.renews_at && (
              <span className="text-[11px] text-muted-foreground/60 shrink-0">
                Renews {fmtDate(subscription.renews_at.split("T")[0])}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Add Member Modal ── */}
      {addOpen && (
        <AddMemberModal
          onClose={() => setAddOpen(false)}
          onAdded={() => { setAddOpen(false); load(); }}
        />
      )}
    </>
  );
}

// ─── Primary User Card ────────────────────────────────────────────

function PrimaryCard({
  user,
  isPro,
}: {
  user: FamilyPageData["primaryUser"];
  isPro: boolean;
}) {
  const cfg = RELATION_CONFIG["self"];
  const age = calcAge(user.date_of_birth);

  return (
    <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-sm">
      {/* Avatar + name */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${cfg.bg}`}>
          <span className={cfg.color}>{cfg.icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {user.full_name ?? "You"}{" "}
            <span className="text-muted-foreground font-normal">(Primary)</span>
          </h3>
          <span className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
          {isPro && (
            <span
              className="ml-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
              style={{ background: "rgba(196,151,90,0.12)", color: "#C4975A" }}
            >
              <Crown className="size-2.5" />
              Pro
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Age</p>
          <p className="text-sm font-semibold text-foreground">
            {age !== null ? `${age} yrs` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Active Rx</p>
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
            <Pill className="size-3 text-muted-foreground" />
            {user.active_rx_count}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Last visit</p>
          <p className="text-sm font-semibold text-foreground">{fmtDate(user.last_visit)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Next appt</p>
          <p className={`text-sm font-semibold ${user.next_appt ? "text-primary" : "text-foreground"}`}>
            {fmtDate(user.next_appt)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" asChild>
          <a href="/dashboard/appointments">
            <Calendar className="size-3" />
            Book appt
          </a>
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground" asChild>
          <a href="/dashboard/records">
            Records
            <ChevronRight className="size-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Family Member Card ───────────────────────────────────────────

function MemberCard({
  member,
  isPro,
  removing,
  onRemove,
}: {
  member: FamilyMemberRow;
  isPro: boolean;
  removing: boolean;
  onRemove: () => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const cfg = RELATION_CONFIG[member.relation] ?? RELATION_CONFIG.other;
  const age = calcAge(member.date_of_birth);

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* Remove button */}
      {isPro && !confirmRemove && (
        <button
          onClick={() => setConfirmRemove(true)}
          className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-lg text-muted-foreground/40 opacity-0 transition-all hover:bg-vault-negative-light hover:text-vault-negative group-hover:opacity-100"
          title="Remove member"
        >
          <Trash2 className="size-3.5" />
        </button>
      )}

      {/* Confirm remove overlay */}
      {confirmRemove && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-card/95 px-6 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-foreground">Remove {member.name}?</p>
          <p className="text-[11px] text-muted-foreground">
            Their appointment history will be preserved.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => setConfirmRemove(false)}
              disabled={removing}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-8 gap-1 text-xs"
              disabled={removing}
              onClick={() => { setConfirmRemove(false); onRemove(); }}
            >
              {removing ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Avatar + name */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${cfg.bg}`}>
          <span className={cfg.color}>{cfg.icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
          <span className={`text-[11px] font-semibold ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
        <div>
          <p className="text-[10px] text-muted-foreground">Age</p>
          <p className="text-sm font-semibold text-foreground">
            {age !== null ? `${age} yrs` : "—"}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Active Rx</p>
          <p className="text-sm font-semibold text-muted-foreground/60">N/A</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Last visit</p>
          <p className="text-sm font-semibold text-foreground">{fmtDate(member.last_visit)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Next appt</p>
          <p className={`text-sm font-semibold ${member.next_appt ? "text-primary" : "text-foreground"}`}>
            {fmtDate(member.next_appt)}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs" asChild>
          <a href="/dashboard/appointments">
            <Calendar className="size-3" />
            Book appt
          </a>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs text-muted-foreground"
          asChild
        >
          <a href="/dashboard/records">
            Records
            <ChevronRight className="size-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ─── Empty Slot ───────────────────────────────────────────────────

function EmptySlot({ isPro, onClick }: { isPro: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
    >
      <div className="flex size-10 items-center justify-center rounded-full bg-muted/40">
        <Plus className="size-5 text-muted-foreground/60" />
      </div>
      <p className="text-xs text-muted-foreground">
        {isPro ? "Add family member" : "Upgrade to add family"}
      </p>
      {!isPro && (
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{ background: "rgba(196,151,90,0.10)", color: "#C4975A" }}
        >
          <Crown className="size-3" />
          Pro feature
        </span>
      )}
    </button>
  );
}

// ─── Add Member Modal ─────────────────────────────────────────────

function AddMemberModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name,        setName]        = useState("");
  const [relation,    setRelation]    = useState<FamilyRelation>("child");
  const [dob,         setDob]         = useState("");
  const [saveError,   setSaveError]   = useState<string | null>(null);
  const [isPending,   startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);

    const input: AddMemberInput = {
      name,
      relation,
      date_of_birth: dob || null,
    };

    startTransition(async () => {
      const { error } = await addFamilyMemberAction(input);
      if (error) {
        setSaveError(error);
      } else {
        onAdded();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h2
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Add Family Member
            </h2>
            <p className="mt-0.5 text-[12px] text-muted-foreground">
              They will be bookable from your account
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Full name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Ahmed"
              className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Relation */}
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Relation <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {RELATION_OPTIONS.map((opt) => {
                const cfg = RELATION_CONFIG[opt.value];
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRelation(opt.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-center transition-all ${
                      relation === opt.value
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <span className={relation === opt.value ? cfg.color : "text-muted-foreground"}>
                      {cfg.icon}
                    </span>
                    <span
                      className={`text-[10px] font-semibold ${
                        relation === opt.value ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Date of birth <span className="text-muted-foreground/50 font-normal normal-case">(optional)</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-10 w-full rounded-xl border border-border bg-muted/20 px-3 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Error */}
          {saveError && (
            <div className="flex items-center gap-2 rounded-xl border border-vault-negative/20 bg-vault-negative-light px-3 py-2.5 text-[12px] text-vault-negative">
              <AlertCircle className="size-4 shrink-0" />
              {saveError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-10 flex-1 gap-1.5"
              disabled={isPending || !name.trim()}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {isPending ? "Adding…" : "Add Member"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-lg bg-muted/50" />
          <div className="h-4 w-64 rounded bg-muted/30" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-5"
            style={{ opacity: 1 - i * 0.25 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-muted/40" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-muted/40" />
                <div className="h-3 w-16 rounded bg-muted/30" />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-1">
                  <div className="h-2.5 w-12 rounded bg-muted/40" />
                  <div className="h-3.5 w-16 rounded bg-muted/30" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-lg bg-muted/30" />
              <div className="h-8 w-20 rounded-lg bg-muted/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
