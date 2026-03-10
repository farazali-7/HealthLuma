"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";
import FamilyPlanModal from "@/components/landing/FamilyPlanModal";

const STANDARD_FEATURES = [
  "Same-week appointment slots",
  "30-minute general consultations",
  "15-minute follow-up visits",
  "Digital prescription delivery",
  "Appointment history & records",
  "AI health assistant (10 queries/mo)",
  "Secure video or in-person visits",
];

const PRO_FEATURES = [
  "Everything in Standard",
  "20% discount on all consultations",
  "Priority booking — first access to new slots",
  "Unlimited family member coverage",
  "Unlimited AI assistant queries",
  "Dedicated appointment reminders",
  "Annual wellness review included",
];

const COMPARISON = [
  { feature: "General Consultation", standard: "$100", pro: "$80" },
  { feature: "Follow-Up Visit", standard: "$60", pro: "$48" },
  { feature: "Pediatric Consultation", standard: "$100", pro: "$80" },
  { feature: "Priority Booking", standard: "—", pro: "Included" },
  { feature: "Family Members", standard: "Self only", pro: "Unlimited" },
  { feature: "AI Health Assistant", standard: "10 / month", pro: "Unlimited" },
  { feature: "Annual Wellness Review", standard: "—", pro: "Included" },
];

