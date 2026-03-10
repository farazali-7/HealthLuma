import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

const VALUES = [
  {
    number: "01",
    title: "Time is medical care too",
    body: "The hours you spend chasing appointments, sitting on hold, and navigating broken systems are a health cost. We subtract them entirely.",
  },
  {
    number: "02",
    title: "Families deserve a system",
    body: "Not scattered records across four providers. One login, one plan, one place. Your whole family's health — coherent and accessible.",
  },
  {
    number: "03",
    title: "AI assists. The doctor decides.",
    body: "Our AI handles intake, triage guidance, and visit prep. Dr. Jack handles diagnosis, prescription, and care. Clearly delineated, always.",
  },
  {
    number: "04",
    title: "Prices on the website",
    body: `Every fee is published in advance. No surprises at checkout, no hidden follow-up charges, no "call for details."`,
  },
];

const CREDENTIALS = [
  { label: "Specialty", value: "Family Medicine · General Practice" },
  { label: "Experience", value: "15 years in clinical practice" },
  { label: "Training", value: "MD, Board Certified (CCFP)" },
  { label: "Approach", value: "Evidence-based · Patient-first" },
];

const STATS = [
  { value: "1,400+", label: "Patients served" },
  { value: "15 yrs", label: "Clinical experience" },
  { value: "4.9 / 5", label: "Average patient rating" },
  { value: "< 24h", label: "Average booking time" },
];

