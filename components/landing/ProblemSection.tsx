import { Phone, CalendarX, Users } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const PROBLEMS = [
  {
    Icon: Phone,
    title: "Endless Phone Tag",
    body: "Call the clinic. Line's busy. Call again. Put on hold. Leave a message. Wait for a callback that may or may not come. Just to book a 20-minute appointment.",
    color: "rgba(239, 68, 68, 0.06)",
    border: "rgba(239, 68, 68, 0.14)",
    iconColor: "#dc2626",
  },
  {
    Icon: CalendarX,
    title: "No Visibility on Availability",
    body: "You don't know when the doctor is free. You don't know what slots are open. You just call and hope for the best — and usually end up with whatever's left.",
    color: "rgba(245, 158, 11, 0.06)",
    border: "rgba(245, 158, 11, 0.14)",
    iconColor: "#d97706",
  },
  {
    Icon: Users,
    title: "One Family, Five Phone Calls",
    body: "Your kid needs a checkup. Your mother needs a follow-up. You need a consultation. That's three separate calls, three scheduling headaches, zero coordination.",
    color: "rgba(239, 68, 68, 0.06)",
    border: "rgba(239, 68, 68, 0.14)",
    iconColor: "#dc2626",
  },
];

export default function ProblemSection() {
  return (
    <section
      className="hl-section-surface"
      style={{ padding: "108px 0" }}
    >
      <div className="hl-container">
        {/* Section Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(28px, 3.5vw, 42px)",
                fontWeight: "700",
                color: "#162920",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                marginBottom: "16px",
              }}
            >
              Getting a doctor&apos;s appointment
              <br />
              shouldn&apos;t feel like a chore.
            </h2>
            <p
              style={{
                color: "#476355",
                fontSize: "16px",
                fontFamily: "var(--font-dm-sans)",
                maxWidth: "420px",
                margin: "0 auto",
                lineHeight: "1.6",
              }}
            >
              It&apos;s not your fault.{" "}
              <span style={{ color: "#162920" }}>
                It&apos;s how clinics have always worked.
              </span>
            </p>
          </div>
        </ScrollReveal>

        {/* Problem Cards */}
        <div
          className="hl-three-col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {PROBLEMS.map((problem, i) => (
            <ScrollReveal key={i} delay={i * 120}>
              <div className="hl-problem-card" style={{ height: "100%" }}>
                {/* Icon */}
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: problem.color,
                    border: `1px solid ${problem.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                    flexShrink: 0,
                  }}
                >
                  <problem.Icon
                    size={20}
                    color={problem.iconColor}
                    strokeWidth={1.75}
                  />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#162920",
                    marginBottom: "12px",
                    lineHeight: "1.25",
                  }}
                >
                  {problem.title}
                </h3>

                {/* Body */}
                <p
                  style={{
                    color: "#476355",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.7",
                    margin: 0,
                  }}
                >
                  {problem.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Connector */}
        <ScrollReveal delay={400}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "1px",
                flex: 1,
                maxWidth: "120px",
                background:
                  "linear-gradient(to right, transparent, rgba(24, 92, 69, 0.3))",
              }}
            />
            <span
              style={{
                color: "rgba(24, 92, 69, 0.85)",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "500",
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              HealthLuma replaces all of this with one system
            </span>
            <div
              style={{
                height: "1px",
                flex: 1,
                maxWidth: "120px",
                background:
                  "linear-gradient(to left, transparent, rgba(24, 92, 69, 0.3))",
              }}
            />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
