"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context";

// ─── Types ─────────────────────────────────────────────────────

type Tab = "profile" | "notifications" | "security";

// ─── Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useUser();
  const [tab, setTab] = useState<Tab>("profile");

  const displayName =
    user.user_metadata?.full_name || user.user_metadata?.name || "";
  const email = user.email ?? "";

  const initials = displayName
    ? displayName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

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
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <span className="text-xs font-bold text-primary">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {displayName || "Your Name"}
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
                  {tab === item.id && (
                    <ChevronRight className="ml-auto size-3.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-border/60 p-2">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-vault-negative transition-colors hover:bg-vault-negative-light">
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
          {tab === "profile"       && <ProfileTab name={displayName} email={email} initials={initials} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security"      && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────

function ProfileTab({ name, email, initials }: { name: string; email: string; initials: string }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-2xl font-bold text-primary">{initials}</span>
              </div>
              <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/50">
                <Camera className="size-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{name || "Your Name"}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
                Upload photo
              </Button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"      defaultValue={name}   />
            <Field label="Email address"  defaultValue={email}   type="email" disabled />
            <Field label="Phone number"   placeholder="+1 (555) 000-0000" />
            <Field label="Date of birth"  type="date" />
          </div>
        </div>
      </div>

      {/* Medical Profile */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Medical Profile</h2>
          <p className="text-xs text-muted-foreground">Shared with Dr. Jack to personalise your care</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SelectField
              label="Blood type"
              options={["", "A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"]}
            />
            <SelectField
              label="Gender"
              options={["", "Male", "Female", "Non-binary", "Prefer not to say"]}
            />
            <SelectField
              label="Smoking status"
              options={["", "Non-smoker", "Former smoker", "Current smoker"]}
            />
          </div>
          <Field label="Known allergies" placeholder="e.g. Penicillin, Latex, Peanuts" />
          <TextareaField
            label="Chronic conditions"
            placeholder="e.g. Type 2 Diabetes, Hypertension — leave blank if none"
          />
          <TextareaField
            label="Current medications (outside prescriptions)"
            placeholder="Any supplements or OTC medications Dr. Jack should know about"
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
            <Field label="Contact name"  placeholder="Full name"        />
            <Field label="Relationship"  placeholder="e.g. Spouse"      />
            <Field label="Phone number"  placeholder="+1 (555) 000-0000" />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button
          className="gap-2 min-w-35"
          style={{ background: "var(--primary)" }}
          onClick={handleSave}
        >
          {saved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────

const NOTIFICATION_GROUPS = [
  {
    label: "Appointments",
    items: [
      { id: "appt_reminder_24h",  label: "24-hour appointment reminder", defaultValue: true  },
      { id: "appt_reminder_1h",   label: "1-hour appointment reminder",  defaultValue: true  },
      { id: "appt_confirmation",  label: "Booking confirmations",         defaultValue: true  },
      { id: "appt_cancelled",     label: "Cancellations and changes",     defaultValue: true  },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "lab_ready",           label: "Lab results ready",            defaultValue: true  },
      { id: "prescription_refill", label: "Prescription refill reminders",defaultValue: true  },
      { id: "medication_reminder", label: "Daily medication reminders",   defaultValue: false },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing_receipt",  label: "Payment receipts",   defaultValue: true  },
      { id: "billing_invoice",  label: "New invoices",        defaultValue: true  },
      { id: "security_login",   label: "New sign-in alerts",  defaultValue: true  },
      { id: "newsletter",       label: "Health tips & news",  defaultValue: false },
    ],
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((g) => g.items.map((item) => [item.id, item.defaultValue]))
    )
  );

  const [channels, setChannels] = useState({ email: true, sms: false });

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
            { key: "email" as const, label: "Email notifications", icon: <Mail className="size-4 text-muted-foreground" /> },
            { key: "sms"   as const, label: "SMS notifications",   icon: <MessageSquare className="size-4 text-muted-foreground" /> },
          ].map((ch) => (
            <div key={ch.key} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                  {ch.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{ch.label}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {ch.key === "email" ? "Sent to your account email" : "Text messages to your registered number"}
                  </p>
                </div>
              </div>
              <Toggle
                checked={channels[ch.key]}
                onChange={() => setChannels((p) => ({ ...p, [ch.key]: !p[ch.key] }))}
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
                  checked={prefs[item.id]}
                  onChange={() =>
                    setPrefs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                />
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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [twoFa,       setTwoFa]       = useState(false);

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
          <PasswordField label="Current password" show={showCurrent} setShow={setShowCurrent} />
          <PasswordField label="New password"     show={showNew}     setShow={setShowNew}     />
          <Field label="Confirm new password" type="password" />
          <div className="flex justify-end">
            <Button className="min-w-40" style={{ background: "var(--primary)" }}>
              Update password
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
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-foreground">Authenticator app</p>
            <p className="text-[11px] text-muted-foreground">
              {twoFa ? "2FA is active — your account is protected" : "Not configured — we recommend enabling this"}
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
              style={{ background: "var(--primary)" }}
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
              location: "Your current session",
              time: "Now",
              current: true,
            },
            {
              icon: <Smartphone className="size-4 text-muted-foreground" />,
              device: "Safari · iPhone",
              location: "Last active",
              time: "2 hours ago",
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
                  <p className="text-[11px] text-muted-foreground">
                    {session.location} &middot; {session.time}
                  </p>
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
          Permanently delete your account and all associated health records. This cannot be undone.
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

// ─── Shared components ──────────────────────────────────────────

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
  defaultValue = "",
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  defaultValue?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
      />
    </div>
  );
}

function SelectField({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <select className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt || `Select…`}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({ label, placeholder }: { label: string; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <textarea
        rows={2}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      />
    </div>
  );
}

function PasswordField({
  label,
  show,
  setShow,
}: {
  label: string;
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