export default function AboutPage() {
  return (
    <div className="hl-page">
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────────── */}
        <section
          style={{
            background: "#FFFFFF",
            paddingTop: "112px",
            paddingBottom: "96px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Decorative vertical rule */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "1px",
              background: "linear-gradient(to bottom, transparent, #D5E3DA 30%, #D5E3DA 70%, transparent)",
              opacity: 0.6,
              display: "none",
            }}
          />

          <div className="hl-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
                alignItems: "center",
              }}
              className="hl-two-col"
            >
              {/* Left — headline */}
              <ScrollReveal>
                <div>
                  <span className="hl-section-label">About HealthLuma</span>
                  <h1
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "clamp(36px, 5vw, 58px)",
                      fontWeight: "700",
                      color: "#162920",
                      lineHeight: "1.1",
                      letterSpacing: "-0.03em",
                      marginTop: "16px",
                      marginBottom: "28px",
                    }}
                  >
                    Built around one
                    <br />
                    <span style={{ color: "#1A5C44" }}>doctor's belief.</span>
                  </h1>
                  <p
                    style={{
                      color: "#476355",
                      fontSize: "17px",
                      fontFamily: "var(--font-dm-sans)",
                      lineHeight: "1.75",
                      maxWidth: "420px",
                      margin: "0 0 36px",
                    }}
                  >
                    Seeing a GP shouldn't require three phone calls and a
                    half-day off work. HealthLuma was designed to fix exactly
                    that — starting with online booking, real-time availability,
                    and a family plan that actually makes sense.
                  </p>
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
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Book an Appointment
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              </ScrollReveal>

              {/* Right — quote card */}
              <ScrollReveal delay={180}>
                <div
                  style={{
                    background: "#F4FAF6",
                    border: "1px solid rgba(26,92,68,0.12)",
                    borderRadius: "20px",
                    padding: "40px 36px",
                    position: "relative",
                  }}
                >
                  {/* Large quote mark */}
                  <div
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "80px",
                      lineHeight: "0.8",
                      color: "rgba(26,92,68,0.12)",
                      position: "absolute",
                      top: "24px",
                      left: "28px",
                      userSelect: "none",
                    }}
                  >
                    &ldquo;
                  </div>
                  <blockquote
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "20px",
                      fontWeight: "500",
                      color: "#162920",
                      lineHeight: "1.55",
                      letterSpacing: "-0.015em",
                      margin: "16px 0 28px",
                      paddingLeft: "4px",
                      fontStyle: "italic",
                    }}
                  >
                    I built HealthLuma because I watched too many patients
                    delay care — not because they couldn&apos;t afford it,
                    but because the system made it too hard to even try.
                  </blockquote>
                  {/* Doctor byline */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      borderTop: "1px solid rgba(26,92,68,0.1)",
                      paddingTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "rgba(26,92,68,0.07)",
                        flexShrink: 0,
                        border: "1.5px solid rgba(26,92,68,0.14)",
                      }}
                    >
                      <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                        <circle cx="22" cy="22" r="22" fill="rgba(26,92,68,0.07)"/>
                        <circle cx="22" cy="17" r="8" fill="#2A7A56"/>
                        <path d="M14 44c0-8.8 3.6-14 8-14s8 5.2 8 14" fill="#FFFFFF"/>
                        <path d="M12 44c0-9.5 4.5-16 10-16s10 6.5 10 16" fill="#1A5C44"/>
                        <circle cx="22" cy="32" r="2.5" fill="rgba(196,151,90,0.75)" stroke="#C4975A" strokeWidth="0.5"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontFamily: "var(--font-dm-sans)", fontWeight: "600", fontSize: "14px", color: "#162920" }}>
                        Dr. Jack Harrison
                      </div>
                      <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "#7C9488", marginTop: "2px" }}>
                        Founder &amp; Family Physician
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────── */}
        <section
          style={{
            background: "#162920",
            padding: "40px 0",
          }}
        >
          <div className="hl-container">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "32px",
              }}
            >
              {STATS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "8px",
                    borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "28px",
                      fontWeight: "700",
                      color: "#C4975A",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "13px",
                      color: "rgba(232,229,222,0.55)",
                      marginTop: "4px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mission ──────────────────────────────── */}
        <section style={{ background: "#FFFFFF", padding: "100px 0" }}>
          <div className="hl-container">
            <ScrollReveal>
              <div style={{ maxWidth: "680px" }}>
                <span className="hl-section-label">Our Mission</span>
                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "clamp(28px, 3.5vw, 42px)",
                    fontWeight: "700",
                    color: "#162920",
                    lineHeight: "1.2",
                    letterSpacing: "-0.025em",
                    marginTop: "14px",
                    marginBottom: "24px",
                  }}
                >
                  Make quality primary care
                  <br />as easy as ordering dinner.
                </h2>
                <p
                  style={{
                    color: "#476355",
                    fontSize: "16px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  HealthLuma exists because the gap between &ldquo;I need to see a
                  doctor&rdquo; and &ldquo;I saw a doctor&rdquo; has grown too wide. We close
                  it with technology that actually works — real-time scheduling,
                  intelligent intake, and a care model designed around modern
                  family life.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Dr. Jack — full bio ───────────────────── */}
        <section
          style={{
            background: "#F8FAF8",
            padding: "100px 0",
            borderTop: "1px solid #EAF0EA",
            borderBottom: "1px solid #EAF0EA",
          }}
        >
          <div className="hl-container">
            <div
              className="hl-two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "80px",
                alignItems: "start",
              }}
            >
              {/* Left — credentials */}
              <ScrollReveal>
                <div>
                  <span className="hl-section-label">The Doctor</span>
                  <h2
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "clamp(26px, 3vw, 38px)",
                      fontWeight: "700",
                      color: "#162920",
                      lineHeight: "1.2",
                      letterSpacing: "-0.025em",
                      marginTop: "14px",
                      marginBottom: "28px",
                    }}
                  >
                    Dr. Jack Harrison,
                    <br />
                    <span style={{ color: "#1A5C44" }}>MD CCFP</span>
                  </h2>

                  <p style={{ color: "#476355", fontSize: "15px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.75", marginBottom: "20px" }}>
                    Dr. Jack completed his medical degree at the University of
                    Toronto and has since spent 15 years in family medicine,
                    building long-term relationships with patients across all
                    stages of life.
                  </p>
                  <p style={{ color: "#476355", fontSize: "15px", fontFamily: "var(--font-dm-sans)", lineHeight: "1.75", marginBottom: "32px" }}>
                    He built HealthLuma after recognising that the most common
                    barrier to care wasn&apos;t cost — it was friction. His
                    practice now runs entirely online, with same-week
                    appointments and a care model that treats your time as
                    seriously as your health.
                  </p>

                  {/* Credential chips */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {CREDENTIALS.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: "12px",
                          padding: "12px 16px",
                          background: "#FFFFFF",
                          border: "1px solid #E4EBE6",
                          borderRadius: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "11px",
                            fontWeight: "600",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "rgba(26,92,68,0.55)",
                            flexShrink: 0,
                            width: "90px",
                          }}
                        >
                          {c.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "14px",
                            color: "#162920",
                            fontWeight: "500",
                          }}
                        >
                          {c.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Right — values */}
              <ScrollReveal delay={200}>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "11px",
                      fontWeight: "600",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "rgba(26,92,68,0.6)",
                      marginBottom: "36px",
                    }}
                  >
                    Practice Philosophy
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {VALUES.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "40px 1fr",
                          gap: "16px",
                          paddingBottom: i < VALUES.length - 1 ? "28px" : "0",
                          marginBottom: i < VALUES.length - 1 ? "28px" : "0",
                          borderBottom: i < VALUES.length - 1 ? "1px solid #EAF0EA" : "none",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "rgba(26,92,68,0.3)",
                            letterSpacing: "0.05em",
                            paddingTop: "3px",
                          }}
                        >
                          {v.number}
                        </span>
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-playfair)",
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#162920",
                              lineHeight: "1.3",
                              marginBottom: "8px",
                            }}
                          >
                            {v.title}
                          </div>
                          <p
                            style={{
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "14px",
                              color: "#476355",
                              lineHeight: "1.65",
                              margin: 0,
                            }}
                          >
                            {v.body}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────── */}
        <section style={{ background: "#1A5C44", padding: "80px 0" }}>
          <div className="hl-container" style={{ textAlign: "center" }}>
            <ScrollReveal>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(24px, 3vw, 36px)",
                  fontWeight: "700",
                  color: "#FFFFFF",
                  letterSpacing: "-0.025em",
                  lineHeight: "1.2",
                  marginBottom: "16px",
                }}
              >
                Ready to meet Dr. Jack?
              </h2>
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "15px",
                  marginBottom: "32px",
                }}
              >
                Book online in under 2 minutes. Next available slot is usually within 24 hours.
              </p>
              <a
                href="/book"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#C4975A",
                  color: "#FFFFFF",
                  fontFamily: "var(--font-dm-sans)",
                  fontWeight: "600",
                  fontSize: "15px",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  textDecoration: "none",
                  letterSpacing: "-0.01em",
                }}
              >
                Book an Appointment
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
