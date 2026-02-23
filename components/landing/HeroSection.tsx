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

      <div
        className="hl-container hl-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          alignItems: "center",
          width: "100%",
          padding: "80px 24px",
        }}
      >
        {/* ── Left Column ── */}
        <div>
          {/* Doctor badge */}
          <div
            className="hl-fade-1"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "rgba(24, 92, 69, 0.06)",
              border: "1px solid rgba(24, 92, 69, 0.14)",
              borderRadius: "9999px",
              padding: "7px 18px",
              marginBottom: "32px",
            }}
          >
            <BadgeCheck
              size={14}
              color="#185C45"
              strokeWidth={2}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                color: "#476355",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "500",
                letterSpacing: "0.01em",
              }}
            >
              Dr. Jack Harrison ·{" "}
              <span style={{ color: "#162920" }}>Private Family Practice</span>
            </span>
          </div>

          {/* Headline */}
          <h1
            className="hl-fade-2"
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(40px, 5vw, 64px)",
              fontWeight: "800",
              lineHeight: "1.08",
              letterSpacing: "-0.03em",
              color: "#162920",
              marginBottom: "24px",
            }}
          >
            Care That Works
            <br />
            for Your{" "}
            <span
              style={{
                color: "#185C45",
                position: "relative",
                display: "inline-block",
              }}
            >
              Whole Family.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="hl-fade-3"
            style={{
              color: "#476355",
              fontSize: "17px",
              lineHeight: "1.7",
              maxWidth: "510px",
              marginBottom: "40px",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            Book Dr. Jack online in 60 seconds. See live availability, pay
            transparently, and with the Pro plan — priority access, 20% off
            every visit, and your whole family covered under one account.
          </p>

          {/* CTAs */}
          <div
            className="hl-fade-4"
            style={{
              display: "flex",
              gap: "14px",
              flexWrap: "wrap",
              marginBottom: "36px",
            }}
          >
            <a
              href="#"
              className="hl-btn-primary"
              style={{ fontSize: "16px", padding: "16px 36px" }}
            >
              Book an Appointment
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
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
              style={{ fontSize: "16px", padding: "16px 32px" }}
            >
              See the Pro Plan
            </a>
          </div>

          {/* Trust signals — 3 items */}
          <div
            className="hl-fade-5"
            style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}
          >
            {[
              { Icon: Shield, text: "Secure payments" },
              { Icon: Clock, text: "Instant confirmation" },
              { Icon: BadgeCheck, text: "Free to register" },
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
                <Icon
                  size={13}
                  color="rgba(24, 92, 69, 0.6)"
                  strokeWidth={1.75}
                  style={{ flexShrink: 0 }}
                />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column — Floating Product Cards ── */}
        <div
          className="hl-hero-cards"
          style={{ position: "relative", height: "500px" }}
        >
          {/* Subtle glow */}
          <div
            className="hl-fade-6"
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 55% 50%, rgba(24, 92, 69, 0.05) 0%, transparent 68%)",
              pointerEvents: "none",
            }}
          />

          {/* Card A — Appointment Confirmed */}
          <div
            className="hl-float-a hl-fade-6"
            style={{
              position: "absolute",
              top: "40px",
              right: "0",
              width: "310px",
              background: "#FFFFFF",
              border: "1px solid rgba(208, 212, 209, 0.9)",
              borderRadius: "22px",
              padding: "22px",
              boxShadow:
                "0 24px 64px rgba(22, 41, 32, 0.1), 0 4px 16px rgba(22, 41, 32, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "11px",
                  background: "rgba(24, 92, 69, 0.08)",
                  border: "1px solid rgba(24, 92, 69, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#185C45"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div
                  style={{
                    color: "#162920",
                    fontSize: "14px",
                    fontWeight: "600",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  Appointment Confirmed
                </div>
                <div
                  style={{
                    color: "#476355",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                    marginTop: "3px",
                  }}
                >
                  Pediatric Consultation · Dr. Jack
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(208, 212, 209, 0.7)",
                paddingTop: "14px",
              }}
            >
              <span
                style={{
                  color: "#476355",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Mon, Mar 3 · 10:00 AM
              </span>
              <span
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  color: "#16a34a",
                  fontSize: "11px",
                  fontWeight: "600",
                  fontFamily: "var(--font-dm-sans)",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                }}
              >
                ✓ Confirmed
              </span>
            </div>
          </div>

          {/* Card B — Pro Plan indicator */}
          <div
            className="hl-float-b hl-fade-6"
            style={{
              position: "absolute",
              bottom: "48px",
              left: "0",
              width: "285px",
              background: "#FFFFFF",
              border: "1px solid rgba(24, 92, 69, 0.14)",
              borderRadius: "22px",
              padding: "20px",
              boxShadow:
                "0 24px 64px rgba(22, 41, 32, 0.1), 0 4px 16px rgba(22, 41, 32, 0.06)",
            }}
          >
            {/* Pro badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "rgba(24, 92, 69, 0.08)",
                    border: "1px solid rgba(24, 92, 69, 0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-playfair)",
                    fontSize: "12px",
                    fontWeight: "700",
                    color: "#185C45",
                  }}
                >
                  JK
                </div>
                <div>
                  <div
                    style={{
                      color: "#162920",
                      fontSize: "13px",
                      fontWeight: "600",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    James K.
                  </div>
                  <div
                    style={{
                      color: "#476355",
                      fontSize: "11px",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    Family Care Pro
                  </div>
                </div>
              </div>
              <span
                style={{
                  background: "rgba(24, 92, 69, 0.08)",
                  border: "1px solid rgba(24, 92, 69, 0.16)",
                  color: "#185C45",
                  fontSize: "10px",
                  fontWeight: "700",
                  fontFamily: "var(--font-dm-sans)",
                  letterSpacing: "0.06em",
                  padding: "3px 10px",
                  borderRadius: "9999px",
                }}
              >
                PRO
              </span>
            </div>
            <div
              style={{
                background: "rgba(24, 92, 69, 0.04)",
                border: "1px solid rgba(24, 92, 69, 0.1)",
                borderRadius: "10px",
                padding: "10px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#476355",
                  fontSize: "12px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                This month
              </span>
              <span
                style={{
                  color: "#185C45",
                  fontSize: "13px",
                  fontWeight: "600",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                Saved $40 · 2 visits
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
