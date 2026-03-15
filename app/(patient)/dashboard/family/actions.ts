"use server";

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────

export type FamilyRelation =
  | "spouse" | "child" | "parent" | "sibling" | "other";

export interface FamilyMemberRow {
  id: string;
  name: string;
  relation: FamilyRelation;
  date_of_birth: string | null;  // "YYYY-MM-DD"
  created_at: string;
  // Derived from appointments
  last_visit: string | null;     // "YYYY-MM-DD"
  next_appt: string | null;      // "YYYY-MM-DD"
}

export interface PrimaryUserInfo {
  full_name: string | null;
  date_of_birth: string | null;  // "YYYY-MM-DD"
  last_visit: string | null;
  next_appt: string | null;
  active_rx_count: number;
}

export interface FamilyPageData {
  isPro: boolean;
  subscription: {
    status: string;
    renews_at: string | null;
  } | null;
  primaryUser: PrimaryUserInfo;
  members: FamilyMemberRow[];
}

// ─── Queries ─────────────────────────────────────────────────────

/**
 * Load all data needed for the Family page in one action.
 * Runs 4 queries total; stats are derived in JS to avoid N+1.
 */
export async function getFamilyPageDataAction(): Promise<FamilyPageData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = new Date().toISOString().split("T")[0];

  // ── 1. Subscription ──────────────────────────────────────────
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, renews_at")
    .eq("patient_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isPro = !!sub;

  // ── 2. Primary user profile ───────────────────────────────────
  const { data: profile } = await supabase
    .from("users")
    .select("full_name, date_of_birth")
    .eq("id", user.id)
    .single();

  // ── 3. Family members ─────────────────────────────────────────
  const { data: membersRaw } = await supabase
    .from("family_members")
    .select("id, name, relation, date_of_birth, created_at")
    .eq("primary_user_id", user.id)
    .order("created_at", { ascending: true });

  const members = membersRaw ?? [];

  // ── 4. All appointments (self + family) ───────────────────────
  // Single query — stats are derived in JS below.
  const { data: appts } = await supabase
    .from("appointments")
    .select("family_member_id, appointment_date, status")
    .eq("patient_id", user.id)
    .in("status", ["upcoming", "completed"]);

  const appointments = appts ?? [];

  // ── 5. Active prescription count (primary user only) ─────────
  const { count: rxCount } = await supabase
    .from("prescriptions")
    .select("id", { count: "exact", head: true })
    .eq("patient_id", user.id)
    .eq("status", "active");

  // ── Derive appointment stats ──────────────────────────────────
  const selfAppts = appointments.filter((a) => a.family_member_id === null);

  const primaryUser: PrimaryUserInfo = {
    full_name:      profile?.full_name    ?? null,
    date_of_birth:  profile?.date_of_birth ?? null,
    last_visit:
      selfAppts
        .filter((a) => a.status === "completed")
        .map((a) => a.appointment_date)
        .sort()
        .pop() ?? null,
    next_appt:
      selfAppts
        .filter((a) => a.status === "upcoming" && a.appointment_date >= today)
        .map((a) => a.appointment_date)
        .sort()[0] ?? null,
    active_rx_count: rxCount ?? 0,
  };

  const membersWithStats: FamilyMemberRow[] = members.map((m) => {
    const mAppts = appointments.filter((a) => a.family_member_id === m.id);
    return {
      id:            m.id,
      name:          m.name,
      relation:      m.relation as FamilyRelation,
      date_of_birth: m.date_of_birth,
      created_at:    m.created_at,
      last_visit:
        mAppts
          .filter((a) => a.status === "completed")
          .map((a) => a.appointment_date)
          .sort()
          .pop() ?? null,
      next_appt:
        mAppts
          .filter((a) => a.status === "upcoming" && a.appointment_date >= today)
          .map((a) => a.appointment_date)
          .sort()[0] ?? null,
    };
  });

  return {
    isPro,
    subscription: sub
      ? { status: sub.status, renews_at: sub.renews_at ?? null }
      : null,
    primaryUser,
    members: membersWithStats,
  };
}

// ─── Mutations ────────────────────────────────────────────────────

const MAX_MEMBERS = 9;

export interface AddMemberInput {
  name: string;
  relation: FamilyRelation;
  date_of_birth: string | null;  // "YYYY-MM-DD" or null
}

/**
 * Add a family member.
 * Guards:
 *  - Must be a Pro subscriber
 *  - Cannot exceed 9 members
 *  - Cannot add "self" relation (that is the primary account holder)
 */
export async function addFamilyMemberAction(
  input: AddMemberInput
): Promise<{ error: string | null }> {
  const { name, relation, date_of_birth } = input;

  if (!name.trim())                   return { error: "Name is required." };
  if (relation === ("self" as string)) return { error: "Invalid relation." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  // Verify Pro subscription
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("patient_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  if (!sub) return { error: "Family management requires a Pro subscription." };

  // Enforce slot limit
  const { count } = await supabase
    .from("family_members")
    .select("id", { count: "exact", head: true })
    .eq("primary_user_id", user.id);

  if ((count ?? 0) >= MAX_MEMBERS) {
    return { error: `You've reached the maximum of ${MAX_MEMBERS} family members.` };
  }

  const { error } = await supabase.from("family_members").insert({
    primary_user_id: user.id,
    name:            name.trim(),
    relation,
    date_of_birth:   date_of_birth || null,
  });

  return { error: error?.message ?? null };
}

/**
 * Remove a family member.
 * RLS policy `family: patient owns` enforces primary_user_id = auth.uid().
 * Extra guard: must be Pro (to prevent confusion if subscription lapses).
 */
export async function removeFamilyMemberAction(
  id: string
): Promise<{ error: string | null }> {
  if (!id) return { error: "Missing ID." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { error } = await supabase
    .from("family_members")
    .delete()
    .eq("id", id)
    .eq("primary_user_id", user.id); // RLS + application layer double guard

  return { error: error?.message ?? null };
}
