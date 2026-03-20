"use server";

import { createClient }   from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Types ────────────────────────────────────────────────────

export interface ScheduleRow {
  day_of_week:        number;   // 0 = Sunday … 6 = Saturday
  start_time:         string;   // "HH:MM"
  end_time:           string;   // "HH:MM"
  slot_duration_mins: number;
  is_active:          boolean;
}

export interface DoctorProfileData {
  full_name:       string;
  email:           string;
  phone:           string | null;
  specialty:       string | null;
  qualifications:  string | null;
  license_number:  string | null;
  bio:             string | null;
}

export interface DoctorClinicData {
  clinic_name:         string | null;
  clinic_phone:        string | null;
  clinic_address:      string | null;
  clinic_city:         string | null;
  clinic_postcode:     string | null;
  clinic_website:      string | null;
  default_slot_mins:   number;
  buffer_mins:         number;
  same_day_open_time:  string;
  max_advance_weeks:   number;
}

// ─── Defaults ─────────────────────────────────────────────────

const DEFAULT_CLINIC: DoctorClinicData = {
  clinic_name:        null,
  clinic_phone:       null,
  clinic_address:     null,
  clinic_city:        null,
  clinic_postcode:    null,
  clinic_website:     null,
  default_slot_mins:  30,
  buffer_mins:        5,
  same_day_open_time: "08:00",
  max_advance_weeks:  4,
};

const DEFAULT_PROFILE: DoctorProfileData = {
  full_name:      "",
  email:          "",
  phone:          null,
  specialty:      null,
  qualifications: null,
  license_number: null,
  bio:            null,
};

// ─── Schedule ─────────────────────────────────────────────────

/** Fetch the authenticated doctor's weekly availability rows. */
export async function getDoctorScheduleAction(): Promise<ScheduleRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("doctor_availability")
    .select("day_of_week, start_time, end_time, slot_duration_mins, is_active")
    .eq("doctor_id", user.id)
    .order("day_of_week");

  return (data ?? []) as ScheduleRow[];
}

/**
 * Upsert all 7 day rows for the authenticated doctor.
 * The unique constraint on (doctor_id, day_of_week) makes this idempotent.
 */
export async function saveDoctorScheduleAction(
  rows: ScheduleRow[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("doctor_availability")
    .upsert(
      rows.map((r) => ({ doctor_id: user.id, ...r })),
      { onConflict: "doctor_id,day_of_week" }
    );

  return { error: error?.message ?? null };
}

// ─── Profile + Clinic read ────────────────────────────────────

export async function getDoctorSettingsAction(): Promise<{
  profile: DoctorProfileData;
  clinic: DoctorClinicData;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: DEFAULT_PROFILE, clinic: DEFAULT_CLINIC };

  const { data } = await supabase
    .from("users")
    .select(
      `full_name, email, phone, specialty, qualifications, license_number, bio,
       clinic_name, clinic_phone, clinic_address, clinic_city, clinic_postcode, clinic_website,
       default_slot_mins, buffer_mins, same_day_open_time, max_advance_weeks`
    )
    .eq("id", user.id)
    .single();

  if (!data) return { profile: DEFAULT_PROFILE, clinic: DEFAULT_CLINIC };

  const profile: DoctorProfileData = {
    full_name:      data.full_name      ?? "",
    email:          data.email          ?? "",
    phone:          data.phone          ?? null,
    specialty:      data.specialty      ?? null,
    qualifications: data.qualifications ?? null,
    license_number: data.license_number ?? null,
    bio:            data.bio            ?? null,
  };

  const clinic: DoctorClinicData = {
    clinic_name:        data.clinic_name        ?? null,
    clinic_phone:       data.clinic_phone       ?? null,
    clinic_address:     data.clinic_address     ?? null,
    clinic_city:        data.clinic_city        ?? null,
    clinic_postcode:    data.clinic_postcode    ?? null,
    clinic_website:     data.clinic_website     ?? null,
    default_slot_mins:  data.default_slot_mins  ?? 30,
    buffer_mins:        data.buffer_mins        ?? 5,
    same_day_open_time: data.same_day_open_time ?? "08:00",
    max_advance_weeks:  data.max_advance_weeks  ?? 4,
  };

  return { profile, clinic };
}

// ─── Profile write ────────────────────────────────────────────

export async function saveDoctorProfileAction(
  input: Partial<DoctorProfileData>
): Promise<{ error: string | null }> {
  if (input.full_name !== undefined && !input.full_name.trim()) {
    return { error: "Full name cannot be empty." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, string | null> = {};
  if (input.full_name      !== undefined) updates.full_name      = input.full_name.trim();
  if (input.email          !== undefined) updates.email          = input.email.trim();
  if (input.phone          !== undefined) updates.phone          = input.phone?.trim() || null;
  if (input.specialty      !== undefined) updates.specialty      = input.specialty?.trim() || null;
  if (input.qualifications !== undefined) updates.qualifications = input.qualifications?.trim() || null;
  if (input.license_number !== undefined) updates.license_number = input.license_number?.trim() || null;
  if (input.bio            !== undefined) updates.bio            = input.bio?.trim() || null;

  if (Object.keys(updates).length === 0) return { error: null };

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/doctor/settings");
  return { error: null };
}

// ─── Clinic write ─────────────────────────────────────────────

export async function saveDoctorClinicAction(
  input: Partial<DoctorClinicData>
): Promise<{ error: string | null }> {
  const VALID_SLOTS   = [15, 20, 30, 45, 60];
  const VALID_BUFFERS = [0, 5, 10, 15];
  const VALID_WEEKS   = [2, 4, 8, 12];

  if (
    input.default_slot_mins !== undefined &&
    !VALID_SLOTS.includes(input.default_slot_mins)
  ) {
    return { error: "Slot duration must be 15, 20, 30, 45, or 60 minutes." };
  }
  if (
    input.buffer_mins !== undefined &&
    !VALID_BUFFERS.includes(input.buffer_mins)
  ) {
    return { error: "Buffer must be 0, 5, 10, or 15 minutes." };
  }
  if (
    input.max_advance_weeks !== undefined &&
    !VALID_WEEKS.includes(input.max_advance_weeks)
  ) {
    return { error: "Max advance booking must be 2, 4, 8, or 12 weeks." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const updates: Record<string, string | number | null> = {};
  if (input.clinic_name        !== undefined) updates.clinic_name        = input.clinic_name?.trim()        || null;
  if (input.clinic_phone       !== undefined) updates.clinic_phone       = input.clinic_phone?.trim()       || null;
  if (input.clinic_address     !== undefined) updates.clinic_address     = input.clinic_address?.trim()     || null;
  if (input.clinic_city        !== undefined) updates.clinic_city        = input.clinic_city?.trim()        || null;
  if (input.clinic_postcode    !== undefined) updates.clinic_postcode    = input.clinic_postcode?.trim()    || null;
  if (input.clinic_website     !== undefined) updates.clinic_website     = input.clinic_website?.trim()     || null;
  if (input.default_slot_mins  !== undefined) updates.default_slot_mins  = input.default_slot_mins;
  if (input.buffer_mins        !== undefined) updates.buffer_mins        = input.buffer_mins;
  if (input.same_day_open_time !== undefined) updates.same_day_open_time = input.same_day_open_time;
  if (input.max_advance_weeks  !== undefined) updates.max_advance_weeks  = input.max_advance_weeks;

  if (Object.keys(updates).length === 0) return { error: null };

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/doctor/settings");
  return { error: null };
}
