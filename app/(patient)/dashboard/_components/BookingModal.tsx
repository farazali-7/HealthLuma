"use client";

import { useState, useEffect, useTransition } from "react";
import {
  X,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getDoctorsAction,
  getAvailableSlotsAction,
  bookAppointmentAction,
  type DoctorProfile,
  type AppointmentType,
} from "../actions";

// ─── Helpers ─────────────────────────────────────────────────

function formatSlot(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}


function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ─── Constants ───────────────────────────────────────────────

const APPT_TYPES: { value: AppointmentType; label: string; desc: string }[] = [
  { value: "consultation",         label: "New Consultation",      desc: "First-time visit for a new concern"   },
  { value: "follow-up",            label: "Follow-up",             desc: "Continue treatment or review results" },
  { value: "checkup",              label: "Annual Checkup",        desc: "Routine health screening"              },
  { value: "prescription-review",  label: "Prescription Review",   desc: "Renew or adjust medications"          },
];

type Step = "pick" | "confirm" | "success";

// ─── Component ───────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ open, onClose }: Props) {
  // Data
  const [doctors,      setDoctors]      = useState<DoctorProfile[]>([]);
  const [slots,        setSlots]        = useState<string[]>([]);

  // Selections
  const [doctorId,     setDoctorId]     = useState("");
  const [date,         setDate]         = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [apptType,     setApptType]     = useState<AppointmentType>("consultation");
  const [notes,        setNotes]        = useState("");

  // UI state
  const [step,         setStep]         = useState<Step>("pick");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [isPending,    startTransition] = useTransition();

  const today   = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 84 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0]; // 12 weeks out

  // ── Reset + load doctors when modal opens ──
  useEffect(() => {
    if (!open) return;
    setStep("pick");
    setDoctorId("");
    setDate("");
    setSlots([]);
    setSelectedSlot("");
    setApptType("consultation");
    setNotes("");
    setError(null);

    getDoctorsAction().then((docs) => {
      setDoctors(docs);
      // Auto-select when only one doctor in the system
      if (docs.length === 1) setDoctorId(docs[0].id);
    });
  }, [open]);

  // ── Load available slots whenever doctor or date changes ──
  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    setSlotsLoading(true);
    setSelectedSlot("");
    getAvailableSlotsAction(doctorId, date)
      .then(setSlots)
      .finally(() => setSlotsLoading(false));
  }, [doctorId, date]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const canProceed     = !!doctorId && !!date && !!selectedSlot;

  // ── Book ──
  function handleBook() {
    setError(null);
    startTransition(async () => {
      const res = await bookAppointmentAction({
        doctor_id:        doctorId,
        appointment_date: date,
        start_time:       selectedSlot,
        type:             apptType,
        notes:            notes.trim() || undefined,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      setStep("success");
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="size-3.5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Book Appointment</h2>
              {step === "confirm" && selectedDoctor && (
                <p className="text-[10px] text-muted-foreground">
                  {selectedDoctor.full_name} · {formatDate(date)}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ══════════════════════ STEP 1: PICK ══════════════════════ */}
        {step === "pick" && (
          <div className="space-y-5 p-6">

            {/* Doctor picker — only shown when multiple doctors exist */}
            {doctors.length > 1 && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Doctor
                </p>
                <div className="space-y-2">
                  {doctors.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setDoctorId(doc.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                        doctorId === doc.id
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                        {initials(doc.full_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{doc.full_name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {doc.specialty ?? "General Practice"}
                          {doc.clinic_name ? ` · ${doc.clinic_name}` : ""}
                        </p>
                      </div>
                      {doctorId === doc.id && (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date picker */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Date
              </p>
              <input
                type="date"
                min={today}
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Time slot grid — only when doctor + date selected */}
            {doctorId && date && (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Available Times
                </p>

                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    Loading availability…
                  </div>
                ) : slots.length === 0 ? (
                  <div className="rounded-xl border border-border bg-muted/10 py-8 text-center">
                    <Clock className="mx-auto mb-2 size-5 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No slots available on this date.</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/60">Try a different day.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                          selectedSlot === slot
                            ? "border-primary/30 bg-primary text-primary-foreground shadow-sm"
                            : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                        }`}
                      >
                        {formatSlot(slot)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CTA */}
            <div className="flex justify-end pt-1">
              <Button
                disabled={!canProceed}
                onClick={() => setStep("confirm")}
                className="gap-1.5"
              >
                Continue
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════ STEP 2: CONFIRM ══════════════════════ */}
        {step === "confirm" && (
          <div className="space-y-4 p-6">

            {/* Booking summary card */}
            {selectedDoctor && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                  {initials(selectedDoctor.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{selectedDoctor.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(date)} · {formatSlot(selectedSlot)}
                  </p>
                </div>
                <button
                  onClick={() => setStep("pick")}
                  className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-3" />
                  Change
                </button>
              </div>
            )}

            {/* Appointment type */}
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Appointment Type
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {APPT_TYPES.map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setApptType(value)}
                    className={`rounded-xl border px-3.5 py-3 text-left transition-all ${
                      apptType === value
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/20"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${apptType === value ? "text-primary" : "text-foreground"}`}>
                      {label}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Reason{" "}
                <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Briefly describe your concern or what you'd like to discuss…"
                className="w-full resize-none rounded-xl border border-border bg-muted/20 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setStep("pick"); setError(null); }}
              >
                <ChevronLeft className="size-3.5 mr-1" />
                Back
              </Button>
              <Button
                className="ml-auto gap-2"
                disabled={isPending}
                onClick={handleBook}
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {/* ══════════════════════ STEP 3: SUCCESS ══════════════════════ */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-vault-positive-light">
              <CheckCircle2 className="size-7 text-vault-positive" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Appointment Booked</h3>
              {selectedDoctor && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {selectedDoctor.full_name}
                  <br />
                  {formatDate(date)} at {formatSlot(selectedSlot)}
                </p>
              )}
            </div>
            <Button onClick={onClose} className="mt-1">
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
