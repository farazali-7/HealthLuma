"use client";

import { useState, useMemo } from "react";
import {
  Clock,
  MapPin,
  Plus,
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  X,
  CreditCard,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ─────────────────────────────────────────────────────

type AppointmentStatus = "upcoming" | "completed" | "cancelled";

interface Appointment {
  id: string;
  day: string;
  month: string;
  weekday: string;
  time: string;
  type: string;
  status: AppointmentStatus;
  notes?: string;
}

// ─── Static Data ────────────────────────────────────────────────

const APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    day: "15",
    month: "Mar",
    weekday: "Sunday",
    time: "10:30 AM",
    type: "Follow-up",
    status: "upcoming",
  },
  {
    id: "2",
    day: "1",
    month: "Apr",
    weekday: "Wednesday",
    time: "11:00 AM",
    type: "Annual Checkup",
    status: "upcoming",
  },
  {
    id: "3",
    day: "18",
    month: "Apr",
    weekday: "Saturday",
    time: "9:30 AM",
    type: "Prescription Review",
    status: "upcoming",
  },
  {
    id: "4",
    day: "10",
    month: "Feb",
    weekday: "Tuesday",
    time: "9:00 AM",
    type: "Follow-up",
    status: "completed",
    notes:
      "Reviewed lab results. Continue Vitamin D3 supplementation. Recheck in 3 months.",
  },
  {
    id: "5",
    day: "22",
    month: "Jan",
    weekday: "Thursday",
    time: "2:00 PM",
    type: "Consultation",
    status: "completed",
  },
  {
    id: "6",
    day: "8",
    month: "Jan",
    weekday: "Thursday",
    time: "11:00 AM",
    type: "Annual Checkup",
    status: "cancelled",
    notes: "Rescheduled — rebooked for April 1.",
  },
];

const STATUS_FILTERS = ["All", "Upcoming", "Completed", "Cancelled"] as const;
type FilterOption = (typeof STATUS_FILTERS)[number];

// ─── Booking Flow Constants ──────────────────────────────────────

const APPOINTMENT_TYPES = [
  { id: "followup",     label: "Follow-up",          duration: "30 min" },
  { id: "consultation", label: "New Consultation",    duration: "30 min" },
  { id: "checkup",      label: "Annual Checkup",      duration: "60 min" },
  { id: "prescription", label: "Prescription Review", duration: "15 min" },
] as const;

const MORNING_SLOTS    = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
const AFTERNOON_SLOTS  = ["2:00 PM", "2:30 PM", "3:00 PM",  "3:30 PM",  "4:00 PM",  "4:30 PM"];
const BOOKED_SLOTS     = new Set(["9:30 AM", "10:30 AM", "3:00 PM", "4:00 PM"]);

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

// ─── Calendar helpers ────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Booking Modal ───────────────────────────────────────────────

