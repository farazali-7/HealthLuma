"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  LogOut,
  Camera,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  Laptop2,
  Smartphone,
  Mail,
  MessageSquare,
  X,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  updateProfileAction,
  updateAvatarUrlAction,
  updateNotificationPreferencesAction,
  updatePasswordAction,
  signOutAction,
  deleteAccountAction,
} from "./actions";
import type { User as DBUser } from "@/lib/supabase/types";

// ─── Types ──────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "security";

// ─── Notification defaults ───────────────────────────────────────

const NOTIFICATION_GROUPS = [
  {
    label: "Appointments",
    items: [
      { id: "appt_reminder_24h",  label: "24-hour appointment reminder", defaultOn: true  },
      { id: "appt_reminder_1h",   label: "1-hour appointment reminder",  defaultOn: true  },
      { id: "appt_confirmation",  label: "Booking confirmations",         defaultOn: true  },
      { id: "appt_cancelled",     label: "Cancellations and changes",     defaultOn: true  },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "lab_ready",           label: "Lab results ready",             defaultOn: true  },
      { id: "prescription_refill", label: "Prescription refill reminders", defaultOn: true  },
      { id: "medication_reminder", label: "Daily medication reminders",    defaultOn: false },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing_receipt", label: "Payment receipts",   defaultOn: true  },
      { id: "billing_invoice", label: "New invoices",        defaultOn: true  },
      { id: "security_login",  label: "New sign-in alerts",  defaultOn: true  },
      { id: "newsletter",      label: "Health tips & news",  defaultOn: false },
    ],
  },
];

// Build default prefs from hardcoded defaults merged with whatever is saved in DB.
function buildInitialPrefs(saved: Record<string, boolean>): Record<string, boolean> {
  const defaults: Record<string, boolean> = {
    channel_email: true,
    channel_sms: false,
    ...Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((g) =>
        g.items.map((item) => [item.id, item.defaultOn])
      )
    ),
  };
  // DB values override defaults for keys that exist
  return { ...defaults, ...saved };
}

// ─── Root component ─────────────────────────────────────────────

