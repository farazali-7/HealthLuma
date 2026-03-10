import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

const SERVICES = [
  {
    category: "Primary Care",
    items: [
      {
        name: "General Consultation",
        description:
          "Comprehensive assessment for new symptoms, ongoing conditions, referrals, and general health concerns. Dr. Jack reviews your history and provides a clear care plan.",
        duration: "30 min",
        price: "$100",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        ),
      },
      {
        name: "Follow-Up Visit",
        description:
          "Structured follow-up for ongoing treatment plans, lab review, medication management, and progress assessments. Focused 15-minute sessions.",
        duration: "15 min",
        price: "$60",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        ),
      },
      {
        name: "Preventive Care Review",
        description:
          "Annual wellness check covering health screening, lifestyle risk assessment, immunization status, and preventive care planning.",
        duration: "30 min",
        price: "$100",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        ),
      },
    ],
  },
  {
    category: "Family & Specialist",
    items: [
      {
        name: "Pediatric Consultation",
        description:
          "Child health assessments from infancy through adolescence — developmental milestones, vaccinations, illness review, and school health forms.",
        duration: "30 min",
        price: "$100",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
          </svg>
        ),
      },
      {
        name: "Family Health Plan",
        description:
          "Coordinated care for your whole family under one annual plan. Includes priority booking, discounted consultations, and a single shared health dashboard.",
        duration: "Ongoing",
        price: "$150 / yr",
        badge: "Pro",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        ),
      },
    ],
  },
];

const STEPS = [
  { step: "1", title: "Book online", detail: "Choose your service, pick a slot, and confirm your booking in under 2 minutes." },
  { step: "2", title: "AI intake", detail: "Our health assistant gathers your symptoms and history before the visit so the consultation is efficient." },
  { step: "3", title: "See Dr. Jack", detail: "Video or in-person consultation. Dr. Jack arrives fully prepared with your intake summary." },
  { step: "4", title: "Care plan", detail: "Receive a digital prescription, referral, or care plan within 24 hours of your visit." },
];