function BookingModal({ onClose, onBooked }: { onClose: () => void; onBooked: () => void }) {
  const [step, setStep]               = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState(APPOINTMENT_TYPES[0]);
  const [viewDate, setViewDate]         = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const year     = viewDate.getFullYear();
  const month    = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay    = getFirstDayOfMonth(year, month);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isDayDisabled = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    // Sundays unavailable, past dates disabled
    return d < today || d.getDay() === 0;
  };

  const isSelected = (day: number) =>
    !!selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === month &&
    selectedDate.getFullYear() === year;

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === month &&
    today.getFullYear() === year;

  const stepLabel = step === 1 ? "Select Date"
    : step === 2 ? "Choose Time"
    : step === 3 ? "Confirm & Pay"
    : "Confirmed";

  const stepSub = step === 1 ? "Dr. Jack · Family Medicine"
    : step === 2 ? selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) ?? ""
    : step === 3 ? "Review your appointment details"
    : "";

  function handleConfirm() {
    setStep(4);
    onBooked();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={step === 4 ? onClose : undefined}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[460px] rounded-t-3xl sm:rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 px-5 pt-5 pb-4">
          <div>
            {step < 4 && (
              <div className="flex gap-1 mb-2">
                {([1, 2, 3] as const).map((s) => (
                  <div
                    key={s}
                    className={`h-0.5 rounded-full transition-all duration-300 ${
                      s < step  ? "bg-primary/40 w-5"
                      : s === step ? "bg-primary w-8"
                      : "bg-muted w-5"
                    }`}
                  />
                ))}
              </div>
            )}
            <h2
              className="text-base font-semibold text-foreground"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {stepLabel}
            </h2>
            {stepSub && (
              <p className="mt-0.5 text-[12px] text-muted-foreground">{stepSub}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors -mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto">

          {/* ── Step 1: Calendar ── */}
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-semibold text-foreground">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const disabled = isDayDisabled(day);
                  const selected = isSelected(day);
                  const todayMark = isToday(day);
                  return (
                    <button
                      key={day}
                      disabled={disabled}
                      onClick={() => setSelectedDate(new Date(year, month, day))}
                      className={`relative flex items-center justify-center rounded-lg aspect-square text-sm font-medium transition-all ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : todayMark && !selected
                          ? "ring-1 ring-inset ring-primary/40 text-primary hover:bg-primary/5"
                          : disabled
                          ? "text-muted-foreground/25 cursor-not-allowed"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      {day}
                      {!disabled && !selected && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-vault-positive opacity-50" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-vault-positive" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground/25" />
                  Unavailable
                </span>
                <span className="flex items-center gap-1.5 ml-auto text-muted-foreground/60 italic">
                  Sundays closed
                </span>
              </div>
            </div>
          )}

          {/* ── Step 2: Time + Type ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Visit type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {APPOINTMENT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-all ${
                        selectedType.id === type.id
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <span className={`text-[12px] font-semibold ${selectedType.id === type.id ? "text-primary" : "text-foreground"}`}>
                        {type.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        {type.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Morning
                </p>
                <div className="grid grid-cols-3 gap-1.5 mb-5">
                  {MORNING_SLOTS.map((slot) => {
                    const booked   = BOOKED_SLOTS.has(slot);
                    const selected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg px-2 py-2 text-[12px] font-medium transition-all ${
                          selected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : booked
                            ? "bg-muted/20 text-muted-foreground/30 cursor-not-allowed line-through"
                            : "border border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2.5">
                  Afternoon
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {AFTERNOON_SLOTS.map((slot) => {
                    const booked   = BOOKED_SLOTS.has(slot);
                    const selected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg px-2 py-2 text-[12px] font-medium transition-all ${
                          selected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : booked
                            ? "bg-muted/20 text-muted-foreground/30 cursor-not-allowed line-through"
                            : "border border-border bg-card text-foreground hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm ── */}
          {step === 3 && selectedDate && selectedSlot && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-[11px] font-bold text-primary">
                    DJ
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Dr. Jack</p>
                    <p className="text-[11px] text-muted-foreground">Family Medicine & General Practice</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Date</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-foreground">
                      {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Time</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-foreground">{selectedSlot}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Type</p>
                    <p className="mt-0.5 text-[12px] font-semibold text-foreground">{selectedType.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground border-t border-border/60 pt-3">
                  <MapPin className="size-3 shrink-0" />
                  Suite 204, Medical Arts Building
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Payment method
                </p>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                    <CreditCard className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">•••• •••• •••• 4242</p>
                    <p className="text-[11px] text-muted-foreground">Expires 08 / 28</p>
                  </div>
                  <span className="rounded-full bg-vault-positive-light px-2 py-0.5 text-[10px] font-semibold text-vault-positive">
                    Default
                  </span>
                </div>
              </div>

              {/* Price breakdown */}
              <div className="rounded-xl border border-border/60 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Consultation fee</span>
                  <span className="font-medium text-foreground tabular-nums">$100.00</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-4 py-3 text-sm font-semibold">
                  <span className="text-foreground">Total due today</span>
                  <span className="text-foreground tabular-nums">$100.00</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && selectedDate && selectedSlot && (
            <div className="py-2 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-vault-positive-light">
                <Check className="size-7 text-vault-positive" strokeWidth={2.5} />
              </div>
              <h3
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Appointment confirmed
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {selectedSlot}
              </p>

              <div className="mt-5 rounded-xl border border-border bg-muted/20 p-4 text-left space-y-2.5">
                {[
                  ["Doctor",   "Dr. Jack"],
                  ["Type",     selectedType.label],
                  ["Location", "Suite 204, Medical Arts Building"],
                  ["Total charged", "$100.00"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] text-muted-foreground">
                A confirmation email has been sent to your inbox.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border/60 px-5 py-4 flex gap-2.5">
          {step === 1 && (
            <>
              <Button variant="outline" size="sm" className="h-9 flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-9 flex-1"
                disabled={!selectedDate}
                onClick={() => setStep(2)}
              >
                Continue
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button variant="outline" size="sm" className="h-9 flex-1" onClick={() => { setStep(1); setSelectedSlot(null); }}>
                <ArrowLeft className="size-3.5 mr-1" />
                Back
              </Button>
              <Button
                size="sm"
                className="h-9 flex-1"
                disabled={!selectedSlot}
                onClick={() => setStep(3)}
              >
                Continue
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button variant="outline" size="sm" className="h-9 flex-1" onClick={() => setStep(2)}>
                <ArrowLeft className="size-3.5 mr-1" />
                Back
              </Button>
              <Button size="sm" className="h-9 flex-1 gap-1.5" onClick={handleConfirm}>
                <CreditCard className="size-3.5" />
                Pay $100
              </Button>
            </>
          )}
          {step === 4 && (
            <Button size="sm" className="h-9 w-full" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [filter, setFilter]         = useState<FilterOption>("All");
  const [search, setSearch]         = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return APPOINTMENTS.filter((a) => {
      const matchesStatus = filter === "All" || a.status === filter.toLowerCase();
      if (!q) return matchesStatus;
      const matchesSearch =
        a.type.toLowerCase().includes(q) ||
        a.month.toLowerCase().includes(q) ||
        a.weekday.toLowerCase().includes(q) ||
        a.day.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [filter, search]);

  const upcomingCount  = APPOINTMENTS.filter((a) => a.status === "upcoming").length;
  const completedCount = APPOINTMENTS.filter((a) => a.status === "completed").length;
  const nextAppt       = APPOINTMENTS.find((a) => a.status === "upcoming");

  return (
    <>
      <div className="space-y-6 px-4 py-7 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Appointments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Dr. Jack · Family Medicine &amp; General Practice
            </p>
          </div>
          <Button
            className="shrink-0 gap-2 self-start sm:self-auto"
            onClick={() => setBookingOpen(true)}
          >
            <Plus className="size-4" />
            Book Appointment
          </Button>
        </div>

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Upcoming",  value: String(upcomingCount),  accent: false },
            { label: "Completed", value: String(completedCount), accent: false },
            {
              label: "Next visit",
              value: nextAppt ? `${nextAppt.month} ${nextAppt.day}` : "—",
              accent: true,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl border p-4 ${
                stat.accent
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {stat.label}
              </p>
              <p
                className={`mt-1.5 text-2xl font-semibold tracking-tight ${
                  stat.accent ? "text-primary" : "text-foreground"
                }`}
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Search + Filter Row ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by type, month, or date…"
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow sm:w-72"
            />
          </div>

          {/* Status tabs */}
          <div className="flex w-fit items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        <div className="space-y-2.5">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-border bg-card px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {search.trim()
                  ? `No appointments matching "${search.trim()}".`
                  : "No appointments in this category."}
              </p>
            </div>
          )}
          {filtered.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              onReschedule={() => setBookingOpen(true)}
            />
          ))}
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          onBooked={() => {}}
        />
      )}
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────

function AppointmentCard({
  appt,
  onReschedule,
}: {
  appt: Appointment;
  onReschedule: () => void;
}) {
  const isUpcoming  = appt.status === "upcoming";
  const isCompleted = appt.status === "completed";

  return (
    <div
      className={`rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${
        isUpcoming ? "border-border" : "border-border/50"
      }`}
    >
      <div className="flex gap-4 p-5">

        {/* Date block */}
        <div
          className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-xl border py-3 ${
            isUpcoming
              ? "border-primary/20 bg-primary/5"
              : isCompleted
              ? "border-vault-positive/20 bg-vault-positive-light"
              : "border-border bg-muted/30"
          }`}
        >
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isUpcoming   ? "text-primary/70"
              : isCompleted ? "text-vault-positive/70"
              : "text-muted-foreground"
            }`}
          >
            {appt.month}
          </span>
          <span
            className={`text-xl font-bold leading-none ${
              isUpcoming   ? "text-primary"
              : isCompleted ? "text-vault-positive"
              : "text-muted-foreground/60"
            }`}
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {appt.day}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {appt.type}
                </span>
                <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Dr. Jack
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3 shrink-0" />
                  {appt.weekday}, {appt.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  Suite 204, Medical Arts Building
                </span>
              </div>
            </div>

            <StatusBadge status={appt.status} />
          </div>

          {appt.notes && (
            <p className="mt-2.5 rounded-lg bg-muted/30 px-3 py-2 text-[12px] text-muted-foreground">
              {appt.notes}
            </p>
          )}

          {isUpcoming && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={onReschedule}
              >
                <RotateCcw className="size-3" />
                Reschedule
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  if (status === "upcoming") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
        <span className="size-1.5 rounded-full bg-primary" />
        Upcoming
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-positive-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-positive">
        <CheckCircle2 className="size-3" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-vault-negative-light px-2.5 py-0.5 text-[10px] font-semibold text-vault-negative">
      <XCircle className="size-3" />
      Cancelled
    </span>
  );
}
