"use client";

import {
  Users,
  Plus,
  Crown,
  Calendar,
  ChevronRight,
  User,
  Baby,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Data ──────────────────────────────────────────────────────

type Relation = "spouse" | "child" | "parent" | "self";

interface FamilyMember {
  name: string;
  relation: Relation;
  age: number;
  dob: string;
  lastVisit: string | null;
  nextAppt: string | null;
  prescriptions: number;
}

const FAMILY_MEMBERS: FamilyMember[] = [
  {
    name: "You (Primary)",
    relation: "self",
    age: 34,
    dob: "Mar 8, 1992",
    lastVisit: "Feb 10, 2026",
    nextAppt: "Mar 15, 2026",
    prescriptions: 3,
  },
];

const RELATION_CONFIG: Record<
  Relation,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  self: {
    label: "Primary",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: <User className="size-4" />,
  },
  spouse: {
    label: "Spouse",
    color: "text-primary",
    bg: "bg-primary/10",
    icon: <Heart className="size-4" />,
  },
  child: {
    label: "Child",
    color: "text-vault-positive",
    bg: "bg-vault-positive-light",
    icon: <Baby className="size-4" />,
  },
  parent: {
    label: "Parent",
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    icon: <User className="size-4" />,
  },
};

const SLOTS_USED = FAMILY_MEMBERS.length;
const SLOTS_TOTAL = 9;

// ─── Page ──────────────────────────────────────────────────────

export default function FamilyPage() {
  const isPro = false; // toggle to true when membership is active

  return (
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
        {isPro && (
          <Button className="gap-2 self-start sm:self-auto" style={{ background: "var(--primary)" }}>
            <Plus className="size-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* ── Upgrade Gate (when not Pro) ── */}
      {!isPro && (
        <div
          className="relative overflow-hidden rounded-2xl border p-8"
          style={{
            background: "#0D1612",
            borderColor: "rgba(196,151,90,0.22)",
          }}
        >
          {/* Background glow */}
          <div
            className="pointer-events-none absolute right-0 top-0 size-64 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(196,151,90,0.08) 0%, transparent 70%)",
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
                Upgrade to Family Care ($150/year) to add up to 9 family members — spouse, up to 6 children, and 2 parents — all under one account. Book for anyone with one login.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {[
                  "20% off every visit for the whole family",
                  "Priority & same-day urgent booking",
                  "Centralised family health records",
                  "Book for any member from one account",
                ].map((perk, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "#7D8A85" }}>
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

      {/* ── Member cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FAMILY_MEMBERS.map((member, i) => {
          const config = RELATION_CONFIG[member.relation];
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Avatar + name */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${config.bg}`}
                >
                  <span className={config.color}>{config.icon}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                  <span
                    className={`text-[11px] font-semibold ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/30 p-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Age</p>
                  <p className="text-sm font-semibold text-foreground">{member.age} yrs</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Prescriptions</p>
                  <p className="text-sm font-semibold text-foreground">{member.prescriptions} active</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Last visit</p>
                  <p className="text-sm font-semibold text-foreground">{member.lastVisit ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Next appt</p>
                  <p className="text-sm font-semibold text-foreground">{member.nextAppt ?? "—"}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-xs">
                  <Calendar className="size-3" />
                  Book appt
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs text-muted-foreground">
                  Records
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Empty slots */}
        {Array.from({ length: Math.min(isPro ? SLOTS_TOTAL - SLOTS_USED : 2, 4) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/10 p-8 transition-colors hover:border-primary/40 hover:bg-primary/5"
            onClick={() => {
              if (!isPro) window.location.href = "/dashboard/billing";
            }}
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
          </div>
        ))}
      </div>

      {/* Slot usage indicator (Pro only) */}
      {isPro && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
          <Users className="size-4 text-muted-foreground" />
          <div className="flex-1">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>{SLOTS_USED} of {SLOTS_TOTAL} members added</span>
              <span>{SLOTS_TOTAL - SLOTS_USED} slots remaining</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(SLOTS_USED / SLOTS_TOTAL) * 100}%`,
                  background: "#C4975A",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
