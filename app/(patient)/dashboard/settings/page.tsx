"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Camera,
  Check,
  Eye,
  EyeOff,
  Laptop2,
  Smartphone,
  Mail,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context";
import { createClient } from "@/lib/supabase/client";
import {
  getSettingsDataAction,
  updatePersonalInfoAction,
  updateMedicalProfileAction,
  updateEmergencyContactAction,
  updateAvatarUrlAction,
  updateNotificationPreferencesAction,
  updatePasswordAction,
  signOutAction,
  type SettingsProfile,
} from "./actions";

// ─── Types ─────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "security";

// ─── Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useUser();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<SettingsProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const email = user.email ?? "";

  // Derive initials from loaded profile or auth metadata
  const displayName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    "";

  const initials = displayName
    ? displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase() || "U";

  const avatarUrl = profile?.avatar_url ?? null;

  useEffect(() => {
    startTransition(async () => {
      const data = await getSettingsDataAction();
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const refreshProfile = async () => {
    const data = await getSettingsDataAction();
    setProfile(data);
  };

  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.refresh();
  };

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, notifications, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* ── Sidebar Nav ── */}
        <nav className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">

            {/* User identity strip */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="size-9 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-xs font-bold text-primary">{initials}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {loading ? (
                    <span className="inline-block h-3.5 w-24 animate-pulse rounded bg-muted" />
                  ) : (
                    displayName || "Your Name"
                  )}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{email}</p>
              </div>
            </div>

            <div className="space-y-0.5 p-2">
              {(
                [
                  { id: "profile",       label: "Profile",       icon: <User className="size-4" />   },
                  { id: "notifications", label: "Notifications", icon: <Bell className="size-4" />   },
                  { id: "security",      label: "Security",      icon: <Shield className="size-4" /> },
                ] as { id: Tab; label: string; icon: React.ReactNode }[]
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    tab === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-lg transition-colors ${
                      tab === item.id ? "bg-primary/15 text-primary" : "bg-muted/50"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="border-t border-border/60 p-2">
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-vault-negative transition-colors hover:bg-vault-negative-light"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-vault-negative-light">
                  <LogOut className="size-4" />
                </span>
                Sign out
              </button>
            </div>
          </div>
        </nav>

        {/* ── Content Panel ── */}
        <div className="lg:col-span-9">
          {tab === "profile" && (
            <ProfileTab
              profile={profile}
              loading={loading}
              email={email}
              initials={initials}
              onSaved={refreshProfile}
            />
          )}
          {tab === "notifications" && (
            <NotificationsTab
              savedPrefs={profile?.notification_preferences ?? null}
            />
          )}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Shared edit-mode pattern ───────────────────────────────────

function CardActions({
  editing,
  saving,
  saved,
  onEdit,
  onSave,
  onCancel,
}: {
  editing: boolean;
  saving?: boolean;
  saved: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!editing) {
    return (
      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onEdit}>
        Edit
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-muted-foreground"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button size="sm" className="h-7 min-w-14 gap-1.5 text-xs" onClick={onSave} disabled={saving}>
        {saving ? (
          <Loader2 className="size-3 animate-spin" />
        ) : saved ? (
          <>
            <Check className="size-3" />
            Saved
          </>
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm odd:bg-muted/20">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          empty
            ? "text-[12px] italic text-muted-foreground/40"
            : "font-medium text-foreground"
        }
      >
        {empty ? "Not set" : value}
      </span>
    </div>
  );
}

function CardError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-vault-negative/20 bg-vault-negative-light px-4 py-2.5 text-xs text-vault-negative">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2.5 odd:bg-muted/20">
          <span className="h-3 w-20 animate-pulse rounded bg-muted" />
          <span className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────

function ProfileTab({
  profile,
  loading,
  email,
  initials,
  onSaved,
}: {
  profile: SettingsProfile | null;
  loading: boolean;
  email: string;
  initials: string;
  onSaved: () => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      <PersonalInfoCard
        profile={profile}
        loading={loading}
        email={email}
        initials={initials}
        onSaved={onSaved}
      />
      <MedicalProfileCard profile={profile} loading={loading} onSaved={onSaved} />
      <EmergencyContactCard profile={profile} loading={loading} onSaved={onSaved} />
    </div>
  );
}

// ── Personal Information ─────────────────────────────────────

function PersonalInfoCard({
  profile,
  loading,
  email,
  initials,
  onSaved,
}: {
  profile: SettingsProfile | null;
  loading: boolean;
  email: string;
  initials: string;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing]     = useState(false);
  const [saving,  setSaving]      = useState(false);
  const [saved,   setSaved]       = useState(false);
  const [saveErr, setSaveErr]     = useState<string | null>(null);
  const [draft,   setDraft]       = useState({ name: "", phone: "", dob: "" });
  const fileInputRef              = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase                  = createClient();

  // Sync when profile loads
  useEffect(() => {
    if (profile) {
      setDraft({
        name:  profile.full_name  ?? "",
        phone: profile.phone      ?? "",
        dob:   profile.date_of_birth ?? "",
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const displayName = profile?.full_name ?? "";

  const handleEdit = () => {
    setDraft({
      name:  profile?.full_name      ?? "",
      phone: profile?.phone          ?? "",
      dob:   profile?.date_of_birth  ?? "",
    });
    setSaveErr(null);
    setEditing(true);
  };

  const handleCancel = () => { setEditing(false); setSaveErr(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr(null);
    const result = await updatePersonalInfoAction({
      full_name:     draft.name.trim() || null,
      phone:         draft.phone.trim() || null,
      date_of_birth: draft.dob || null,
    });
    setSaving(false);
    if (result.error) { setSaveErr(result.error); return; }
    await onSaved();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setSaveErr("Avatar must be under 5 MB."); return; }

    setUploading(true);
    setSaveErr(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const ext   = file.name.split(".").pop();
    const path  = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (upErr) { setSaveErr(upErr.message); setUploading(false); return; }

    // Store the storage path in DB — never a public URL
    const result = await updateAvatarUrlAction(path);
    if (result.error) { setSaveErr(result.error); setUploading(false); return; }

    // Generate a signed URL (1 h) for immediate in-page display
    const { data: signedData } = await supabase.storage
      .from("avatars")
      .createSignedUrl(path, 3600);
    setAvatarUrl(signedData?.signedUrl ?? null);
    await onSaved();
    setUploading(false);
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
          <p className="text-xs text-muted-foreground">
            Your name, contact details, and basic profile
          </p>
        </div>
        <CardActions
          editing={editing}
          saving={saving}
          saved={saved}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <div className="p-6 space-y-5">
        {saveErr && <CardError message={saveErr} />}

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="size-16 rounded-2xl object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-xl font-bold text-primary">{initials}</span>
              </div>
            )}
            {editing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
              >
                {uploading
                  ? <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  : <Camera className="size-3 text-muted-foreground" />
                }
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          {editing ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Uploading…" : "Change photo"}
            </Button>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">
                {loading ? (
                  <span className="inline-block h-3.5 w-28 animate-pulse rounded bg-muted" />
                ) : (
                  displayName || "Your Name"
                )}
              </p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
          )}
        </div>

        {/* Read / Edit */}
        {loading ? (
          <ProfileSkeleton />
        ) : editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" value={draft.name} onChange={(v) => setDraft((p) => ({ ...p, name: v }))} />
            <Field label="Email address" defaultValue={email} type="email" disabled />
            <Field label="Phone number" value={draft.phone} onChange={(v) => setDraft((p) => ({ ...p, phone: v }))} placeholder="+1 (555) 000-0000" />
            <Field label="Date of birth" value={draft.dob} onChange={(v) => setDraft((p) => ({ ...p, dob: v }))} type="date" />
          </div>
        ) : (
          <div className="space-y-0.5">
            <InfoRow label="Full name"     value={profile?.full_name      ?? ""} />
            <InfoRow label="Email"         value={email}                          />
            <InfoRow label="Phone"         value={profile?.phone          ?? ""} />
            <InfoRow label="Date of birth" value={profile?.date_of_birth  ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Medical Profile ──────────────────────────────────────────

function MedicalProfileCard({
  profile,
  loading,
  onSaved,
}: {
  profile: SettingsProfile | null;
  loading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [draft,   setDraft]   = useState({
    bloodType:  "",
    gender:     "",
    smoking:    "",
    allergies:  "",
    conditions: "",
    otherMeds:  "",
  });

  useEffect(() => {
    if (profile) {
      setDraft({
        bloodType:  profile.blood_type         ?? "",
        gender:     profile.gender             ?? "",
        smoking:    profile.smoking_status     ?? "",
        allergies:  profile.allergies          ?? "",
        conditions: profile.chronic_conditions ?? "",
        otherMeds:  profile.other_medications  ?? "",
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setDraft({
      bloodType:  profile?.blood_type         ?? "",
      gender:     profile?.gender             ?? "",
      smoking:    profile?.smoking_status     ?? "",
      allergies:  profile?.allergies          ?? "",
      conditions: profile?.chronic_conditions ?? "",
      otherMeds:  profile?.other_medications  ?? "",
    });
    setSaveErr(null);
    setEditing(true);
  };

  const handleCancel = () => { setEditing(false); setSaveErr(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr(null);
    const result = await updateMedicalProfileAction({
      blood_type:         draft.bloodType  || null,
      gender:             draft.gender     || null,
      smoking_status:     draft.smoking    || null,
      allergies:          draft.allergies.trim()  || null,
      chronic_conditions: draft.conditions.trim() || null,
      other_medications:  draft.otherMeds.trim()  || null,
    });
    setSaving(false);
    if (result.error) { setSaveErr(result.error); return; }
    await onSaved();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Medical Profile</h2>
          <p className="text-xs text-muted-foreground">
            Shared with your doctor to personalise your care
          </p>
        </div>
        <CardActions
          editing={editing}
          saving={saving}
          saved={saved}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <div className="p-6">
        {saveErr && <div className="mb-4"><CardError message={saveErr} /></div>}
        {loading ? (
          <ProfileSkeleton />
        ) : editing ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectField
                label="Blood type"
                value={draft.bloodType}
                onChange={(v) => setDraft((p) => ({ ...p, bloodType: v }))}
                options={["", "A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"]}
              />
              <SelectField
                label="Gender"
                value={draft.gender}
                onChange={(v) => setDraft((p) => ({ ...p, gender: v }))}
                options={["", "Male", "Female", "Non-binary", "Prefer not to say"]}
              />
              <SelectField
                label="Smoking status"
                value={draft.smoking}
                onChange={(v) => setDraft((p) => ({ ...p, smoking: v }))}
                options={["", "Non-smoker", "Former smoker", "Current smoker"]}
              />
            </div>
            <Field
              label="Known allergies"
              value={draft.allergies}
              onChange={(v) => setDraft((p) => ({ ...p, allergies: v }))}
              placeholder="e.g. Penicillin, Latex, Peanuts"
            />
            <TextareaField
              label="Chronic conditions"
              value={draft.conditions}
              onChange={(v) => setDraft((p) => ({ ...p, conditions: v }))}
              placeholder="e.g. Type 2 Diabetes, Hypertension — leave blank if none"
            />
            <TextareaField
              label="Other medications (outside prescriptions)"
              value={draft.otherMeds}
              onChange={(v) => setDraft((p) => ({ ...p, otherMeds: v }))}
              placeholder="Supplements or OTC medications your doctor should know about"
            />
          </div>
        ) : (
          <div className="space-y-0.5">
            <InfoRow label="Blood type"         value={profile?.blood_type         ?? ""} />
            <InfoRow label="Gender"             value={profile?.gender             ?? ""} />
            <InfoRow label="Smoking status"     value={profile?.smoking_status     ?? ""} />
            <InfoRow label="Known allergies"    value={profile?.allergies          ?? ""} />
            <InfoRow label="Chronic conditions" value={profile?.chronic_conditions ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Emergency Contact ────────────────────────────────────────

function EmergencyContactCard({
  profile,
  loading,
  onSaved,
}: {
  profile: SettingsProfile | null;
  loading: boolean;
  onSaved: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [draft,   setDraft]   = useState({ name: "", relation: "", phone: "" });

  useEffect(() => {
    if (profile) {
      setDraft({
        name:     profile.emergency_contact_name     ?? "",
        relation: profile.emergency_contact_relation ?? "",
        phone:    profile.emergency_contact_phone    ?? "",
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setDraft({
      name:     profile?.emergency_contact_name     ?? "",
      relation: profile?.emergency_contact_relation ?? "",
      phone:    profile?.emergency_contact_phone    ?? "",
    });
    setSaveErr(null);
    setEditing(true);
  };

  const handleCancel = () => { setEditing(false); setSaveErr(null); };

  const handleSave = async () => {
    setSaving(true);
    setSaveErr(null);
    const result = await updateEmergencyContactAction({
      emergency_contact_name:     draft.name.trim()     || null,
      emergency_contact_relation: draft.relation.trim() || null,
      emergency_contact_phone:    draft.phone.trim()    || null,
    });
    setSaving(false);
    if (result.error) { setSaveErr(result.error); return; }
    await onSaved();
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Emergency Contact</h2>
          <p className="text-xs text-muted-foreground">
            Contacted only in urgent situations
          </p>
        </div>
        <CardActions
          editing={editing}
          saving={saving}
          saved={saved}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <div className="p-6">
        {saveErr && <div className="mb-4"><CardError message={saveErr} /></div>}
        {loading ? (
          <ProfileSkeleton />
        ) : editing ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Contact name"
              value={draft.name}
              onChange={(v) => setDraft((p) => ({ ...p, name: v }))}
              placeholder="Full name"
            />
            <Field
              label="Relationship"
              value={draft.relation}
              onChange={(v) => setDraft((p) => ({ ...p, relation: v }))}
              placeholder="e.g. Spouse, Parent"
            />
            <Field
              label="Phone number"
              value={draft.phone}
              onChange={(v) => setDraft((p) => ({ ...p, phone: v }))}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        ) : (
          <div className="space-y-0.5">
            <InfoRow label="Contact name" value={profile?.emergency_contact_name     ?? ""} />
            <InfoRow label="Relationship" value={profile?.emergency_contact_relation ?? ""} />
            <InfoRow label="Phone"        value={profile?.emergency_contact_phone    ?? ""} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────

const NOTIFICATION_GROUPS = [
  {
    label: "Appointments",
    items: [
      { id: "appt_reminder_24h",  label: "24-hour appointment reminder",  defaultValue: true  },
      { id: "appt_reminder_1h",   label: "1-hour appointment reminder",   defaultValue: true  },
      { id: "appt_confirmation",  label: "Booking confirmations",          defaultValue: true  },
      { id: "appt_cancelled",     label: "Cancellations and changes",      defaultValue: true  },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "lab_ready",           label: "Lab results ready",             defaultValue: true  },
      { id: "prescription_refill", label: "Prescription refill reminders", defaultValue: true  },
      { id: "medication_reminder", label: "Daily medication reminders",    defaultValue: false },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing_receipt", label: "Payment receipts",   defaultValue: true  },
      { id: "billing_invoice", label: "New invoices",        defaultValue: true  },
      { id: "security_login",  label: "New sign-in alerts",  defaultValue: true  },
      { id: "newsletter",      label: "Health tips & news",  defaultValue: false },
    ],
  },
];

const DEFAULT_PREFS = Object.fromEntries(
  NOTIFICATION_GROUPS.flatMap((g) => g.items.map((item) => [item.id, item.defaultValue]))
);

function NotificationsTab({
  savedPrefs,
}: {
  savedPrefs: Record<string, boolean> | null;
}) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    savedPrefs ? { ...DEFAULT_PREFS, ...savedPrefs } : DEFAULT_PREFS
  );
  const [channels, setChannels] = useState({ email: true, sms: false });
  const [flashId,  setFlashId]  = useState<string | null>(null);
  const [, startTransition]     = useTransition();

  // Sync when savedPrefs arrive
  useEffect(() => {
    if (savedPrefs) setPrefs({ ...DEFAULT_PREFS, ...savedPrefs });
  }, [savedPrefs]);

  const persistPrefs = (next: Record<string, boolean>) => {
    startTransition(async () => {
      await updateNotificationPreferencesAction(next);
    });
  };

  const togglePref = (id: string) => {
    const next = { ...prefs, [id]: !prefs[id] };
    setPrefs(next);
    persistPrefs(next);
    setFlashId(id);
    setTimeout(() => setFlashId(null), 1200);
  };

  const toggleChannel = (key: "email" | "sms") => {
    setChannels((p) => ({ ...p, [key]: !p[key] }));
    setFlashId(key);
    setTimeout(() => setFlashId(null), 1200);
  };

  return (
    <div className="space-y-4">

      {/* Delivery channels */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Delivery Channels</h2>
          <p className="text-xs text-muted-foreground">
            Choose how you receive notifications
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            {
              key: "email" as const,
              label: "Email",
              sub: "Sent to your account email address",
              icon: <Mail className="size-4 text-muted-foreground" />,
            },
            {
              key: "sms" as const,
              label: "SMS",
              sub: "Text messages to your registered phone number",
              icon: <MessageSquare className="size-4 text-muted-foreground" />,
            },
          ].map((ch) => (
            <div key={ch.key} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                  {ch.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{ch.label}</p>
                  <p className="text-[11px] text-muted-foreground">{ch.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {flashId === ch.key && (
                  <span className="text-[10px] font-medium text-vault-positive">Saved</span>
                )}
                <Toggle
                  checked={channels[ch.key]}
                  onChange={() => toggleChannel(ch.key)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification types */}
      {NOTIFICATION_GROUPS.map((group) => (
        <div key={group.label} className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
          </div>
          <div className="divide-y divide-border/50">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-5 py-3.5"
              >
                <p className="text-sm text-foreground">{item.label}</p>
                <div className="flex items-center gap-2.5">
                  {flashId === item.id && (
                    <span className="text-[10px] font-medium text-vault-positive">Saved</span>
                  )}
                  <Toggle
                    checked={prefs[item.id]}
                    onChange={() => togglePref(item.id)}
                  />
                </div>
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [passwordSaved,    setPasswordSaved]    = useState(false);
  const [pwError,          setPwError]          = useState<string | null>(null);
  const [showCurrent,      setShowCurrent]      = useState(false);
  const [showNew,          setShowNew]          = useState(false);
  const [twoFa,            setTwoFa]            = useState(false);
  const [pwFields,         setPwFields]         = useState({ current: "", newPw: "", confirm: "" });

  const handleSavePassword = async () => {
    setPwError(null);
    setSaving(true);
    const result = await updatePasswordAction({
      newPassword:     pwFields.newPw,
      confirmPassword: pwFields.confirm,
    });
    setSaving(false);
    if (result.error) { setPwError(result.error); return; }
    setPasswordSaved(true);
    setPwFields({ current: "", newPw: "", confirm: "" });
    setTimeout(() => {
      setPasswordSaved(false);
      setShowPasswordForm(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">

      {/* Password */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Password</h2>
            <p className="text-xs text-muted-foreground">
              {showPasswordForm
                ? "Enter your current password to confirm the change"
                : "Use a strong, unique password you don't reuse elsewhere"}
            </p>
          </div>
          {!showPasswordForm && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => { setShowPasswordForm(true); setPwError(null); }}
            >
              Change
            </Button>
          )}
        </div>

        {showPasswordForm && (
          <div className="space-y-4 p-6">
            {pwError && <CardError message={pwError} />}
            <PasswordField
              label="Current password"
              value={pwFields.current}
              onChange={(v) => setPwFields((p) => ({ ...p, current: v }))}
              show={showCurrent}
              setShow={setShowCurrent}
            />
            <PasswordField
              label="New password"
              value={pwFields.newPw}
              onChange={(v) => setPwFields((p) => ({ ...p, newPw: v }))}
              show={showNew}
              setShow={setShowNew}
            />
            <Field
              label="Confirm new password"
              value={pwFields.confirm}
              onChange={(v) => setPwFields((p) => ({ ...p, confirm: v }))}
              type="password"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => { setShowPasswordForm(false); setPwError(null); setPwFields({ current: "", newPw: "", confirm: "" }); }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 min-w-36 gap-1.5 text-xs"
                onClick={handleSavePassword}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : passwordSaved ? (
                  <>
                    <Check className="size-3" />
                    Updated
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Two-factor authentication */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Two-Factor Authentication
          </h2>
          <p className="text-xs text-muted-foreground">
            Add a second layer of security to your account
          </p>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Authenticator app</p>
            <p className="text-[11px] text-muted-foreground">
              {twoFa
                ? "2FA is active — your account is protected"
                : "Not configured — we recommend enabling this"}
            </p>
          </div>
          {twoFa ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                Enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setTwoFa(false)}
              >
                Disable
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-7 text-xs"
              onClick={() => setTwoFa(true)}
            >
              Set up
            </Button>
          )}
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Active Sessions</h2>
          <p className="text-xs text-muted-foreground">
            Sign out from devices you no longer use
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            {
              icon: <Laptop2 className="size-4 text-muted-foreground" />,
              device: "Chrome · Windows",
              detail: "Your current session · Now",
              current: true,
            },
            {
              icon: <Smartphone className="size-4 text-muted-foreground" />,
              device: "Safari · iPhone",
              detail: "Last active · 2 hours ago",
              current: false,
            },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                  {session.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{session.device}</p>
                  <p className="text-[11px] text-muted-foreground">{session.detail}</p>
                </div>
              </div>
              {session.current ? (
                <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                  Current
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-vault-negative hover:bg-vault-negative-light"
                >
                  Sign out
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-vault-negative/20 bg-vault-negative-light/20 p-5">
        <h3 className="mb-1 text-sm font-semibold text-vault-negative">Danger Zone</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Permanently delete your account and all associated health records. This cannot be
          undone.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="border-vault-negative/30 text-xs text-vault-negative hover:bg-vault-negative-light"
        >
          Delete my account
        </Button>
      </div>
    </div>
  );
}

// ─── Shared form components ─────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-muted/60"
      }`}
    >
      <span
        className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  defaultValue = "",
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  const controlled = value !== undefined;
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        value={controlled ? value : undefined}
        defaultValue={!controlled ? defaultValue : undefined}
        onChange={controlled ? (e) => onChange?.(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || "Select…"}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors hover:text-foreground"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}
