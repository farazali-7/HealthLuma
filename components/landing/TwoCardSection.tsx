import { Check } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const STANDARD_FEATURES = [
  "Real-time slot availability",
  "Secure online payment",
  "Instant confirmation + calendar invite",
  "Cancel or reschedule up to 24h before",
];

const PRO_FEATURES = [
  "20% off every consultation",
  "Priority booking — earlier slot access",
  "Family coverage — up to 4 members",
  "Extended AI health companion",
  "Same-day urgent booking",
];

export default function TwoCardSection() {
  return (
    <section
      className="hl-section-surface"
      style={{ padding: "80px 0 100px" }}
    >
      <div className="hl-container">
        {/* Subtle heading */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p
              style={{
                color: "#476355",
                fontSize: "15px",
                fontFamily: "var(--font-dm-sans)",
                letterSpacing: "0.01em",
              }}
            >
              Two ways to get care with Dr. Jack.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards grid */}
        <div
          className="hl-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            maxWidth: "860px",
            margin: "0 auto",
            alignItems: "stretch",
          }}
        >
          {/* ── Card 1: Standard ── */}
          <ScrollReveal>
            <div className="hl-card-standard">
              {/* Label */}
              <div
                style={{
                  color: "#7C9488",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "600",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                Standard
              </div>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "42px",
                    fontWeight: "700",
                    color: "#162920",
                    lineHeight: "1",
                    letterSpacing: "-0.03em",
                  }}
                >
                  $100
                </span>
              </div>
              <div
                style={{
                  color: "#7C9488",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans)",
                  marginBottom: "32px",
                }}
              >
                per consultation · no membership needed
              </div>

              {/* Features */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  marginBottom: "40px",
                  flex: 1,
                }}
              >
                {STANDARD_FEATURES.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <Check
                      size={14}
                      color="#7C9488"
                      strokeWidth={2.5}
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span
                      style={{
                        color: "#476355",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        lineHeight: "1.5",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="/book"
                className="hl-btn-secondary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  display: "flex",
                }}
              >
                Book an Appointment
              </a>
            </div>
          </ScrollReveal>

          {/* ── Card 2: Pro Plan ── */}
          <ScrollReveal delay={150}>
            <div className="hl-card-pro">
              {/* "BEST VALUE" top badge */}
              <div
                style={{
                  position: "absolute",
                  top: "-1px",
                  right: "28px",
                  background: "#C4975A",
                  color: "#FFFFFF",
                  fontSize: "10px",
                  fontWeight: "800",
                  fontFamily: "var(--font-dm-sans)",
                  letterSpacing: "0.12em",
                  padding: "5px 14px",
                  borderRadius: "0 0 10px 10px",
                  boxShadow: "0 2px 10px rgba(196,151,90,0.30)",
                }}
              >
                BEST VALUE
              </div>

              {/* Label */}
              <div
                style={{
                  color: "#185C45",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "600",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: "20px",
                }}
              >
                Family Care Pro
              </div>

              {/* Price */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "6px",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "42px",
                    fontWeight: "700",
                    color: "#162920",
                    lineHeight: "1",
                    letterSpacing: "-0.03em",
                  }}
                >
                  $150
                </span>
                <span
                  style={{
                    color: "#7C9488",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    paddingBottom: "6px",
                  }}
                >
                  / year
                </span>
              </div>
              <div
                style={{
                  color: "#7C9488",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans)",
                  marginBottom: "16px",
                }}
              >
                covers your entire family
              </div>

              {/* Savings pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(24, 92, 69, 0.06)",
                  border: "1px solid rgba(24, 92, 69, 0.14)",
                  borderRadius: "9999px",
                  padding: "4px 14px",
                  color: "#185C45",
                  fontSize: "12px",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "600",
                  marginBottom: "28px",
                }}
              >
                <span
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#185C45",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                Saves $90+ per year at avg. family usage
              </div>

              {/* Features */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "13px",
                  marginBottom: "36px",
                  flex: 1,
                }}
              >
                {PRO_FEATURES.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <Check
                      size={14}
                      color="#185C45"
                      strokeWidth={2.5}
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span
                      style={{
                        color: "#162920",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        lineHeight: "1.5",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="/signup?plan=family"
                className="hl-btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  boxSizing: "border-box",
                  display: "flex",
                  fontSize: "15px",
                  padding: "16px 24px",
                }}
              >
                Get the Pro Plan
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

              {/* Below CTA note */}
              <p
                style={{
                  color: "#7C9488",
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-sans)",
                  textAlign: "center",
                  marginTop: "12px",
                }}
              >
                Annual billing · Cancel anytime
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