const FAQS = [
  {
    q: "Does the Family Care Pro plan cover every member automatically?",
    a: "Yes. Once you subscribe, you can add family members from your dashboard. Each member gets their own booking access, appointment history, and AI assistant access. There's no per-member fee.",
  },
  {
    q: "Is the 20% Pro discount applied automatically?",
    a: "Yes. When you book while logged in as a Pro member, the discounted rate is applied at checkout. You'll always see the final price before confirming.",
  },
  {
    q: "Can I cancel the annual plan?",
    a: "You can cancel anytime. Your Pro benefits remain active through the end of your billing period. We don't prorate refunds, but we don't auto-renew without a reminder either.",
  },
  {
    q: "What if I only need one consultation a year?",
    a: "The Standard plan makes more sense. The Family Care Pro plan breaks even after roughly 2 consultations per year — only upgrade if you expect to use the clinic regularly.",
  },
  {
    q: "Is payment processed securely?",
    a: "All payments are processed via Stripe. HealthLuma never stores your card details. Invoices are available from your patient dashboard.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="hl-page">
      <Navbar />
      {showModal && <FamilyPlanModal onClose={() => setShowModal(false)} />}
      <main>

        {/* ── Hero ─────────────────────────────────── */}
        <section
          style={{
            background: "#FFFFFF",
            paddingTop: "120px",
            paddingBottom: "80px",
          }}
        >
          <div className="hl-container">
            <ScrollReveal>
              <div style={{ maxWidth: "600px" }}>
                <span className="hl-section-label">Pricing</span>
                <h1
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(32px, 5vw, 54px)",
                    fontWeight: "700",
                    color: "#162920",
                    lineHeight: "1.1",
                    letterSpacing: "-0.03em",
                    marginTop: "14px",
                    marginBottom: "20px",
                  }}
                >
                  Honest pricing.
                  <br />
                  <span style={{ color: "#1A5C44" }}>Nothing hidden.</span>
                </h1>
                <p
                  style={{
                    color: "#476355",
                    fontSize: "16px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  Pay per visit, or upgrade to Family Care Pro for year-round
                  coverage at a discount. Prices are published — no surprises
                  at checkout.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Pricing cards ────────────────────────── */}
        <section style={{ background: "#F8FAF8", padding: "0 0 100px", borderTop: "1px solid #EAF0EA" }}>
          <div className="hl-container" style={{ paddingTop: "64px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                maxWidth: "860px",
                margin: "0 auto",
              }}
              className="hl-two-col"
            >
              {/* Standard Card */}
              <ScrollReveal>
                <div
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #E4EBE6",
                    borderRadius: "20px",
                    padding: "36px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#7C9488",
                      marginBottom: "12px",
                    }}
                  >
                    Standard
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "42px",
                        fontWeight: "700",
                        color: "#162920",
                        letterSpacing: "-0.04em",
                        lineHeight: "1",
                      }}
                    >
                      $100
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#7C9488" }}>
                      / visit
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: "#476355",
                      lineHeight: "1.6",
                      marginBottom: "28px",
                      paddingBottom: "28px",
                      borderBottom: "1px solid #EAF0EA",
                    }}
                  >
                    Pay per consultation. No subscription required. Right for
                    patients who visit occasionally.
                  </p>

                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                    {STANDARD_FEATURES.map((f, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "14px",
                          color: "#476355",
                          lineHeight: "1.5",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#4D9A7F"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/book"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#162920",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: "600",
                      fontSize: "15px",
                      padding: "14px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      marginTop: "auto",
                    }}
                  >
                    Book Appointment
                  </a>
                </div>
              </ScrollReveal>

              {/* Pro Card */}
              <ScrollReveal delay={120}>
                <div
                  style={{
                    background: "#0D1A13",
                    border: "1px solid rgba(196,151,90,0.25)",
                    borderRadius: "20px",
                    padding: "36px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Subtle glow */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-40px",
                      right: "-40px",
                      width: "180px",
                      height: "180px",
                      borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(196,151,90,0.12) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Most popular badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "24px",
                      right: "24px",
                      background: "rgba(196,151,90,0.15)",
                      border: "1px solid rgba(196,151,90,0.3)",
                      borderRadius: "8px",
                      padding: "4px 10px",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "10px",
                      fontWeight: "700",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "#C4975A",
                    }}
                  >
                    Best Value
                  </div>

                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "11px",
                      fontWeight: "700",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(196,151,90,0.7)",
                      marginBottom: "12px",
                    }}
                  >
                    Family Care Pro
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "42px",
                        fontWeight: "700",
                        color: "#E8E5DE",
                        letterSpacing: "-0.04em",
                        lineHeight: "1",
                      }}
                    >
                      $150
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "rgba(232,229,222,0.4)" }}>
                      / year
                    </span>
                  </div>

                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      color: "rgba(232,229,222,0.55)",
                      lineHeight: "1.6",
                      marginBottom: "28px",
                      paddingBottom: "28px",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    Full family coverage, year-round priority access, and AI
                    assistant — all under one annual plan.
                  </p>

                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "32px" }}>
                    {PRO_FEATURES.map((f, i) => (
                      <li
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "14px",
                          color: i === 0 ? "rgba(232,229,222,0.45)" : "#E8E5DE",
                          lineHeight: "1.5",
                          fontStyle: i === 0 ? "italic" : "normal",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={i === 0 ? "rgba(196,151,90,0.4)" : "#C4975A"}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        >
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setShowModal(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#C4975A",
                      color: "#FFFFFF",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: "600",
                      fontSize: "15px",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      cursor: "pointer",
                      marginTop: "auto",
                    }}
                  >
                    Join Family Care Pro
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Comparison table ─────────────────────── */}
        <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
          <div className="hl-container">
            <ScrollReveal>
              <div style={{ textAlign: "center", marginBottom: "48px" }}>
                <span className="hl-section-label">Side by Side</span>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(24px, 3vw, 36px)",
                    fontWeight: "700",
                    color: "#162920",
                    letterSpacing: "-0.025em",
                    marginTop: "12px",
                  }}
                >
                  What each plan includes
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div
                style={{
                  maxWidth: "680px",
                  margin: "0 auto",
                  border: "1px solid #E4EBE6",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto",
                    padding: "16px 24px",
                    background: "#F8FAF8",
                    borderBottom: "1px solid #E4EBE6",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C9488" }}>
                    Feature
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#7C9488", width: "110px", textAlign: "center" }}>
                    Standard
                  </span>
                  <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", fontWeight: "600", letterSpacing: "0.1em", textTransform: "uppercase", color: "#C4975A", width: "110px", textAlign: "center" }}>
                    Pro
                  </span>
                </div>

                {COMPARISON.map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      padding: "14px 24px",
                      borderBottom: i < COMPARISON.length - 1 ? "1px solid #EAF0EA" : "none",
                      background: i % 2 === 0 ? "#FFFFFF" : "#FAFCFA",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#476355" }}>
                      {row.feature}
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: row.standard === "—" ? "rgba(124,148,136,0.4)" : "#162920", width: "110px", textAlign: "center", fontWeight: "500" }}>
                      {row.standard}
                    </span>
                    <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: row.pro === "—" ? "rgba(124,148,136,0.4)" : "#1A5C44", width: "110px", textAlign: "center", fontWeight: "600" }}>
                      {row.pro}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────── */}
        <section
          style={{
            background: "#F8FAF8",
            padding: "100px 0",
            borderTop: "1px solid #EAF0EA",
          }}
        >
          <div className="hl-container">
            <ScrollReveal>
              <div style={{ marginBottom: "48px" }}>
                <span className="hl-section-label">FAQ</span>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(24px, 3vw, 36px)",
                    fontWeight: "700",
                    color: "#162920",
                    letterSpacing: "-0.025em",
                    marginTop: "12px",
                  }}
                >
                  Common questions
                </h2>
              </div>
            </ScrollReveal>

            <div
              style={{
                maxWidth: "680px",
                display: "flex",
                flexDirection: "column",
                gap: "0",
              }}
            >
              {FAQS.map((faq, i) => (
                <ScrollReveal key={i} delay={i * 60}>
                  <div
                    style={{
                      borderBottom: "1px solid #E4EBE6",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        padding: "20px 0",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontWeight: "600",
                          fontSize: "15px",
                          color: "#162920",
                          lineHeight: "1.4",
                        }}
                      >
                        {faq.q}
                      </span>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: openFaq === i ? "rgba(26,92,68,0.08)" : "#F0F5F2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          color: "#476355",
                          transition: "transform 0.2s, background 0.2s",
                          transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="12" y1="5" x2="12" y2="19"/>
                          <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </div>
                    </button>

                    {openFaq === i && (
                      <p
                        style={{
                          fontFamily: "var(--font-dm-sans)",
                          fontSize: "14px",
                          color: "#476355",
                          lineHeight: "1.7",
                          margin: "0 0 20px",
                          paddingRight: "44px",
                        }}
                      >
                        {faq.a}
                      </p>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ───────────────────────────── */}
        <section style={{ background: "#1A5C44", padding: "80px 0" }}>
          <div className="hl-container" style={{ textAlign: "center" }}>
            <ScrollReveal>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(22px, 3vw, 36px)",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  letterSpacing: "-0.025em",
                  marginBottom: "14px",
                }}
              >
                Start with one appointment.
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  marginBottom: "32px",
                }}
              >
                No commitment. Pay only for what you book.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href="/book"
                  style={{
                    background: "#FFFFFF",
                    color: "#1A5C44",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "700",
                    fontSize: "15px",
                    padding: "13px 28px",
                    borderRadius: "12px",
                    textDecoration: "none",
                  }}
                >
                  Book Appointment — $100
                </a>
                <button
                  onClick={() => setShowModal(true)}
                  style={{
                    background: "transparent",
                    color: "#C4975A",
                    border: "1.5px solid rgba(196,151,90,0.4)",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    fontSize: "15px",
                    padding: "13px 28px",
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                >
                  Explore Family Care Pro
                </button>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
