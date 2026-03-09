import Image from "next/image";
import { Shield, BadgeCheck, Clock } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="hl-section-dark"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        paddingTop: "72px",
        background: "#FFFFFF",
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
            "radial-gradient(circle, rgba(24, 92, 69, 0.06) 0%, transparent 60%)",
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
            "radial-gradient(circle, rgba(184, 92, 60, 0.04) 0%, transparent 70%)",
          right: "8%",
          top: "18%",
          pointerEvents: "none",
        }}
      />


      {/* Right half image — inset with margin on top, right, bottom */}
      <div
        style={{
          position: "absolute",
          top: "90px",
          right: "50px",
          bottom: "40px",
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
              marginBottom: "28px",
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

          {/* Headline */}
          <h1
            className="hl-fade-2"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(38px, 4.8vw, 62px)",
              fontWeight: "800",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              color: "#162920",
              marginBottom: "20px",
            }}
          >
            Healthcare Made Simple
            <br />
            for Your{" "}
            <span style={{ color: "#185C45", position: "relative", display: "inline-block" }}>
              Family.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="hl-fade-3"
            style={{
              color: "#476355",
              fontSize: "16px",
              lineHeight: "1.75",
              maxWidth: "480px",
              marginBottom: "12px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Book an appointment in under 60 seconds. See live availability,
            transparent pricing, and manage care for your entire family in one place.
          </p>
          <p
            className="hl-fade-3"
            style={{
              color: "#7C9488",
              fontSize: "14.5px",
              lineHeight: "1.65",
              maxWidth: "460px",
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
              href="#"
              className="hl-btn-primary"
              style={{ fontSize: "15px", padding: "14px 32px" }}
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
            <a
              href="#"
              className="hl-btn-secondary"
              style={{ fontSize: "15px", padding: "14px 28px" }}
            >
              Explore Pro Plan
            </a>
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

        {/* ── Right Column — empty placeholder (image is absolutely positioned on section) ── */}
        <div />
      </div>
    </section>
  );
}
