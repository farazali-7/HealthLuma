"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Clock,
  Bell,
  Shield,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Camera,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  Globe,
  AlertCircle,
  Monitor,
  Smartphone,
  Pencil,
  Loader2,
} from "lucide-react";
import { Button }         from "@/components/ui/button";
import { createClient }   from "@/lib/supabase/client";
import {
  getDoctorScheduleAction,
  saveDoctorScheduleAction,
  getDoctorSettingsAction,
  saveDoctorProfileAction,
  saveDoctorClinicAction,
  type ScheduleRow,
  type DoctorProfileData,
  type DoctorClinicData,
} from "./actions";

type Tab = "profile" | "clinic" | "schedule" | "notifications" | "security";

// ─── Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const router = useRouter();
  const [tab,             setTab]             = useState<Tab>("profile");
  const [profile,         setProfile]         = useState<DoctorProfileData | null>(null);
  const [clinic,          setClinic]          = useState<DoctorClinicData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    getDoctorSettingsAction().then(({ profile: p, clinic: c }) => {
      setProfile(p);
      setClinic(c);
      setLoadingSettings(false);
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  const doctorInitials = profile?.full_name ? getInitials(profile.full_name) : "DR";
  const doctorName     = profile?.full_name ? profile.full_name : "Doctor";
  const doctorSpec     = profile?.specialty ?? "General Practitioner";

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: "profile",       label: "Profile",       icon: <User className="size-4" />,      desc: "Your public profile" },
    { id: "clinic",        label: "Clinic",         icon: <Building2 className="size-4" />, desc: "Location & settings"  },
    { id: "schedule",      label: "Schedule",       icon: <Clock className="size-4" />,     desc: "Working hours"        },
    { id: "notifications", label: "Notifications",  icon: <Bell className="size-4" />,      desc: "Alerts & emails"      },
    { id: "security",      label: "Security",       icon: <Shield className="size-4" />,    desc: "Password & sessions"  },
  ];

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* Header */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, clinic information, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Sidebar nav */}
        <nav className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Doctor quick card */}
            <div className="border-b border-border/60 p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#4D9A7F]/10">
                  {loadingSettings ? (
                    <Loader2 className="size-4 animate-spin text-[#4D9A7F]" />
                  ) : (
                    <span className="text-sm font-bold text-[#4D9A7F]">{doctorInitials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{doctorName}</p>
                  <p className="text-[11px] text-muted-foreground">{doctorSpec}</p>
                </div>
              </div>
            </div>

            {/* Nav items */}
            <div className="space-y-0.5 p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                    tab === item.id
                      ? "bg-[#4D9A7F]/10 text-[#4D9A7F]"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${
                    tab === item.id ? "bg-[#4D9A7F]/15 text-[#4D9A7F]" : "bg-muted/50 text-muted-foreground"
                  }`}>
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none">{item.label}</p>
                    <p className={`mt-0.5 text-[10px] ${
                      tab === item.id ? "text-[#4D9A7F]/70" : "text-muted-foreground/70"
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-border/60 p-2">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-vault-negative transition-colors hover:bg-vault-negative-light"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-vault-negative-light">
                  <LogOut className="size-3.5" />
                </span>
                Sign out
              </button>
            </div>
          </div>
        </nav>

        {/* Panel */}
        <div className="lg:col-span-9">
          {tab === "profile"       && <ProfileTab      initialData={profile} onSaved={(p) => setProfile(p)} />}
          {tab === "clinic"        && <ClinicTab        initialData={clinic}  onSaved={(c) => setClinic(c)}  />}
          {tab === "schedule"      && <ScheduleTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security"      && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────

function ProfileTab({
  initialData,
  onSaved,
}: {
  initialData: DoctorProfileData | null;
  onSaved: (p: DoctorProfileData) => void;
}) {
  const [editing,   setEditing]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState<DoctorProfileData>({
    full_name: "", email: "", phone: null, specialty: null,
    qualifications: null, license_number: null, bio: null,
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  function setField<K extends keyof DoctorProfileData>(key: K, value: DoctorProfileData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEdit() {
    setSaveError(null);
    setEditing(true);
  }

  function handleCancel() {
    if (initialData) setForm(initialData);
    setEditing(false);
    setSaveError(null);
  }

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      const { error } = await saveDoctorProfileAction(form);
      if (error) {
        setSaveError(error);
        return;
      }
      onSaved(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((w) => w.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DR";
  }

  if (initialData === null) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="h-4 w-48 rounded bg-muted/30" />
          <div className="h-4 w-40 rounded bg-muted/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Doctor Profile</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your professional information shown to patients on booking pages
            </p>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleEdit}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          ) : (
            <span className="rounded-full bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F]">
              Editing
            </span>
          )}
        </div>

        <div className="p-6 space-y-6">

          {/* Avatar + credentials */}
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-[#4D9A7F]/10 ring-1 ring-[#4D9A7F]/20">
                <span className="text-2xl font-bold text-[#4D9A7F]">
                  {getInitials(form.full_name || "Doctor")}
                </span>
              </div>
              {editing && (
                <button className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/60">
                  <Camera className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-foreground">
                {form.full_name || "—"}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="flex items-center gap-1 rounded-full bg-[#4D9A7F]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#4D9A7F]">
                  <Stethoscope className="size-2.5" />
                  {form.specialty ?? "—"}
                </span>
                {form.qualifications && (
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {form.qualifications}
                  </span>
                )}
                {form.license_number && (
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    License #{form.license_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Personal details */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Personal Details
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Full name"
                value={form.full_name}
                onChange={(v) => setField("full_name", v)}
                disabled={!editing}
              />
              <Field
                label="Specialty"
                value={form.specialty ?? ""}
                onChange={(v) => setField("specialty", v || null)}
                disabled={!editing}
              />
              <Field
                label="Qualifications"
                value={form.qualifications ?? ""}
                onChange={(v) => setField("qualifications", v || null)}
                disabled={!editing}
              />
              <Field
                label="GMC / License No."
                value={form.license_number ?? ""}
                onChange={(v) => setField("license_number", v || null)}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Contact
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldIcon
                label="Email"
                value={form.email}
                onChange={(v) => setField("email", v)}
                type="email"
                icon={<Mail className="size-3.5" />}
                disabled={!editing}
              />
              <FieldIcon
                label="Phone"
                value={form.phone ?? ""}
                onChange={(v) => setField("phone", v || null)}
                icon={<Phone className="size-3.5" />}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Short Bio
            </p>
            <textarea
              rows={3}
              disabled={!editing}
              value={form.bio ?? ""}
              onChange={(e) => setField("bio", e.target.value || null)}
              placeholder="Write a short professional bio…"
              className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm text-foreground transition-all placeholder:text-muted-foreground/40 ${
                !editing
                  ? "border-transparent bg-transparent cursor-default"
                  : "border-border bg-muted/20 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
              }`}
            />
          </div>

          {/* Footer actions */}
          {editing && (
            <div className="space-y-2 border-t border-border/60 pt-4">
              {saveError && (
                <p className="text-xs text-vault-negative">{saveError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Discard
                </Button>
                <SaveButton
                  saved={saved}
                  onClick={handleSave}
                  label={isPending ? "Saving…" : "Save changes"}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Clinic Tab ────────────────────────────────────────────────

function ClinicTab({
  initialData,
  onSaved,
}: {
  initialData: DoctorClinicData | null;
  onSaved: (c: DoctorClinicData) => void;
}) {
  const [editing,   setEditing]   = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const defaultForm: DoctorClinicData = {
    clinic_name: null, clinic_phone: null, clinic_address: null,
    clinic_city: null, clinic_postcode: null, clinic_website: null,
    default_slot_mins: 30, buffer_mins: 5,
    same_day_open_time: "08:00", max_advance_weeks: 4,
  };

  const [form, setForm] = useState<DoctorClinicData>(defaultForm);

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  function setField<K extends keyof DoctorClinicData>(key: K, value: DoctorClinicData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleEdit() {
    setSaveError(null);
    setEditing(true);
  }

  function handleCancel() {
    if (initialData) setForm(initialData);
    setEditing(false);
    setSaveError(null);
  }

  function handleSave() {
    setSaveError(null);
    startTransition(async () => {
      const { error } = await saveDoctorClinicAction(form);
      if (error) {
        setSaveError(error);
        return;
      }
      onSaved(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const selectCls = (isEditing: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm text-foreground transition-all ${
      isEditing
        ? "border-border bg-muted/20 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
        : "border-transparent bg-transparent cursor-default appearance-none"
    }`;

  if (initialData === null) {
    return (
      <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-muted/40" />
          <div className="h-4 w-48 rounded bg-muted/30" />
          <div className="h-4 w-40 rounded bg-muted/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Clinic Information</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Appears on booking confirmations and patient-facing pages
            </p>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={handleEdit}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
          ) : (
            <span className="rounded-full bg-[#4D9A7F]/10 px-2.5 py-1 text-[10px] font-semibold text-[#4D9A7F]">
              Editing
            </span>
          )}
        </div>

        <div className="space-y-6 p-6">

          {/* Clinic identity */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Identity
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Clinic name"
                value={form.clinic_name ?? ""}
                onChange={(v) => setField("clinic_name", v || null)}
                disabled={!editing}
              />
              <FieldIcon
                label="Phone"
                value={form.clinic_phone ?? ""}
                onChange={(v) => setField("clinic_phone", v || null)}
                icon={<Phone className="size-3.5" />}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Address
            </p>
            <div className="grid gap-4">
              <FieldIcon
                label="Address"
                value={form.clinic_address ?? ""}
                onChange={(v) => setField("clinic_address", v || null)}
                icon={<MapPin className="size-3.5" />}
                disabled={!editing}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="City"
                  value={form.clinic_city ?? ""}
                  onChange={(v) => setField("clinic_city", v || null)}
                  disabled={!editing}
                />
                <Field
                  label="Postcode"
                  value={form.clinic_postcode ?? ""}
                  onChange={(v) => setField("clinic_postcode", v || null)}
                  disabled={!editing}
                />
              </div>
              <FieldIcon
                label="Website"
                value={form.clinic_website ?? ""}
                onChange={(v) => setField("clinic_website", v || null)}
                icon={<Globe className="size-3.5" />}
                disabled={!editing}
              />
            </div>
          </div>

          {/* Appointment settings */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Appointment Settings
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Default slot duration
                </label>
                <select
                  disabled={!editing}
                  value={String(form.default_slot_mins)}
                  onChange={(e) => setField("default_slot_mins", Number(e.target.value))}
                  className={selectCls(editing)}
                >
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Buffer between slots
                </label>
                <select
                  disabled={!editing}
                  value={String(form.buffer_mins)}
                  onChange={(e) => setField("buffer_mins", Number(e.target.value))}
                  className={selectCls(editing)}
                >
                  <option value="0">None</option>
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="15">15 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Booking window */}
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Booking Window
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Same-day booking opens
                </label>
                <input
                  type="time"
                  disabled={!editing}
                  value={form.same_day_open_time}
                  onChange={(e) => setField("same_day_open_time", e.target.value)}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm text-foreground transition-all ${
                    editing
                      ? "border-border bg-muted/20 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
                      : "border-transparent bg-transparent cursor-default"
                  }`}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Max advance booking
                </label>
                <select
                  disabled={!editing}
                  value={String(form.max_advance_weeks)}
                  onChange={(e) => setField("max_advance_weeks", Number(e.target.value))}
                  className={selectCls(editing)}
                >
                  <option value="2">2 weeks</option>
                  <option value="4">4 weeks</option>
                  <option value="8">8 weeks</option>
                  <option value="12">12 weeks</option>
                </select>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Pro members can book up to 72 hours before general release.
            </p>
          </div>

          {editing && (
            <div className="space-y-2 border-t border-border/60 pt-4">
              {saveError && (
                <p className="text-xs text-vault-negative">{saveError}</p>
              )}
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={handleCancel}
                  disabled={isPending}
                >
                  Discard
                </Button>
                <SaveButton
                  saved={saved}
                  onClick={handleSave}
                  label={isPending ? "Saving…" : "Save changes"}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Tab ──────────────────────────────────────────────

const ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_TO_DOW: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
};
const DOW_TO_DAY: Record<number, string> = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday",
};

const FALLBACK_SCHEDULE: Record<string, { open: string; close: string; enabled: boolean }> = {
  Monday:    { open: "09:00", close: "17:00", enabled: true  },
  Tuesday:   { open: "09:00", close: "17:00", enabled: true  },
  Wednesday: { open: "09:00", close: "17:00", enabled: true  },
  Thursday:  { open: "09:00", close: "17:00", enabled: true  },
  Friday:    { open: "09:00", close: "17:00", enabled: true  },
  Saturday:  { open: "09:00", close: "12:00", enabled: false },
  Sunday:    { open: "09:00", close: "17:00", enabled: false },
};

function ScheduleTab() {
  const [editing,   setEditing]   = useState(false);
  const [days,      setDays]      = useState(FALLBACK_SCHEDULE);
  const [backup,    setBackup]    = useState(FALLBACK_SCHEDULE);
  const [loading,   setLoading]   = useState(true);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getDoctorScheduleAction().then((rows: ScheduleRow[]) => {
      if (rows.length === 0) { setLoading(false); return; }
      const schedule = { ...FALLBACK_SCHEDULE };
      for (const row of rows) {
        const name = DOW_TO_DAY[row.day_of_week];
        if (name) {
          schedule[name] = {
            open:    row.start_time.slice(0, 5),
            close:   row.end_time.slice(0, 5),
            enabled: row.is_active,
          };
        }
      }
      setDays(schedule);
      setBackup(schedule);
      setLoading(false);
    });
  }, []);

  const toggle  = (day: string) =>
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));

  const setTime = (day: string, field: "open" | "close", val: string) =>
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], [field]: val } }));

  function handleEdit() {
    setBackup(days);
    setSaveError(null);
    setEditing(true);
  }

  function handleCancel() {
    setDays(backup);
    setEditing(false);
    setSaveError(null);
  }

  function handleSave() {
    setSaveError(null);
    const rows: ScheduleRow[] = ALL_DAYS.map((name) => ({
      day_of_week:        DAY_TO_DOW[name],
      start_time:         days[name].open,
      end_time:           days[name].close,
      slot_duration_mins: 30,
      is_active:          days[name].enabled,
    }));

    startTransition(async () => {
      const { error } = await saveDoctorScheduleAction(rows);
      if (error) {
        setSaveError("Failed to save. Please try again.");
        return;
      }
      setBackup(days);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const activeDays = ALL_DAYS.filter((d) => days[d].enabled).length;

  const timeCls = (isEditing: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm text-foreground transition-all ${
      isEditing
        ? "border-border bg-muted/20 focus:border-[#4D9A7F]/40 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/15"
        : "border-transparent bg-transparent cursor-default"
    }`;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Working Hours</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Set your availability for patient booking</p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-[11px] text-muted-foreground">Loading…</span>
          ) : (
            <>
              <span className="rounded-full bg-[#4D9A7F]/10 px-2.5 py-1 text-[11px] font-semibold text-[#4D9A7F]">
                {activeDays} days active
              </span>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={handleEdit}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="divide-y divide-border/40">
        {ALL_DAYS.map((day) => {
          const config    = days[day];
          const isWeekend = day === "Saturday" || day === "Sunday";
          return (
            <div
              key={day}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                config.enabled ? "" : "opacity-60"
              } ${isWeekend && !config.enabled ? "bg-muted/10" : ""}`}
            >
              <button
                onClick={() => editing && toggle(day)}
                disabled={!editing}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                  config.enabled ? "bg-[#4D9A7F]" : "bg-muted/60"
                } ${!editing ? "cursor-default" : "cursor-pointer"}`}
              >
                <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  config.enabled ? "translate-x-4" : "translate-x-0.5"
                }`} />
              </button>
              <span className={`w-24 text-sm font-medium ${config.enabled ? "text-foreground" : "text-muted-foreground"}`}>
                {day}
              </span>
              {config.enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    disabled={!editing}
                    value={config.open}
                    onChange={(e) => setTime(day, "open", e.target.value)}
                    className={timeCls(editing)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <input
                    type="time"
                    disabled={!editing}
                    value={config.close}
                    onChange={(e) => setTime(day, "close", e.target.value)}
                    className={timeCls(editing)}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="border-t border-border/60 px-6 py-4 space-y-2">
          {saveError && (
            <p className="text-xs text-vault-negative">{saveError}</p>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={handleCancel}
              disabled={isPending}
            >
              Discard
            </Button>
            <SaveButton
              saved={saved}
              onClick={handleSave}
              label={isPending ? "Saving…" : "Save schedule"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────

const NOTIF_GROUPS = [
  {
    label: "Appointments",
    desc: "Booking, cancellation, and reminder alerts",
    items: [
      { id: "new_booking",  label: "New booking received",        sub: "Instant alert when a patient books",        default: true  },
      { id: "cancellation", label: "Appointment cancelled",        sub: "When a patient cancels their slot",         default: true  },
      { id: "reschedule",   label: "Reschedule request",           sub: "Patient requests a different time",         default: true  },
      { id: "reminder_1h",  label: "1-hour reminder (for you)",    sub: "Personal reminder before each appointment", default: false },
    ],
  },
  {
    label: "Patients",
    desc: "Registration and record activity",
    items: [
      { id: "new_patient",   label: "New patient registered",       sub: "First-time patient signs up",              default: true  },
      { id: "record_upload", label: "Document uploaded",            sub: "Patient attaches a file to their record",  default: true  },
      { id: "refill_req",    label: "Prescription refill request",  sub: "Patient requests a repeat prescription",   default: true  },
    ],
  },
  {
    label: "Billing",
    desc: "Payments, invoices, and subscriptions",
    items: [
      { id: "payment_rcvd", label: "Payment received",   sub: "Confirmed payment against an invoice",  default: true  },
      { id: "overdue",      label: "Invoice overdue",    sub: "Invoice has passed its due date",        default: true  },
      { id: "pro_signup",   label: "New Pro membership", sub: "Patient upgrades to Family Care Pro",   default: true  },
    ],
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i.default])))
  );

  const toggle = (id: string) =>
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="space-y-4">
      {NOTIF_GROUPS.map((group) => (
        <div key={group.label} className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{group.desc}</p>
          </div>
          <div className="divide-y divide-border/40">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-muted/10"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                </div>
                <button
                  onClick={() => toggle(item.id)}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    prefs[item.id] ? "bg-[#4D9A7F]" : "bg-muted/60"
                  }`}
                >
                  <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                    prefs[item.id] ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Security Tab ──────────────────────────────────────────────

function SecurityTab() {
  const [showNew,    setShowNew]    = useState(false);
  const [pwSaved,    setPwSaved]    = useState(false);
  const [pwError,    setPwError]    = useState<string | null>(null);
  const [currentPw,  setCurrentPw]  = useState("");
  const [newPw,      setNewPw]      = useState("");
  const [confirmPw,  setConfirmPw]  = useState("");
  const [isPending,  startTransition] = useTransition();

  function handlePwSave() {
    setPwError(null);
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        setPwError(error.message);
        return;
      }
      setPwSaved(true);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setTimeout(() => setPwSaved(false), 2000);
    });
  }

  return (
    <div className="space-y-4">

      {/* Change Password */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Use a strong password you don&apos;t use elsewhere
          </p>
        </div>
        <div className="space-y-4 p-6">
          <Field
            label="Current password"
            type="password"
            placeholder="••••••••"
            value={currentPw}
            onChange={(v) => setCurrentPw(v)}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="••••••••"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/40 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Minimum 8 characters — include letters, numbers, and a symbol.
            </p>
          </div>
          <Field
            label="Confirm new password"
            type="password"
            placeholder="••••••••"
            value={confirmPw}
            onChange={(v) => setConfirmPw(v)}
          />
          {pwError && (
            <p className="text-xs text-vault-negative">{pwError}</p>
          )}
          <div className="flex justify-end border-t border-border/60 pt-4">
            <SaveButton
              saved={pwSaved}
              onClick={handlePwSave}
              label={isPending ? "Updating…" : "Update password"}
            />
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Active Sessions</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Devices currently signed in to your account
          </p>
        </div>
        <div className="divide-y divide-border/40">
          {[
            { device: "Chrome on macOS",  icon: <Monitor className="size-4" />,    loc: "London, UK", time: "Now · current session", current: true  },
            { device: "Safari on iPhone", icon: <Smartphone className="size-4" />, loc: "London, UK", time: "3 hours ago",            current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${
                s.current ? "bg-[#4D9A7F]/10 text-[#4D9A7F]" : "bg-muted/50 text-muted-foreground"
              }`}>
                {s.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{s.device}</p>
                <p className="text-[11px] text-muted-foreground">{s.loc} &middot; {s.time}</p>
              </div>
              {s.current ? (
                <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                  Current
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 shrink-0 text-xs text-vault-negative hover:bg-vault-negative-light hover:border-vault-negative/20"
                >
                  Sign out
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-vault-negative/20 bg-vault-negative-light/30 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-vault-negative" />
            <div>
              <h3 className="text-sm font-semibold text-vault-negative">Danger Zone</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Deleting your account is permanent. All clinic data, patient records, and billing history
                will be removed. Contact support before proceeding.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-7 border-vault-negative/30 text-xs text-vault-negative hover:bg-vault-negative-light"
              >
                Request account deletion
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared components ─────────────────────────────────────────

function Field({
  label,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label:         string;
  value?:        string;
  defaultValue?: string;
  onChange?:     (v: string) => void;
  placeholder?:  string;
  type?:         string;
  disabled?:     boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value !== undefined ? value : undefined}
        defaultValue={value !== undefined ? undefined : defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-foreground transition-all ${
          disabled
            ? "border-transparent bg-transparent cursor-default"
            : "border-border bg-muted/20 placeholder:text-muted-foreground/40 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
        }`}
      />
    </div>
  );
}

function FieldIcon({
  label,
  value,
  defaultValue = "",
  onChange,
  placeholder,
  type = "text",
  icon,
  disabled = false,
}: {
  label:         string;
  value?:        string;
  defaultValue?: string;
  onChange?:     (v: string) => void;
  placeholder?:  string;
  type?:         string;
  icon:          React.ReactNode;
  disabled?:     boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <span className={`pointer-events-none absolute inset-y-0 left-3.5 flex items-center transition-colors ${
          disabled ? "text-muted-foreground/30" : "text-muted-foreground/50"
        }`}>
          {icon}
        </span>
        <input
          type={type}
          value={value !== undefined ? value : undefined}
          defaultValue={value !== undefined ? undefined : defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm text-foreground transition-all ${
            disabled
              ? "border-transparent bg-transparent cursor-default"
              : "border-border bg-muted/20 placeholder:text-muted-foreground/40 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
          }`}
        />
      </div>
    </div>
  );
}

function SaveButton({
  saved,
  onClick,
  label = "Save changes",
}: {
  saved:    boolean;
  onClick:  () => void;
  label?:   string;
}) {
  return (
    <Button
      onClick={onClick}
      style={{ background: saved ? "#185C45" : "#4D9A7F", color: "white" }}
      className="min-w-36 gap-2 transition-all"
    >
      {saved ? (
        <>
          <Check className="size-4" />
          Saved
        </>
      ) : (
        label
      )}
    </Button>
  );
}
