"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";

const VALUE_CARDS = [
  {
    number: "35%",
    label: "Off Every Visit",
    body: "For you, your spouse, up to 6 children, and both parents. Every consultation. All year. No caps, no limits, no fine print.",
  },
  {
    number: "First",
    label: "In Line, Every Time",
    body: "Priority appointment slots reserved just for members. Plus same-day urgent booking when your family needs care now — not next Tuesday.",
  },
  {
    number: "9+",
    label: "Family Members Covered",
    body: "One membership covers you plus your spouse, up to 6 children, and 2 parents. Book for anyone in your family from one account.",
  },
];

const VISIT_COST = 100;
const MEMBER_COST = 65;
const MEMBERSHIP_FEE = 150;

export default function MembershipSection() {
  const [visits, setVisits] = useState(8);

  const withoutMembership = visits * VISIT_COST;
  const withMembership = visits * MEMBER_COST + MEMBERSHIP_FEE;
  const savings = withoutMembership - withMembership;
  const breakEvenVisits = Math.ceil(MEMBERSHIP_FEE / (VISIT_COST - MEMBER_COST)); // = 8

  return (
    <>
    {/* Gold divider — intentional signal that dark section follows */}
    <hr className="hl-gold-divider" />
    <section
      className="hl-section-dark"
      style={{
        padding: "108px 0",
        background: "#0D1612",
        borderTop: "1px solid rgba(196,151,90,0.12)",
      }}
    >
      <div className="hl-container">
        {/* Section Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="hl-section-label">Family Care Membership</span>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: "700",
                color: "#EDE8E0",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              One Plan. Your Whole Family.{" "}
              <span style={{ color: "#C4975A" }}>$150/year.</span>
            </h2>
            <p
              style={{
                color: "#7D8A85",
                fontSize: "16px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.6",
              }}
            >
              The membership that pays for itself in two visits.
            </p>
          </div>
        </ScrollReveal>

        {/* Value Cards */}
        <div
          className="hl-three-col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "64px",
          }}
        >
          {VALUE_CARDS.map((card, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <div
                style={{
                  background: "#0F1413",
                  border: "1px solid #1E2826",
                  borderRadius: "20px",
                  padding: "40px 32px",
                  textAlign: "center",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "52px",
                    fontWeight: "700",
                    color: "#C4975A",
                    lineHeight: "1",
                    marginBottom: "8px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {card.number}
                </div>
                <div
                  style={{
                    color: "#EDE8E0",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  {card.label}
                </div>
                <p
                  style={{
                    color: "#7D8A85",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.65",
                    margin: 0,
                  }}
                >
                  {card.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Savings Calculator */}
        <ScrollReveal delay={200}>
          <div
            style={{
              background: "#0F1413",
              border: "1px solid #1E2826",
              borderRadius: "24px",
              padding: "48px",
              maxWidth: "720px",
              margin: "0 auto 56px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "36px" }}>
              <h3
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#EDE8E0",
                  marginBottom: "8px",
                }}
              >
                See How Much You Save
              </h3>
              <p
                style={{
                  color: "#7D8A85",
                  fontSize: "14px",
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                How many visits does your family make per year?
              </p>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: "40px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span
                  style={{
                    color: "#7D8A85",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  1 visit/year
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#C4975A",
                  }}
                >
                  {visits}
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#7D8A85",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: "400",
                      marginLeft: "4px",
                    }}
                  >
                    visits/year
                  </span>
                </span>
                <span
                  style={{
                    color: "#7D8A85",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  20 visits/year
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={visits}
                onChange={(e) => setVisits(Number(e.target.value))}
                className="hl-slider"
              />
            </div>

            {/* Comparison */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              {/* Without */}
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.05)",
                  border: "1px solid rgba(239, 68, 68, 0.12)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "#7D8A85",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  Without Membership
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#EDE8E0",
                    marginBottom: "4px",
                  }}
                >
                  ${withoutMembership}
                </div>
                <div
                  style={{
                    color: "#4A5652",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {visits} visits × $100
                </div>
              </div>

              {/* With */}
              <div
                style={{
                  background: "rgba(196, 151, 90, 0.07)",
                  border: "1px solid rgba(196, 151, 90, 0.22)",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    color: "#C4975A",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  With Family Care
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#EDE8E0",
                    marginBottom: "4px",
                  }}
                >
                  ${withMembership}
                </div>
                <div
                  style={{
                    color: "#4A5652",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                  }}
                >
                  {visits} visits × $65 + $150
                </div>
              </div>
            </div>

            {/* Savings Result */}
            <div
              style={{
                borderRadius: "12px",
                padding: "16px 20px",
                background:
                  savings > 0
                    ? "rgba(196, 151, 90, 0.09)"
                    : "rgba(237, 232, 224, 0.03)",
                border:
                  savings > 0
                    ? "1px solid rgba(196, 151, 90, 0.28)"
                    : "1px solid rgba(42, 50, 48, 0.5)",
                textAlign: "center",
              }}
            >
              {savings > 0 ? (
                <p
                  style={{
                    color: "#C4975A",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    margin: 0,
                  }}
                >
                  You save{" "}
                  <span
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "20px",
                    }}
                  >
                    ${savings}
                  </span>{" "}
                  per year with Family Care
                </p>
              ) : (
                <p
                  style={{
                    color: "#7D8A85",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    margin: 0,
                  }}
                >
                  {breakEvenVisits - visits} more visit
                  {breakEvenVisits - visits !== 1 ? "s" : ""} and your
                  membership pays for itself
                </p>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom CTA */}
        <ScrollReveal delay={300}>
          <div style={{ textAlign: "center" }}>
            <a
              href="#"
              className="hl-btn-primary"
              style={{ fontSize: "17px", padding: "18px 44px" }}
            >
              Join Family Care — $150/year
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
            <p
              style={{
                color: "#4A5652",
                fontSize: "12px",
                fontFamily: "var(--font-dm-sans)",
                marginTop: "12px",
              }}
            >
              Annual billing. Cancel anytime — benefits continue until year
              end.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
    <hr className="hl-gold-divider" />
    </>
  );
}
