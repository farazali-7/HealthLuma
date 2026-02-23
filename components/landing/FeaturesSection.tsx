import { Bot, Calendar, Heart } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const FEATURES = [
  {
    Icon: Bot,
    title: "AI Health Assistant",
    body: "Describe your symptoms in plain language. Our AI understands what you're dealing with, recommends the right appointment type, and helps you book — all without picking up a phone. Available 24/7 on every page.",
    badge: "Signature Feature",
  },
  {
    Icon: Calendar,
    title: "Instant Online Booking",
    body: "See real available time slots. Pick the one that works. Pay securely online. Get instant confirmation with a calendar invite. Done in under a minute — no calls, no waiting, no back-and-forth.",
    badge: null,
  },
  {
    Icon: Heart,
    title: "Family Care Membership",
    body: "$150/year. 20% off every visit — for you, your spouse, your kids, and your parents. Priority appointment slots. Same-day urgent booking. One plan, one family, year-round savings that actually add up.",
    badge: null,
  },
];

export default function FeaturesSection() {
  return (
    <section className="hl-section-dark" style={{ padding: "108px 0" }}>
      <div className="hl-container">
        {/* Section Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="hl-section-label">How It Works</span>
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
              Your clinic visit, reimagined.
            </h2>
            <p
              style={{
                color: "#476355",
                fontSize: "16px",
                fontFamily: "var(--font-dm-sans)",
                maxWidth: "460px",
                margin: "0 auto",
                lineHeight: "1.65",
              }}
            >
              Three systems working behind the scenes so your only job is{" "}
              <span style={{ color: "#162920" }}>showing up.</span>
            </p>
          </div>
        </ScrollReveal>

        {/* Feature Cards */}
        <div
          className="hl-three-col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {FEATURES.map((feature, i) => (
            <ScrollReveal key={i} delay={i * 130}>
              <div
                className="hl-card"
                style={{ height: "100%", position: "relative" }}
              >
                {/* Optional badge */}
                {feature.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "20px",
                      right: "20px",
                      background: "rgba(24, 92, 69, 0.07)",
                      border: "1px solid rgba(24, 92, 69, 0.14)",
                      borderRadius: "9999px",
                      padding: "3px 10px",
                      fontSize: "10px",
                      fontWeight: "600",
                      fontFamily: "var(--font-dm-sans)",
                      color: "#185C45",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {feature.badge}
                  </div>
                )}

                {/* Icon */}
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    background: "rgba(24, 92, 69, 0.07)",
                    border: "1px solid rgba(24, 92, 69, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "24px",
                    flexShrink: 0,
                  }}
                >
                  <feature.Icon
                    size={22}
                    color="#185C45"
                    strokeWidth={1.75}
                  />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#162920",
                    marginBottom: "14px",
                    lineHeight: "1.3",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Body */}
                <p
                  style={{
                    color: "#476355",
                    fontSize: "14px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.75",
                    margin: 0,
                  }}
                >
                  {feature.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