export function SettingsClient({
  profile,
  authEmail,
}: {
  profile: DBUser;
  authEmail: string;
}) {
  const [tab, setTab] = useState<Tab>("profile");

  const displayName = profile.full_name ?? "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

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
          Manage your profile, notifications, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Sidebar Nav */}
        <nav className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            {/* User identity strip */}
            <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
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
                  {displayName || "Your Name"}
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{authEmail}</p>
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
                  {tab === item.id && <ChevronRight className="ml-auto size-3.5" />}
                </button>
              ))}
            </div>

            <div className="border-t border-border/60 p-2">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-vault-negative transition-colors hover:bg-vault-negative-light"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-vault-negative-light">
                    <LogOut className="size-4" />
                  </span>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </nav>

        {/* Content Panel */}
        <div className="lg:col-span-9">
          {tab === "profile" && (
            <ProfileTab profile={profile} authEmail={authEmail} initials={initials} />
          )}
          {tab === "notifications" && (
            <NotificationsTab
              initialPrefs={buildInitialPrefs(profile.notification_preferences ?? {})}
            />
          )}
          {tab === "security" && <SecurityTab email={authEmail} />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ─────────────────────────────────────────────────

function ProfileTab({
  profile,
  authEmail,
  initials,
}: {
  profile: DBUser;
  authEmail: string;
  initials: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Start in view mode if the profile already has a name; edit mode for new users.
  const [isEditing, setIsEditing] = useState(!profile.full_name);

  const initialForm = {
    full_name:                   profile.full_name                   ?? "",
    phone:                       profile.phone                       ?? "",
    date_of_birth:               profile.date_of_birth               ?? "",
    blood_type:                  profile.blood_type                  ?? "",
    gender:                      profile.gender                      ?? "",
    smoking_status:              profile.smoking_status              ?? "",
    allergies:                   profile.allergies                   ?? "",
    chronic_conditions:          profile.chronic_conditions          ?? "",
    other_medications:           profile.other_medications           ?? "",
    emergency_contact_name:      profile.emergency_contact_name      ?? "",
    emergency_contact_relation:  profile.emergency_contact_relation  ?? "",
    emergency_contact_phone:     profile.emergency_contact_phone     ?? "",
  };

  const [form, setForm] = useState(initialForm);
  // Snapshot at last successful save — used by Cancel to revert
  const [savedForm, setSavedForm] = useState(initialForm);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function showFeedback(ok: boolean, msg: string) {
    setFeedback({ ok, msg });
    setTimeout(() => setFeedback(null), 3500);
  }

  function handleCancel() {
    setForm(savedForm);
    setIsEditing(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateProfileAction({
        full_name:                   form.full_name.trim()                   || null,
        phone:                       form.phone.trim()                       || null,
        date_of_birth:               form.date_of_birth                      || null,
        blood_type:                  form.blood_type                         || null,
        gender:                      form.gender                             || null,
        smoking_status:              form.smoking_status                     || null,
        allergies:                   form.allergies.trim()                   || null,
        chronic_conditions:          form.chronic_conditions.trim()          || null,
        other_medications:           form.other_medications.trim()           || null,
        emergency_contact_name:      form.emergency_contact_name.trim()      || null,
        emergency_contact_relation:  form.emergency_contact_relation.trim()  || null,
        emergency_contact_phone:     form.emergency_contact_phone.trim()     || null,
      });
      if (result.error) {
        showFeedback(false, result.error);
      } else {
        setSavedForm(form);      // lock in the new saved snapshot
        setIsEditing(false);     // switch back to view mode
        showFeedback(true, "Profile saved successfully");
      }
    });
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showFeedback(false, "Image must be under 5 MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        showFeedback(false, uploadError.message);
        return;
      }

      // Store the storage path in DB — never a public URL
      const result = await updateAvatarUrlAction(filePath);
      if (result.error) {
        showFeedback(false, result.error);
        return;
      }

      // Generate a signed URL (1 h) for immediate in-page display
      const { data: signedData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 3600);
      setAvatarUrl(signedData?.signedUrl ?? "");
      showFeedback(true, "Photo updated");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Personal Information */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
          <p className="text-xs text-muted-foreground">Your name, contact details, and basic profile</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Your avatar"
                  className="size-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/50 disabled:opacity-50"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <Camera className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {form.full_name || "Your Name"}
              </p>
              <p className="text-xs text-muted-foreground">{authEmail}</p>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 h-7 text-xs"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? "Uploading…" : "Upload photo"}
                </Button>
              )}
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledField
              label="Full name"
              value={form.full_name}
              onChange={(v) => set("full_name", v)}
              disabled={!isEditing}
            />
            <ControlledField
              label="Email address"
              value={authEmail}
              type="email"
              disabled
            />
            <ControlledField
              label="Phone number"
              value={form.phone}
              onChange={(v) => set("phone", v)}
              placeholder="+1 (555) 000-0000"
              disabled={!isEditing}
            />
            <ControlledField
              label="Date of birth"
              value={form.date_of_birth}
              onChange={(v) => set("date_of_birth", v)}
              type="date"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Medical Profile */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Medical Profile</h2>
          <p className="text-xs text-muted-foreground">
            Shared with Dr. Jack to personalise your care
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <ControlledSelect
              label="Blood type"
              value={form.blood_type}
              onChange={(v) => set("blood_type", v)}
              options={["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
              disabled={!isEditing}
            />
            <ControlledSelect
              label="Gender"
              value={form.gender}
              onChange={(v) => set("gender", v)}
              options={["", "Male", "Female", "Non-binary", "Prefer not to say"]}
              disabled={!isEditing}
            />
            <ControlledSelect
              label="Smoking status"
              value={form.smoking_status}
              onChange={(v) => set("smoking_status", v)}
              options={["", "Non-smoker", "Former smoker", "Current smoker"]}
              disabled={!isEditing}
            />
          </div>
          <ControlledField
            label="Known allergies"
            value={form.allergies}
            onChange={(v) => set("allergies", v)}
            placeholder="e.g. Penicillin, Latex, Peanuts"
            disabled={!isEditing}
          />
          <ControlledTextarea
            label="Chronic conditions"
            value={form.chronic_conditions}
            onChange={(v) => set("chronic_conditions", v)}
            placeholder="e.g. Type 2 Diabetes, Hypertension — leave blank if none"
            disabled={!isEditing}
          />
          <ControlledTextarea
            label="Current medications (outside prescriptions)"
            value={form.other_medications}
            onChange={(v) => set("other_medications", v)}
            placeholder="Any supplements or OTC medications Dr. Jack should know about"
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Emergency Contact</h2>
          <p className="text-xs text-muted-foreground">Contacted only in urgent situations</p>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <ControlledField
              label="Contact name"
              value={form.emergency_contact_name}
              onChange={(v) => set("emergency_contact_name", v)}
              placeholder="Full name"
              disabled={!isEditing}
            />
            <ControlledField
              label="Relationship"
              value={form.emergency_contact_relation}
              onChange={(v) => set("emergency_contact_relation", v)}
              placeholder="e.g. Spouse"
              disabled={!isEditing}
            />
            <ControlledField
              label="Phone number"
              value={form.emergency_contact_phone}
              onChange={(v) => set("emergency_contact_phone", v)}
              placeholder="+1 (555) 000-0000"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center justify-end gap-3">
        {feedback && (
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              feedback.ok ? "text-vault-positive" : "text-vault-negative"
            }`}
          >
            {feedback.ok ? (
              <Check className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            {feedback.msg}
          </span>
        )}

        {isEditing ? (
          <>
            <Button
              variant="outline"
              className="min-w-24"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="gap-2 min-w-36"
              style={{ background: "var(--primary)" }}
              onClick={handleSave}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="min-w-24"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Notifications Tab ───────────────────────────────────────────

function NotificationsTab({
  initialPrefs,
}: {
  initialPrefs: Record<string, boolean>;
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  function toggle(key: string) {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotificationPreferencesAction(prefs);
      const ok = !result.error;
      setFeedback({
        ok,
        msg: ok ? "Preferences saved" : result.error!,
      });
      setTimeout(() => setFeedback(null), 3000);
    });
  }

  return (
    <div className="space-y-4">
      {/* Delivery channels */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Delivery Channels</h2>
          <p className="text-xs text-muted-foreground">Choose how you receive notifications</p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            {
              key: "channel_email",
              label: "Email notifications",
              sub: "Sent to your account email",
              icon: <Mail className="size-4 text-muted-foreground" />,
            },
            {
              key: "channel_sms",
              label: "SMS notifications",
              sub: "Text messages to your registered number",
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
              <Toggle
                checked={prefs[ch.key] ?? false}
                onChange={() => toggle(ch.key)}
              />
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
                <Toggle
                  checked={prefs[item.id] ?? item.defaultOn}
                  onChange={() => toggle(item.id)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        {feedback && (
          <span
            className={`flex items-center gap-1.5 text-xs font-medium ${
              feedback.ok ? "text-vault-positive" : "text-vault-negative"
            }`}
          >
            {feedback.ok ? (
              <Check className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            {feedback.msg}
          </span>
        )}
        <Button
          className="min-w-36 gap-2"
          style={{ background: "var(--primary)" }}
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save preferences"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Security Tab ────────────────────────────────────────────────

function SecurityTab({ email }: { email: string }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [pwPending, startPwTransition] = useTransition();
  const [pwFeedback, setPwFeedback]   = useState<{ ok: boolean; msg: string } | null>(null);

  // MFA
  const [mfaEnrolled, setMfaEnrolled]   = useState(false);
  const [mfaFactorId, setMfaFactorId]   = useState<string | null>(null);
  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [mfaSecret, setMfaSecret]       = useState("");
  const [mfaCode, setMfaCode]           = useState("");
  const [mfaPending, setMfaPending]     = useState(false);
  const [mfaFeedback, setMfaFeedback]   = useState<string | null>(null);

  // Check MFA enrollment status once on mount
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.mfa.listFactors();
      if (data?.totp && data.totp.length > 0) {
        const verified = data.totp.find((f) => f.status === "verified");
        if (verified) {
          setMfaEnrolled(true);
          setMfaFactorId(verified.id);
        }
      }
    })();
  }, []);

  function showPwFeedback(ok: boolean, msg: string) {
    setPwFeedback({ ok, msg });
    setTimeout(() => setPwFeedback(null), 4000);
  }

  function handlePasswordChange() {
    if (!currentPw) {
      showPwFeedback(false, "Enter your current password");
      return;
    }
    startPwTransition(async () => {
      const supabase = createClient();
      // Re-authenticate with current password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPw,
      });
      if (signInError) {
        showPwFeedback(false, "Current password is incorrect");
        return;
      }
      // Now update to new password
      const result = await updatePasswordAction({
        newPassword: newPw,
        confirmPassword: confirmPw,
      });
      if (result.error) {
        showPwFeedback(false, result.error);
      } else {
        showPwFeedback(true, "Password updated successfully");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    });
  }

  async function handleEnableMfa() {
    setMfaPending(true);
    setMfaFeedback(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "HealthLuma",
      });
      if (error || !data) {
        setMfaFeedback(error?.message ?? "Failed to start MFA setup");
        return;
      }
      setMfaFactorId(data.id);
      setMfaSecret(data.totp.secret);
      setMfaSetupOpen(true);
    } finally {
      setMfaPending(false);
    }
  }

  async function handleVerifyMfa() {
    if (!mfaFactorId || mfaCode.length !== 6) return;
    setMfaPending(true);
    setMfaFeedback(null);
    try {
      const supabase = createClient();
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError) {
        setMfaFeedback(challengeError.message);
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode,
      });
      if (verifyError) {
        setMfaFeedback("Invalid code — please try again");
        return;
      }
      setMfaEnrolled(true);
      setMfaSetupOpen(false);
      setMfaCode("");
    } finally {
      setMfaPending(false);
    }
  }

  async function handleDisableMfa() {
    if (!mfaFactorId) return;
    setMfaPending(true);
    try {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
      setMfaEnrolled(false);
      setMfaFactorId(null);
    } finally {
      setMfaPending(false);
    }
  }

  async function handleSignOutOtherSessions() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "others" });
  }

  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div className="space-y-4">
      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
          <p className="text-xs text-muted-foreground">
            Use a strong, unique password you don&apos;t reuse elsewhere
          </p>
        </div>
        <div className="space-y-4 p-6">
          <PasswordField
            label="Current password"
            value={currentPw}
            onChange={setCurrentPw}
            show={showCurrent}
            setShow={setShowCurrent}
          />
          <PasswordField
            label="New password"
            value={newPw}
            onChange={setNewPw}
            show={showNew}
            setShow={setShowNew}
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPw}
            onChange={setConfirmPw}
            show={showConfirm}
            setShow={setShowConfirm}
          />
          <div className="flex items-center justify-end gap-3">
            {pwFeedback && (
              <span
                className={`flex items-center gap-1.5 text-xs font-medium ${
                  pwFeedback.ok ? "text-vault-positive" : "text-vault-negative"
                }`}
              >
                {pwFeedback.ok ? (
                  <Check className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {pwFeedback.msg}
              </span>
            )}
            <Button
              className="min-w-40 gap-2"
              style={{ background: "var(--primary)" }}
              onClick={handlePasswordChange}
              disabled={pwPending}
            >
              {pwPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Two-factor authentication */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Two-Factor Authentication</h2>
          <p className="text-xs text-muted-foreground">
            Add a second layer of security to your account
          </p>
        </div>

        {/* MFA Setup Modal */}
        {mfaSetupOpen && (
          <div className="border-b border-border/60 bg-muted/20 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Set up authenticator app</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open Google Authenticator, Authy, or 1Password and add a new account manually
                  using the secret key below.
                </p>
              </div>
              <button onClick={() => setMfaSetupOpen(false)}>
                <X className="size-4 text-muted-foreground" />
              </button>
            </div>

            {/* Secret key */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                Secret key
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-muted/40 px-3 py-2 font-mono text-sm tracking-widest text-foreground break-all">
                  {mfaSecret}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(mfaSecret)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted/50 transition-colors"
                  title="Copy secret"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Account name: <strong>HealthLuma</strong> · Email: {email}
              </p>
            </div>

            {/* Verify code */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-36 rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-center font-mono text-sm tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  style={{ background: "var(--primary)" }}
                  onClick={handleVerifyMfa}
                  disabled={mfaPending || mfaCode.length !== 6}
                  className="gap-2"
                >
                  {mfaPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Verify &amp; enable
                </Button>
              </div>
              {mfaFeedback && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-vault-negative">
                  <AlertCircle className="size-3.5" />
                  {mfaFeedback}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Authenticator app</p>
            <p className="text-[11px] text-muted-foreground">
              {mfaEnrolled
                ? "2FA is active — your account is protected"
                : "Not configured — we recommend enabling this"}
            </p>
          </div>
          {mfaEnrolled ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
                Enabled
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={handleDisableMfa}
                disabled={mfaPending}
              >
                {mfaPending ? <Loader2 className="size-3.5 animate-spin" /> : "Disable"}
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs"
              style={{ background: "var(--primary)" }}
              onClick={handleEnableMfa}
              disabled={mfaPending || mfaSetupOpen}
            >
              {mfaPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                "Set up"
              )}
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
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                <Laptop2 className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Current session</p>
                <p className="text-[11px] text-muted-foreground">Active now</p>
              </div>
            </div>
            <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
              Current
            </span>
          </div>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                <Smartphone className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Other devices</p>
                <p className="text-[11px] text-muted-foreground">All other active sessions</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs text-vault-negative hover:bg-vault-negative-light"
              onClick={handleSignOutOtherSessions}
            >
              <RefreshCw className="size-3" />
              Sign out others
            </Button>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-vault-negative/20 bg-vault-negative-light/20 p-5">
        <h3 className="mb-1 text-sm font-semibold text-vault-negative">Danger Zone</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Permanently delete your account and all associated health records. This cannot be
          undone.
        </p>
        {!deleteConfirm ? (
          <Button
            variant="outline"
            size="sm"
            className="border-vault-negative/30 text-xs text-vault-negative hover:bg-vault-negative-light"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-vault-negative">Are you sure?</p>
            <form action={deleteAccountAction}>
              <Button
                type="submit"
                size="sm"
                className="h-7 bg-vault-negative text-xs text-white hover:bg-vault-negative/90"
              >
                Yes, delete
              </Button>
            </form>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared primitives ───────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
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

function ControlledField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={!onChange}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      />
    </div>
  );
}

function ControlledSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
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

function ControlledTextarea({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <textarea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
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
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
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
