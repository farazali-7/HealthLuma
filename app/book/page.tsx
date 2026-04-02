"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Static calendar data ──────────────────────────────────────────
const CALENDAR_DAYS = [
  { day: "Mon", date: 10, slots: 3 },
  { day: "Tue", date: 11, slots: 0 },
  { day: "Wed", date: 12, slots: 5 },
  { day: "Thu", date: 13, slots: 2 },
  { day: "Fri", date: 14, slots: 4 },
  { day: "Sat", date: 15, slots: 1 },
];

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "2:00 PM",  "2:30 PM",
  "3:00 PM",  "3:30 PM",  "4:00 PM",  "4:30 PM",
];

const SERVICE_TYPES = [
  { icon: "🩺", label: "General Consultation", price: "$100", duration: "30 min" },
  { icon: "⚡", label: "Urgent Care",          price: "$100", duration: "15 min" },
  { icon: "🔬", label: "Follow-up Visit",      price: "$80",  duration: "20 min" },
];

// ─── Background Booking UI (decorative, non-interactive) ───────────
function AppointmentBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#F5F7F5",
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* Subtle grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(26,92,68,0.045) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main booking layout — blurred + dimmed */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "72px",
          filter: "blur(3px)",
          opacity: 0.45,
          transform: "scale(1.01)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            padding: "32px 24px",
            display: "grid",
            gridTemplateColumns: "280px 1fr 300px",
            gap: "20px",
          }}
        >
          {/* ── Left: Doctor card + service type ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Doctor card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid #E2EAE4",
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "14px" }}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #1A5C44, #4D9A7F)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    flexShrink: 0,
                  }}
                >
                  👨‍⚕️
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-playfair)", fontSize: "15px", fontWeight: "700", color: "#0F2218" }}>
                    Dr. Emily Carter
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)", marginTop: "2px" }}>
                    General Practitioner
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginTop: "5px", alignItems: "center" }}>
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i} style={{ color: "#C4975A", fontSize: "11px" }}>{s}</span>
                    ))}
                    <span style={{ fontSize: "11px", color: "#8A9D95", fontFamily: "var(--font-dm-sans)", marginLeft: "3px" }}>4.9</span>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["Family Medicine", "Urgent Care", "Preventive"].map(tag => (
                  <span key={tag} style={{
                    padding: "3px 9px",
                    borderRadius: "999px",
                    background: "#EBF5EF",
                    color: "#1A5C44",
                    fontSize: "11px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "500",
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Service type selector */}
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #E2EAE4" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Service Type
              </div>
              {SERVICE_TYPES.map((s, i) => (
                <div key={s.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: `1.5px solid ${i === 0 ? "#1A5C44" : "#E2EAE4"}`,
                  background: i === 0 ? "#EBF5EF" : "transparent",
                  marginBottom: "6px",
                }}>
                  <span style={{ fontSize: "16px" }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#0F2218", fontFamily: "var(--font-dm-sans)" }}>{s.label}</div>
                    <div style={{ fontSize: "11px", color: "#8A9D95", fontFamily: "var(--font-dm-sans)" }}>{s.duration}</div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#1A5C44", fontFamily: "var(--font-dm-sans)" }}>{s.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Center: Calendar ── */}
          <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "24px", border: "1px solid #E2EAE4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div style={{ fontFamily: "var(--font-playfair)", fontSize: "17px", fontWeight: "700", color: "#0F2218" }}>
                March 2026
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#F0F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>←</div>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#F0F5F2", display: "flex", alignItems: "center", justifyContent: "center" }}>→</div>
              </div>
            </div>

            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "600", color: "#8A9D95", fontFamily: "var(--font-dm-sans)", padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {/* Empty cells for offset */}
              {[...Array(6)].map((_, i) => <div key={`e${i}`} />)}
              {[...Array(31)].map((_, i) => {
                const d = i + 1;
                const isSelected = d === 12;
                const isToday = d === 10;
                const hasSlots = [12, 14, 17, 19, 21, 24, 26].includes(d);
                const isPast = d < 10;
                return (
                  <div key={d} style={{
                    aspectRatio: "1",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "10px",
                    background: isSelected ? "#1A5C44" : isToday ? "#EBF5EF" : "transparent",
                    border: isToday && !isSelected ? "1.5px solid #4D9A7F" : "1.5px solid transparent",
                    opacity: isPast ? 0.3 : 1,
                    cursor: isPast ? "default" : "pointer",
                    position: "relative",
                  }}>
                    <span style={{ fontSize: "13px", fontWeight: isSelected ? "700" : "400", color: isSelected ? "#fff" : "#0F2218", fontFamily: "var(--font-dm-sans)" }}>{d}</span>
                    {hasSlots && !isSelected && (
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#4D9A7F", marginTop: "2px" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E2EAE4" }}>
              {[["#4D9A7F","Available"],["#E2EAE4","Unavailable"],["#1A5C44","Selected"]].map(([color, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "11px", color: "#8A9D95", fontFamily: "var(--font-dm-sans)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Time slots + summary ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Time slots */}
            <div style={{ background: "#FFFFFF", borderRadius: "16px", padding: "16px", border: "1px solid #E2EAE4" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Available Slots — Wed 12
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {TIME_SLOTS.map((slot, i) => (
                  <div key={slot} style={{
                    padding: "8px",
                    borderRadius: "8px",
                    border: `1.5px solid ${i === 2 ? "#1A5C44" : "#E2EAE4"}`,
                    background: i === 2 ? "#1A5C44" : "#FAFCFB",
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: i === 2 ? "#fff" : "#304A3A",
                    fontFamily: "var(--font-dm-sans)",
                  }}>
                    {slot}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: "#0F2218", borderRadius: "16px", padding: "18px", color: "#E8E5DE" }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Summary
              </div>
              {[
                ["Doctor", "Dr. Emily Carter"],
                ["Service", "General Consultation"],
                ["Date", "Wednesday, March 12"],
                ["Time", "10:00 AM"],
                ["Duration", "30 minutes"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)" }}>{label}</span>
                  <span style={{ fontSize: "12px", color: "#E8E5DE", fontFamily: "var(--font-dm-sans)", fontWeight: "500" }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "10px", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#C4975A", fontFamily: "var(--font-dm-sans)", fontWeight: "600" }}>Total</span>
                <span style={{ fontSize: "18px", color: "#FFFFFF", fontFamily: "var(--font-playfair)", fontWeight: "700" }}>$100</span>
              </div>
              <div style={{
                marginTop: "14px",
                padding: "13px",
                borderRadius: "12px",
                background: "rgba(26,92,68,0.5)",
                textAlign: "center",
                fontSize: "14px",
                fontWeight: "600",
                color: "#A8D4BF",
                fontFamily: "var(--font-dm-sans)",
              }}>
                Confirm Booking →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay gradient to darken background slightly */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(245,247,245,0.3) 0%, rgba(232,238,234,0.7) 100%)",
        }}
      />
    </div>
  );
}

// ─── Auth Overlay Card ─────────────────────────────────────────────
function AuthOverlayCard() {
  const [hoveredBtn, setHoveredBtn] = useState<"create" | "login" | null>(null);
  const router = useRouter();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "auth-card-in 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "24px",
          padding: "40px 36px 32px",
          boxShadow:
            "0 32px 80px rgba(15,34,24,0.16), 0 8px 24px rgba(15,34,24,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Close button */}
        <button
          onClick={() => router.back()}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "30px",
            height: "30px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#8A9D95",
            transition: "background 0.15s, color 0.15s",
            zIndex: 1,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#F0F5F2";
            (e.currentTarget as HTMLElement).style.color = "#0F2218";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#8A9D95";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, #1A5C44 0%, #4D9A7F 50%, #C4975A 100%)",
          }}
        />

        {/* Logo mark */}
        <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "28px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              background: "linear-gradient(135deg, #1A5C44 0%, #2E7D5E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(26,92,68,0.3)",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 13 13" fill="none">
              <rect x="5"  y="1" width="3" height="11" rx="1.2" fill="white"/>
              <rect x="1"  y="5" width="11" height="3" rx="1.2" fill="white"/>
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "18px",
              fontWeight: "700",
              color: "#0F2218",
              letterSpacing: "-0.025em",
            }}
          >
            HealthLuma
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "26px",
            fontWeight: "700",
            color: "#0F2218",
            letterSpacing: "-0.03em",
            lineHeight: "1.2",
            marginBottom: "10px",
          }}
        >
          Book Your Appointment
        </h1>

        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "14.5px",
            color: "#5A7A6A",
            lineHeight: "1.6",
            marginBottom: "28px",
          }}
        >
          Sign in or create an account to schedule your consultation with our doctor.
        </p>

        {/* Preview badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            borderRadius: "12px",
            background: "#EBF5EF",
            border: "1px solid #C3DACA",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#4D9A7F",
              flexShrink: 0,
              animation: "pulse-dot 2s ease-in-out infinite",
            }}
          />
          <span
            style={{
              fontSize: "12.5px",
              color: "#1A5C44",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: "500",
            }}
          >
            5 slots available today · Next: 9:00 AM
          </span>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <Link
            href="/signup"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 24px",
              borderRadius: "14px",
              background: hoveredBtn === "create"
                ? "#154D3A"
                : "linear-gradient(135deg, #1A5C44 0%, #1E6B50 100%)",
              color: "#FFFFFF",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              boxShadow: hoveredBtn === "create"
                ? "0 6px 20px rgba(26,92,68,0.4)"
                : "0 3px 12px rgba(26,92,68,0.28)",
              transition: "background 0.18s, box-shadow 0.18s, transform 0.18s",
              transform: hoveredBtn === "create" ? "translateY(-1px)" : "none",
            }}
            onMouseEnter={() => setHoveredBtn("create")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <line x1="12" y1="3" x2="12" y2="1"/>
              <line x1="14" y1="3" x2="16" y2="1"/>
            </svg>
            Create Account — It's Free
          </Link>

          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "14px 24px",
              borderRadius: "14px",
              background: hoveredBtn === "login" ? "#F0F5F2" : "#F7FAF8",
              color: "#1A5C44",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              fontWeight: "600",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              border: "1.5px solid",
              borderColor: hoveredBtn === "login" ? "#4D9A7F" : "#C3DACA",
              transition: "background 0.18s, border-color 0.18s",
            }}
            onMouseEnter={() => setHoveredBtn("login")}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Log in to Continue
          </Link>
        </div>

      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────
export default function BookPage() {
  return (
    <>
      <style>{`
        @keyframes auth-card-in {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Blurred booking UI behind */}
      <AppointmentBackground />

      {/* Auth gate in front */}
      <AuthOverlayCard />
    </>
  );
}
