"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import FamilyPlanModal from "./FamilyPlanModal";

export default function CtaSection() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <FamilyPlanModal onClose={() => setShowModal(false)} />}
    <section
      className="hl-section-surface"
      style={{
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background atmosphere — green + gold dual glow */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(24, 92, 69, 0.07) 0%, transparent 60%)",
          left: "30%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(196, 151, 90, 0.08) 0%, transparent 65%)",
          right: "20%",
          top: "40%",
          transform: "translate(50%, -50%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div className="hl-container" style={{ position: "relative" }}>
        <ScrollReveal>
          <div
            style={{
              textAlign: "center",
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            {/* Gold label */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(196, 151, 90, 0.08)",
                border: "1px solid rgba(196, 151, 90, 0.22)",
                borderRadius: "9999px",
                padding: "5px 16px",
                marginBottom: "28px",
              }}
            >
              <span
                style={{
                  color: "#7A6240",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "700",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                Start today — no waiting room required
              </span>
            </div>

            {/* Headline — punchy, specific, action-driven */}
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(32px, 4.5vw, 58px)",
                fontWeight: "800",
                color: "#162920",
                lineHeight: "1.1",
                letterSpacing: "-0.025em",
                marginBottom: "22px",
              }}
            >
              One login.
              <br />
              Your whole family.
              <br />
              <span style={{ color: "#185C45" }}>Zero phone calls.</span>
            </h2>

            {/* Subheadline */}
            <p
              style={{
                color: "#476355",
                fontSize: "17px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.65",
                maxWidth: "480px",
                margin: "0 auto 40px",
              }}
            >
              Book your first appointment in under 60 seconds.{" "}
              <span style={{ color: "#162920" }}>No phone call.</span> No
              registration hassle. Just care, on your schedule.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "14px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <a
                href="/book"
                className="hl-btn-primary"
                style={{ fontSize: "16px", padding: "17px 42px" }}
              >
                Book Appointment
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <button
                onClick={() => setShowModal(true)}
                className="hl-btn-secondary"
                style={{ fontSize: "16px", padding: "17px 42px", cursor: "pointer" }}
              >
                See Family Plan
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Pricing transparency */}
            <p
              style={{
                color: "#7C9488",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.6",
              }}
            >
              Free to register · $100 per consultation · Family Care: $150/year
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
    </>
  );
}