export default function ServicesPage() {
  return (
    <div className="hl-page">
      <Navbar />
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "24px",
                  paddingBottom: "56px",
                  borderBottom: "1px solid #EAF0EA",
                }}
              >
                <div>
                  <span className="hl-section-label">What We Offer</span>
                  <h1
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "clamp(32px, 5vw, 54px)",
                      fontWeight: "700",
                      color: "#162920",
                      lineHeight: "1.1",
                      letterSpacing: "-0.03em",
                      marginTop: "14px",
                      marginBottom: "0",
                    }}
                  >
                    Care for every stage
                    <br />
                    <span style={{ color: "#1A5C44" }}>of family life.</span>
                  </h1>
                </div>
                <p
                  style={{
                    color: "#476355",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.7",
                    maxWidth: "380px",
                    margin: 0,
                  }}
                >
                  Five core services, all bookable online. Transparent pricing,
                  real-time availability, and a doctor who knows your history.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Services grid ────────────────────────── */}
        <section style={{ background: "#FFFFFF", paddingBottom: "100px" }}>
          <div className="hl-container">
            {SERVICES.map((group, gi) => (
              <div key={gi} style={{ marginBottom: gi < SERVICES.length - 1 ? "72px" : "0" }}>
                <ScrollReveal>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      marginBottom: "32px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        fontWeight: "600",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(26,92,68,0.55)",
                      }}
                    >
                      {group.category}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "#EAF0EA",
                      }}
                    />
                  </div>
                </ScrollReveal>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                  }}
                >
                  {group.items.map((svc, si) => (
                    <ScrollReveal key={si} delay={si * 80}>
                      <div
                        style={{
                          background: "#FAFCFA",
                          border: "1px solid #E4EBE6",
                          borderRadius: "18px",
                          padding: "28px",
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                          position: "relative",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                      >
                        {/* Pro badge */}
                        {svc.badge && (
                          <div
                            style={{
                              position: "absolute",
                              top: "20px",
                              right: "20px",
                              background: "#C4975A",
                              color: "#FFFFFF",
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "10px",
                              fontWeight: "700",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              padding: "3px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {svc.badge}
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            background: "rgba(26,92,68,0.07)",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1A5C44",
                            marginBottom: "20px",
                            flexShrink: 0,
                          }}
                        >
                          {svc.icon}
                        </div>

                        <div
                          style={{
                            fontFamily: "var(--font-playfair)",
                            fontSize: "18px",
                            fontWeight: "600",
                            color: "#162920",
                            letterSpacing: "-0.01em",
                            lineHeight: "1.3",
                            marginBottom: "10px",
                          }}
                        >
                          {svc.name}
                        </div>

                        <p
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "14px",
                            color: "#476355",
                            lineHeight: "1.65",
                            margin: "0 0 auto",
                            paddingBottom: "20px",
                          }}
                        >
                          {svc.description}
                        </p>

                        {/* Footer row */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "20px",
                            borderTop: "1px solid #EAF0EA",
                            marginTop: "4px",
                          }}
                        >
                          <div style={{ display: "flex", gap: "12px" }}>
                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontFamily: "var(--font-dm-sans)",
                                fontSize: "12px",
                                color: "#7C9488",
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {svc.duration}
                            </span>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "16px",
                              fontWeight: "700",
                              color: "#1A5C44",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {svc.price}
                          </div>
                        </div>

                        <a
                          href="/book"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                            marginTop: "14px",
                            background: "#1A5C44",
                            color: "#FFFFFF",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "14px",
                            fontWeight: "600",
                            padding: "11px 18px",
                            borderRadius: "10px",
                            textDecoration: "none",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          Book Appointment
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </a>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How a visit works ────────────────────── */}
        <section
          style={{
            background: "#F8FAF8",
            padding: "100px 0",
            borderTop: "1px solid #EAF0EA",
          }}
        >
          <div className="hl-container">
            <ScrollReveal>
              <div style={{ textAlign: "center", marginBottom: "60px" }}>
                <span className="hl-section-label">The Process</span>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(26px, 3vw, 38px)",
                    fontWeight: "700",
                    color: "#162920",
                    letterSpacing: "-0.025em",
                    lineHeight: "1.2",
                    marginTop: "12px",
                  }}
                >
                  From booking to care plan —
                  <br />in under an hour.
                </h2>
              </div>
            </ScrollReveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "32px",
                position: "relative",
              }}
            >
              {/* Connecting line */}
              <div
                style={{
                  position: "absolute",
                  top: "22px",
                  left: "10%",
                  right: "10%",
                  height: "1px",
                  background: "linear-gradient(to right, rgba(26,92,68,0.15), rgba(26,92,68,0.15))",
                  zIndex: 0,
                }}
              />

              {STEPS.map((s, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    {/* Step number */}
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        background: "#1A5C44",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-dm-sans)",
                        fontWeight: "700",
                        fontSize: "15px",
                        color: "#FFFFFF",
                        marginBottom: "20px",
                      }}
                    >
                      {s.step}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "17px",
                        fontWeight: "600",
                        color: "#162920",
                        marginBottom: "10px",
                        lineHeight: "1.3",
                      }}
                    >
                      {s.title}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "13px",
                        color: "#7C9488",
                        lineHeight: "1.6",
                        margin: 0,
                      }}
                    >
                      {s.detail}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────── */}
        <section style={{ background: "#FFFFFF", padding: "80px 0", borderTop: "1px solid #EAF0EA" }}>
          <div className="hl-container" style={{ textAlign: "center" }}>
            <ScrollReveal>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(22px, 2.8vw, 34px)",
                  fontWeight: "700",
                  color: "#162920",
                  letterSpacing: "-0.025em",
                  marginBottom: "14px",
                }}
              >
                Not sure which service fits?
              </h2>
              <p
                style={{
                  color: "#476355",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  marginBottom: "32px",
                }}
              >
                Ask our AI health assistant — it will recommend the right consultation for your situation.
              </p>
              <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                <a
                  href="/book"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#1A5C44",
                    color: "#FFFFFF",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    fontSize: "15px",
                    padding: "13px 24px",
                    borderRadius: "12px",
                    textDecoration: "none",
                  }}
                >
                  Book Appointment
                </a>
                <a
                  href="/contact"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "transparent",
                    color: "#1A5C44",
                    border: "1.5px solid rgba(26,92,68,0.25)",
                    fontFamily: "var(--font-dm-sans)",
                    fontWeight: "600",
                    fontSize: "15px",
                    padding: "13px 24px",
                    borderRadius: "12px",
                    textDecoration: "none",
                  }}
                >
                  Contact Us
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
