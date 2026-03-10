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
          <div className="space-y-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
            {(
              [
                { id: "profile", label: "Profile", icon: <User className="size-4" /> },
                { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
                { id: "security", label: "Security", icon: <Shield className="size-4" /> },
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
                  className={`flex size-7 items-center justify-center rounded-lg ${
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

            <div className="mt-2 border-t border-border/60 pt-2">
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
          {tab === "profile" && <ProfileTab name={displayName} email={email} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security" && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────

function ProfileTab({ name, email }: { name: string; email: string }) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Profile Information</h2>
        <p className="text-xs text-muted-foreground">
          Update your personal and contact details
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
              <span className="text-2xl font-bold text-primary">
                {name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/50">
              <Camera className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{name || "Your Name"}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">
              Upload photo
            </Button>
          </div>
        </div>

        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" defaultValue={name} />
          <Field label="Email address" defaultValue={email} type="email" disabled />
          <Field label="Phone number" placeholder="+1 (555) 000-0000" />
          <Field label="Date of birth" type="date" />
          <Field label="Gender" placeholder="Select…" />
          <Field label="Blood type" placeholder="e.g. A+" />
        </div>

        {/* Emergency contact */}
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Emergency Contact
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contact name" placeholder="Full name" />
            <Field label="Relationship" placeholder="e.g. Spouse" />
            <Field label="Phone number" placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            className="gap-2 min-w-[140px]"
            style={{ background: "var(--primary)" }}
            onClick={handleSave}
          >
            {saved ? (
              <>
                <Check className="size-4" />
                Saved!
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────

const NOTIFICATION_GROUPS = [
  {
    label: "Appointments",
    items: [
      { id: "appt_reminder_24h", label: "24-hour appointment reminder", default: true },
      { id: "appt_reminder_1h", label: "1-hour appointment reminder", default: true },
      { id: "appt_confirmation", label: "Booking confirmations", default: true },
      { id: "appt_cancelled", label: "Cancellations and changes", default: true },
    ],
  },
  {
    label: "Health",
    items: [
      { id: "lab_ready", label: "Lab results ready", default: true },
      { id: "prescription_refill", label: "Prescription refill reminders", default: true },
      { id: "medication_reminder", label: "Daily medication reminders", default: false },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing_receipt", label: "Payment receipts", default: true },
      { id: "billing_invoice", label: "New invoices", default: true },
      { id: "security_login", label: "New sign-in alerts", default: true },
      { id: "newsletter", label: "Health tips and updates", default: false },
    ],
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(
      NOTIFICATION_GROUPS.flatMap((g) => g.items.map((item) => [item.id, item.default]))
    )
  );

  return (
    <div className="space-y-4">
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
                <button
                  onClick={() =>
                    setPrefs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    prefs[item.id] ? "bg-primary" : "bg-muted/60"
                  }`}
                >
                  <span
                    className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${
                      prefs[item.id] ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
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
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="space-y-4">
      {/* Change password */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
          <p className="text-xs text-muted-foreground">
            Use a strong password you don&apos;t use elsewhere
          </p>
        </div>
        <div className="space-y-4 p-6">
          <PasswordField label="Current password" show={showCurrent} setShow={setShowCurrent} />
          <PasswordField label="New password" show={showNew} setShow={setShowNew} />
          <Field label="Confirm new password" type="password" />
          <div className="flex justify-end">
            <Button className="min-w-[160px]" style={{ background: "var(--primary)" }}>
              Update password
            </Button>
          </div>
        </div>
      </div>

      {/* Sessions */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Active Sessions</h2>
          <p className="text-xs text-muted-foreground">
            Sign out from devices you no longer use
          </p>
        </div>
        <div className="divide-y divide-border/50">
          {[
            { device: "Chrome on macOS", location: "London, UK", time: "Now (current)", current: true },
            { device: "Safari on iPhone 15", location: "London, UK", time: "2 hours ago", current: false },
          ].map((session, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{session.device}</p>
                <p className="text-xs text-muted-foreground">
                  {session.location} &middot; {session.time}
                </p>
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
          Permanently delete your account and all associated health data. This cannot be undone.
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

// ─── Field helper ──────────────────────────────────────────────

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
