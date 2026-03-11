"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Shield, BadgeCheck, Clock } from "lucide-react";
import AIChatButton from "@/components/landing/AIChat";
import FamilyPlanModal from "@/components/landing/FamilyPlanModal";

export default function HeroSection() {
  const [showPill, setShowPill] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowPill(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {showFamilyModal && <FamilyPlanModal onClose={() => setShowFamilyModal(false)} />}

      <section
        className="hl-section-dark"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "15px",
        }}
      >
        {/* Atmospheric glows */}
        <div
          style={{
            position: "absolute",
            width: "900px",
            height: "900px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24, 92, 69, 0.07) 0%, transparent 60%)",
            left: "20%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "480px",
            height: "480px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196, 151, 90, 0.05) 0%, transparent 70%)",
            right: "8%",
            top: "18%",
            pointerEvents: "none",
          }}
        />

        {/* Right half image */}
        <div
          style={{
            position: "absolute",
            top: "220px",
            right: "50px",
            bottom: "100px",
            width: "50%",
            zIndex: 1,
            overflow: "hidden",
            borderRadius: "16px",
          }}
        >
          <Image
            src="/images/shero-doctor.png"
            alt="Doctor"
            fill
            style={{ objectFit: "cover", objectPosition: "15% top" }}
            priority
          />
        </div>

        <div
          className="hl-container hl-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            alignItems: "center",
            width: "100%",
            padding: "80px 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* ── Left Column ── */}
          <div style={{ marginLeft: "-40px" }}>

            {/* Star trust badge — above the fold, first thing seen */}
  

            {/* Eyebrow */}
            <div
              className="hl-fade-1"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(24, 92, 69, 0.06)",
                border: "1px solid rgba(24, 92, 69, 0.14)",
                borderRadius: "9999px",
                padding: "6px 14px",
                marginBottom: "12px",
              }}
            >
              <BadgeCheck size={14} color="#185C45" strokeWidth={2} style={{ flexShrink: 0 }} />
              <span
                style={{
                  color: "#476355",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "500",
                  letterSpacing: "0.01em",
                }}
              >
                Private Family Practice ·{" "}
                <span style={{ color: "#162920", fontWeight: "600" }}>Dr. Jack Harrison</span>
              </span>
            </div>

            {/* Headline — bold, specific, differentiated */}
            <h1
              className="hl-fade-2"
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(44px, 5.8vw, 82px)",
                fontWeight: "800",
                lineHeight: "1.05",
                letterSpacing: "-0.03em",
                color: "#162920",
                marginBottom: "24px",
              }}
            >
              The doctor
              <br />
              you&apos;ll actually{" "}
              <span
                style={{
                  color: "#185C45",
                  position: "relative",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                }}
              >
                reach.
                {/* Underline accent */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "linear-gradient(to right, #C4975A, rgba(196,151,90,0.3))",
                    borderRadius: "2px",
                  }}
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="hl-fade-3"
              style={{
                color: "#476355",
                fontSize: "17px",
                lineHeight: "1.7",
                maxWidth: "460px",
                marginBottom: "10px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Book in under 60 seconds. See live availability,
              transparent pricing, and manage care for your entire family — no phone calls required.
            </p>
            <p
              className="hl-fade-3"
              style={{
                color: "#7C9488",
                fontSize: "14.5px",
                lineHeight: "1.65",
                maxWidth: "440px",
                marginBottom: "36px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              With{" "}
              <span style={{ color: "#185C45", fontWeight: "600" }}>HealthLuma Pro</span>,
              get priority bookings, 20% off every visit, and full family coverage under one account.
            </p>

            {/* CTAs */}
            <div
              className="hl-fade-4"
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "32px" }}
            >
              <a
                href="/book"
                className="hl-btn-primary"
                style={{ fontSize: "15px", padding: "15px 34px" }}
              >
                Book in 60 Seconds
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
                onClick={() => setShowFamilyModal(true)}
                className="hl-btn-secondary"
                style={{ fontSize: "15px", padding: "15px 28px", cursor: "pointer" }}
              >
                See Family Plan
              </button>
            </div>

            {/* Trust signals */}
            <div
              className="hl-fade-5"
              style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
            >
              {[
                { Icon: Clock,      text: "Same-day appointments" },
                { Icon: Shield,     text: "Transparent pricing" },
                { Icon: BadgeCheck, text: "Family accounts supported" },
              ].map(({ Icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#7C9488",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  <Icon size={13} color="rgba(24, 92, 69, 0.7)" strokeWidth={2} style={{ flexShrink: 0 }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column — placeholder (image absolutely positioned) ── */}
          <div />
        </div>
      </section>

      {/* AI Health Assistant sticky button + chat panel */}
      <AIChatButton show={showPill} />
    </>
  );
}
