"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const BENEFITS = [
  {
    label: "35% off every consultation",
    sub: "Every visit drops from $100 → $65. For your entire family.",
  },
  {
    label: "Priority booking slots",
    sub: "Skip the queue. Your family is always first in line.",
  },
  {
    label: "Same-day urgent booking",
    sub: "When your child is sick at 10 PM, you get seen today.",
  },
  {
    label: "Up to 9 family members covered",
    sub: "You, spouse, up to 6 children, and 2 parents. One plan.",
  },
  {
    label: "Advanced AI health assistant",
    sub: "Unlimited symptom guidance, prescription lookups & pre-visit advice.",
  },
  {
    label: "Prescription archive & health records",
    sub: "Every visit, prescription, and report in one place. Forever.",
  },
];

const COMPARISON = [
  { label: "Consultation cost",     standard: "$100 / visit", pro: "$65 / visit" },
  { label: "Booking priority",      standard: "Standard",     pro: "Priority" },
  { label: "Same-day urgent slots", standard: "—",            pro: "✓ Included" },
  { label: "Family coverage",       standard: "1 person",     pro: "Up to 9" },
  { label: "AI health assistant",   standard: "Basic",        pro: "Advanced" },
  { label: "Annual cost",           standard: "Pay per visit", pro: "$150 / year" },
];

interface Props {
  onClose: () => void;
}

