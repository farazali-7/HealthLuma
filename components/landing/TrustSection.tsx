import ScrollReveal from "./ScrollReveal";

const PRINCIPLES = [
  {
    number: "01",
    title: "Your time is medical care too",
    description:
      "The time you spend trying to get an appointment is time stolen from your wellbeing. We eliminate it.",
  },
  {
    number: "02",
    title: "Families deserve a system, not a folder",
    description:
      "Your whole family's care — in one place, under one plan, with one login. Not scattered across providers and paperwork.",
  },
  {
    number: "03",
    title: "AI assists, the doctor decides",
    description:
      "Our AI helps you prepare. It never diagnoses. It never prescribes. Dr. Emily does that part.",
  },
  {
    number: "04",
    title: "Transparency in everything",
    description:
      'Prices on the website. Availability in real-time. No surprise bills. No hidden fees. No "call for details."',
  },
];

export default function TrustSection() {
  return (
    <section
      className="hl-section-dark"
      style={{ padding: "108px 0" }}
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
          {/* ── Left: The Story ── */}
          <ScrollReveal>
            <div>
              <span className="hl-section-label">About the Clinic</span>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(26px, 3vw, 36px)",
                  fontWeight: "700",
                  color: "#162920",
                  lineHeight: "1.2",
                  letterSpacing: "-0.02em",
                  marginBottom: "28px",
                }}
              >
                Dr. Emily&apos;s Approach
                <br />
                to Care
              </h2>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <p
                  style={{
                    color: "#476355",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  HealthLuma wasn&apos;t designed by a tech company. It was
                  built around one doctor&apos;s belief that seeing a GP
                  shouldn&apos;t require{" "}
                  <span style={{ color: "#162920" }}>
                    three phone calls and a half-day off work.
                  </span>
                </p>

                <p
                  style={{
                    color: "#476355",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  <span style={{ color: "#162920", fontWeight: "600" }}>
                    Dr. Emily Carter
                  </span>{" "}
                  has spent 15 years in family medicine. He&apos;s seen
                  firsthand how much time patients waste on scheduling,
                  paperwork, and playing phone tag with reception — time that
                  should be spent on actual care.
                </p>

                <p
                  style={{
                    color: "#476355",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  This system is his answer: AI that handles the intake,
                  online booking that respects your schedule, and a family
                  plan that{" "}
                  <span style={{ color: "#162920" }}>
                    rewards loyalty instead of punishing it.
                  </span>
                </p>
              </div>

              {/* Doctor signature-like element */}
              <div
                style={{
                  marginTop: "32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  background: "rgba(24, 92, 69, 0.04)",
                  border: "1px solid rgba(24, 92, 69, 0.1)",
                  borderRadius: "14px",
                }}
              >
                {/* Illustrated doctor avatar */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    border: "1.5px solid rgba(24, 92, 69, 0.16)",
                    flexShrink: 0,
                    overflow: "hidden",
                    background: "rgba(24, 92, 69, 0.06)",
                  }}
                >
                  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
                    {/* Background */}
                    <circle cx="24" cy="24" r="24" fill="rgba(24,92,69,0.07)"/>
                    {/* Head */}
                    <circle cx="24" cy="18" r="9" fill="#2A7A56"/>
                    {/* Coat collar white */}
                    <path d="M15 48c0-9 4-15 9-15s9 6 9 15" fill="#FFFFFF"/>
                    {/* Doctor coat */}
                    <path d="M13 48c0-10 5-17 11-17s11 7 11 17" fill="#1A5C44"/>
                    {/* Stethoscope hint */}
                    <circle cx="24" cy="35" r="2.5" fill="rgba(196,151,90,0.7)" stroke="#C4975A" strokeWidth="0.5"/>
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      color: "#162920",
                      fontSize: "14px",
                      fontFamily: "var(--font-dm-sans)",
                      fontWeight: "600",
                    }}
                  >
                    Dr. Emily Carter
                  </div>
                  <div
                    style={{
                      color: "#476355",
                      fontSize: "12px",
                      fontFamily: "var(--font-dm-sans)",
                      marginTop: "2px",
                    }}
                  >
                    Founder & Family Physician · 15 Years
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Right: Principles ── */}
          <ScrollReveal delay={200}>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(24, 92, 69, 0.7)",
                  marginBottom: "32px",
                  display: "block",
                }}
              >
                How We Practice
              </div>

              {PRINCIPLES.map((p, i) => (
                <div key={i} className="hl-principle">
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "rgba(24, 92, 69, 0.35)",
                        fontWeight: "600",
                        flexShrink: 0,
                        marginTop: "2px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {p.number}
                    </span>
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-playfair)",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#162920",
                          marginBottom: "8px",
                          lineHeight: "1.3",
                        }}
                      >
                        {p.title}
                      </div>
                      <p
                        style={{
                          color: "#476355",
                          fontSize: "14px",
                          fontFamily: "var(--font-dm-sans)",
                          lineHeight: "1.6",
                          margin: 0,
                        }}
                      >
                        {p.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
