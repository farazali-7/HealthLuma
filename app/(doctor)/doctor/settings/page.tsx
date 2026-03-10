"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Clock,
  Bell,
  Shield,
  ChevronRight,
  Check,
  Eye,
  EyeOff,
  LogOut,
  Camera,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tab = "profile" | "clinic" | "schedule" | "notifications" | "security";

// ─── Page ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile",       label: "Profile",       icon: <User className="size-4" /> },
    { id: "clinic",        label: "Clinic",        icon: <Building2 className="size-4" /> },
    { id: "schedule",      label: "Schedule",      icon: <Clock className="size-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
    { id: "security",      label: "Security",      icon: <Shield className="size-4" /> },
  ];

  return (
    <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: "var(--font-playfair)" }}>
          Clinic Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, clinic information, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* Sidebar nav */}
        <nav className="lg:col-span-3">
          <div className="space-y-1 rounded-2xl border border-border bg-card p-2 shadow-sm">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  tab === item.id
                    ? "bg-[#4D9A7F]/10 text-[#4D9A7F]"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <span className={`flex size-7 items-center justify-center rounded-lg ${
                  tab === item.id ? "bg-[#4D9A7F]/15 text-[#4D9A7F]" : "bg-muted/50"
                }`}>
                  {item.icon}
                </span>
                {item.label}
                {tab === item.id && <ChevronRight className="ml-auto size-3.5" />}
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

        {/* Panel */}
        <div className="lg:col-span-9">
          {tab === "profile"       && <ProfileTab />}
          {tab === "clinic"        && <ClinicTab />}
          {tab === "schedule"      && <ScheduleTab />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "security"      && <SecurityTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ───────────────────────────────────────────────

function ProfileTab() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Doctor Profile</h2>
        <p className="text-xs text-muted-foreground">Your professional information visible to patients</p>
      </div>
      <div className="space-y-6 p-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-[#4D9A7F]/10">
              <span className="text-2xl font-bold text-[#4D9A7F]">JH</span>
            </div>
            <button className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-muted/50">
              <Camera className="size-3.5 text-muted-foreground" />
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Dr. Jack Harrison</p>
            <p className="text-xs text-muted-foreground">Family Medicine · GMC #1234567</p>
            <Button variant="outline" size="sm" className="mt-2 h-7 text-xs">Upload photo</Button>
          </div>
        </div>
        {/* Fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"         defaultValue="Dr. Jack Harrison" />
          <Field label="Specialty"          defaultValue="Family Medicine" />
          <Field label="GMC / License No."  defaultValue="1234567" />
          <Field label="Qualifications"     defaultValue="MBBS, MRCGP" />
          <Field label="Contact email"      defaultValue="dr.harrison@healthluma.com" type="email" />
          <Field label="Phone"              defaultValue="+44 20 7946 0123" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Short bio (shown on booking page)</label>
          <textarea
            rows={3}
            defaultValue="Dr. Harrison is a fully registered GP with 12 years of experience in family medicine, chronic disease management, and preventive care."
            className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20"
          />
        </div>
        <div className="flex justify-end">
          <Button
            style={{ background: "#4D9A7F", color: "white" }}
            className="min-w-35 gap-2"
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          >
            {saved ? <><Check className="size-4" />Saved!</> : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Clinic Tab ────────────────────────────────────────────────

function ClinicTab() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Clinic Information</h2>
        <p className="text-xs text-muted-foreground">Shown to patients on their booking confirmations</p>
      </div>
      <div className="space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Clinic name"  defaultValue="HealthLuma Clinic" />
          <Field label="Phone"        defaultValue="+44 20 7946 0100" />
          <div className="sm:col-span-2">
            <Field label="Address line 1" defaultValue="Suite 204, 84 Harley Street" />
          </div>
          <Field label="City"         defaultValue="London" />
          <Field label="Postcode"     defaultValue="W1G 7HW" />
          <div className="sm:col-span-2">
            <Field label="Website"    defaultValue="https://healthluma.com" />
          </div>
        </div>

        {/* Appointment settings */}
        <div className="mt-4 border-t border-border/60 pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Appointment Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Default slot duration</label>
              <select className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20">
                <option>15 minutes</option>
                <option selected>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Buffer between slots</label>
              <select className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20">
                <option>None</option>
                <option selected>5 minutes</option>
                <option>10 minutes</option>
                <option>15 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="border-t border-border/60 pt-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Standard consultation"  defaultValue="100" />
            <Field label="Video consultation"     defaultValue="80" />
            <Field label="Annual membership"      defaultValue="150" />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            style={{ background: "#4D9A7F", color: "white" }}
            className="min-w-35 gap-2"
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          >
            {saved ? <><Check className="size-4" />Saved!</> : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Tab ──────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DEFAULT_HOURS = { open: "09:00", close: "17:30", enabled: true };
const WEEKEND = { open: "09:00", close: "12:00", enabled: false };

function ScheduleTab() {
  const [days, setDays] = useState(
    Object.fromEntries([
      ...DAYS.map((d) => [d, { ...DEFAULT_HOURS }]),
      ["Saturday", { ...WEEKEND }],
      ["Sunday",   { enabled: false, open: "09:00", close: "17:00" }],
    ])
  );

  const toggle = (day: string) =>
    setDays((prev) => ({ ...prev, [day]: { ...prev[day], enabled: !prev[day].enabled } }));

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border/60 px-6 py-4">
        <h2 className="text-sm font-semibold text-foreground">Working Hours</h2>
        <p className="text-xs text-muted-foreground">Set your availability for patient booking</p>
      </div>
      <div className="divide-y divide-border/50">
        {Object.entries(days).map(([day, config]) => (
          <div key={day} className="flex items-center gap-4 px-6 py-3.5">
            <button
              onClick={() => toggle(day)}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${config.enabled ? "bg-[#4D9A7F]" : "bg-muted/60"}`}
            >
              <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${config.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className={`w-24 text-sm font-medium ${config.enabled ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
            {config.enabled ? (
              <div className="flex items-center gap-2">
                <input type="time" defaultValue={config.open}  className="rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm focus:border-[#4D9A7F]/40 focus:outline-none" />
                <span className="text-xs text-muted-foreground">to</span>
                <input type="time" defaultValue={config.close} className="rounded-lg border border-border bg-muted/20 px-3 py-1.5 text-sm focus:border-[#4D9A7F]/40 focus:outline-none" />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end border-t border-border/60 px-6 py-4">
        <Button style={{ background: "#4D9A7F", color: "white" }} className="min-w-35">Save schedule</Button>
      </div>
    </div>
  );
}

// ─── Notifications Tab ─────────────────────────────────────────

const NOTIF_GROUPS = [
  {
    label: "Appointments",
    items: [
      { id: "new_booking",     label: "New booking received",          default: true },
      { id: "cancellation",    label: "Appointment cancellations",     default: true },
      { id: "reschedule",      label: "Rescheduling requests",         default: true },
      { id: "reminder_1h",     label: "1-hour reminders (for doctor)", default: false },
    ],
  },
  {
    label: "Patients",
    items: [
      { id: "new_patient",     label: "New patient registered",        default: true },
      { id: "record_upload",   label: "Patient uploads a document",    default: true },
      { id: "refill_request",  label: "Prescription refill requests",  default: true },
    ],
  },
  {
    label: "Billing",
    items: [
      { id: "payment_received",label: "Payment received",              default: true },
      { id: "invoice_overdue", label: "Invoice overdue alert",         default: true },
      { id: "pro_signup",      label: "New Pro membership signup",     default: true },
    ],
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIF_GROUPS.flatMap((g) => g.items.map((i) => [i.id, i.default])))
  );
  return (
    <div className="space-y-4">
      {NOTIF_GROUPS.map((group) => (
        <div key={group.label} className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">{group.label}</h2>
          </div>
          <div className="divide-y divide-border/50">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-5 py-3.5">
                <p className="text-sm text-foreground">{item.label}</p>
                <button
                  onClick={() => setPrefs((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${prefs[item.id] ? "bg-[#4D9A7F]" : "bg-muted/60"}`}
                >
                  <span className={`inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform ${prefs[item.id] ? "translate-x-4" : "translate-x-0.5"}`} />
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
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Change Password</h2>
        </div>
        <div className="space-y-4 p-6">
          <Field label="Current password" type="password" />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">New password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} placeholder="••••••••" className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Field label="Confirm new password" type="password" />
          <div className="flex justify-end">
            <Button style={{ background: "#4D9A7F", color: "white" }} className="min-w-40">Update password</Button>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-foreground">Active Sessions</h2>
        </div>
        <div className="divide-y divide-border/50">
          {[
            { device: "Chrome on macOS", loc: "London, UK", time: "Now (current)", current: true },
            { device: "Safari on iPhone", loc: "London, UK", time: "3 hours ago", current: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{s.device}</p>
                <p className="text-xs text-muted-foreground">{s.loc} · {s.time}</p>
              </div>
              {s.current ? (
                <span className="rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">Current</span>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs text-vault-negative hover:bg-vault-negative-light">Sign out</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared Field ──────────────────────────────────────────────

function Field({ label, defaultValue = "", placeholder, type = "text" }: {
  label: string; defaultValue?: string; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#4D9A7F]/50 focus:outline-none focus:ring-2 focus:ring-[#4D9A7F]/20 transition-all"
      />
    </div>
  );
}