export default function FamilyPlanModal({ onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        background: "rgba(10, 20, 15, 0.6)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "modal-backdrop-in 0.25s ease both",
      }}
    >
      <style>{`
        @keyframes modal-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modal-sheet-in {
          from { opacity: 0; transform: translateY(24px) scale(0.975); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .fpm-benefit:hover { background: rgba(196,151,90,0.06) !important; }
        .fpm-close:hover { background: rgba(255,255,255,0.1) !important; color: #E8E5DE !important; }
        .fpm-row-pro { color: #4D9A7F; font-weight: 600; }
        .fpm-row-std { color: #5A7A6A; }
      `}</style>

      <div
        style={{
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90svh",
          overflowY: "auto",
          background: "#0D1612",
          borderRadius: "24px",
          border: "1px solid rgba(196,151,90,0.18)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,151,90,0.08) inset",
          animation: "modal-sheet-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
          position: "relative",
          scrollbarWidth: "none",
        }}
      >
        {/* ── Top accent line ── */}
        <div style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, #C4975A 0%, #4D9A7F 60%, transparent 100%)",
          borderRadius: "24px 24px 0 0",
          zIndex: 1,
        }} />

        {/* ── Close button ── */}
        <button
          onClick={onClose}
          className="fpm-close"
          aria-label="Close"
          style={{
            position: "absolute",
            top: "18px",
            right: "18px",
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            background: "rgba(255,255,255,0.06)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6B8A7F",
            transition: "background 0.15s, color 0.15s",
            zIndex: 2,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div style={{ padding: "32px 36px 36px" }}>
          {/* ── Header ── */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "999px",
              background: "rgba(196,151,90,0.1)",
              border: "1px solid rgba(196,151,90,0.22)",
              marginBottom: "14px",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#C4975A">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#C4975A",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
              }}>
                Most Popular Plan
              </span>
            </div>

            <h2 style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(26px, 4vw, 34px)",
              fontWeight: "700",
              color: "#E8E5DE",
              letterSpacing: "-0.03em",
              lineHeight: "1.15",
              marginBottom: "10px",
            }}>
              Family Care Pro
            </h2>

            <p style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              color: "#6B8A7F",
              lineHeight: "1.65",
              maxWidth: "480px",
            }}>
              One membership. Every family member covered. Better care at a lower cost — all year, with no limits or hidden fees.
            </p>
          </div>

          {/* ── Pricing callout ── */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "16px",
            padding: "20px 24px",
            borderRadius: "16px",
            background: "rgba(196,151,90,0.07)",
            border: "1px solid rgba(196,151,90,0.16)",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
                <span style={{ fontSize: "18px", color: "#C4975A", fontFamily: "var(--font-dm-sans)", fontWeight: "600", marginTop: "6px" }}>$</span>
                <span style={{
                  fontSize: "54px",
                  fontFamily: "var(--font-playfair)",
                  fontWeight: "700",
                  color: "#E8E5DE",
                  lineHeight: "1",
                  letterSpacing: "-0.04em",
                }}>150</span>
                <span style={{ fontSize: "14px", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)", marginBottom: "8px", alignSelf: "flex-end" }}>/year</span>
              </div>
              <div style={{ fontSize: "13px", color: "#8A9D95", fontFamily: "var(--font-dm-sans)", marginTop: "4px" }}>
                That's $12.50/month — less than one co-pay
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "rgba(77,154,127,0.08)",
                border: "1px solid rgba(77,154,127,0.15)",
              }}>
                <div style={{ fontSize: "12px", color: "#4D9A7F", fontFamily: "var(--font-dm-sans)", fontWeight: "600", marginBottom: "4px" }}>
                  Example savings
                </div>
                <div style={{ fontSize: "13px", color: "#8A9D95", fontFamily: "var(--font-dm-sans)", lineHeight: "1.6" }}>
                  Family of 4 × 6 visits/year<br/>
                  <span style={{ color: "#E8E5DE", fontWeight: "600" }}>Save $210</span> vs standard pricing
                </div>
              </div>
            </div>
          </div>

          {/* ── Benefits ── */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#4D9A7F",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              What's included
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {BENEFITS.map((b) => (
                <div
                  key={b.label}
                  className="fpm-benefit"
                  style={{
                    display: "flex",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    background: "transparent",
                    transition: "background 0.15s",
                    cursor: "default",
                  }}
                >
                  <div style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(77,154,127,0.15)",
                    border: "1px solid rgba(77,154,127,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="#4D9A7F" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{
                      fontSize: "13.5px",
                      fontWeight: "600",
                      color: "#D4CEC4",
                      fontFamily: "var(--font-dm-sans)",
                      lineHeight: "1.3",
                      marginBottom: "2px",
                    }}>
                      {b.label}
                    </div>
                    <div style={{
                      fontSize: "12px",
                      color: "#5A7A6A",
                      fontFamily: "var(--font-dm-sans)",
                      lineHeight: "1.5",
                    }}>
                      {b.sub}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Comparison table ── */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#4D9A7F",
              fontFamily: "var(--font-dm-sans)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}>
              Standard vs Family Care Pro
            </div>
            <div style={{
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}>
              {/* Header row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                background: "rgba(255,255,255,0.04)",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                {["", "Standard", "Family Care Pro"].map((h, i) => (
                  <div key={i} style={{
                    fontSize: "11px",
                    fontWeight: "700",
                    color: i === 2 ? "#C4975A" : "#4D5E55",
                    fontFamily: "var(--font-dm-sans)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    textAlign: i === 0 ? "left" : "center",
                  }}>{h}</div>
                ))}
              </div>
              {COMPARISON.map((row, i) => (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "11px 16px",
                    borderBottom: i < COMPARISON.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                  }}
                >
                  <div style={{ fontSize: "12.5px", color: "#6B8A7F", fontFamily: "var(--font-dm-sans)" }}>{row.label}</div>
                  <div className="fpm-row-std" style={{ fontSize: "12.5px", fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>{row.standard}</div>
                  <div className="fpm-row-pro" style={{ fontSize: "12.5px", fontFamily: "var(--font-dm-sans)", textAlign: "center" }}>{row.pro}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTAs ── */}
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link
              href="/signup?plan=family"
              style={{
                flex: "2 1 180px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "15px 24px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #C4975A 0%, #B8843E 100%)",
                color: "#0D1612",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "15px",
                fontWeight: "700",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                boxShadow: "0 4px 20px rgba(196,151,90,0.35)",
                transition: "box-shadow 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(196,151,90,0.5)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(196,151,90,0.35)";
                (e.currentTarget as HTMLElement).style.transform = "none";
              }}
            >
              Join Family Plan — $150/yr
            </Link>

            <Link
              href="/book"
              onClick={onClose}
              style={{
                flex: "1 1 140px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "15px 20px",
                borderRadius: "14px",
                background: "transparent",
                color: "#8A9D95",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                fontWeight: "500",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.1)",
                letterSpacing: "-0.01em",
                transition: "border-color 0.18s, color 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                (e.currentTarget as HTMLElement).style.color = "#D4CEC4";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.color = "#8A9D95";
              }}
            >
              Book Appointment
            </Link>
          </div>

          {/* ── Footnote ── */}
          <p style={{
            marginTop: "16px",
            fontSize: "12px",
            color: "#3D5244",
            fontFamily: "var(--font-dm-sans)",
            textAlign: "center",
            lineHeight: "1.6",
          }}>
            Cancel anytime · No contracts · Instant activation
          </p>
        </div>
      </div>
    </div>
  );
}
