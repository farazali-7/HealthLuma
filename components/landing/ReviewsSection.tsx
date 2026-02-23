import ScrollReveal from "./ScrollReveal";

const REVIEWS = [
  {
    initials: "SM",
    name: "Sarah M.",
    context: "Mother of two · Pro Member",
    date: "Feb 2026",
    stars: 5,
    quote:
      "I booked my son's appointment at 11pm while he was running a fever. Priority slot confirmed by morning. That used to require three phone calls and a half-day off work.",
  },
  {
    initials: "JK",
    name: "James K.",
    context: "Family of four · Pro Member",
    date: "Jan 2026",
    stars: 5,
    quote:
      "Pro plan covers me, my wife, and both kids. We had 12 visits last year and saved over $90 on consultations alone. The family dashboard makes scheduling feel like nothing.",
  },
  {
    initials: "RT",
    name: "Rachel T.",
    context: "Working professional · Standard",
    date: "Feb 2026",
    stars: 5,
    quote:
      "The AI flagged that my symptoms needed same-day care, not a standard slot. Turned out to be exactly right. This isn't just a booking app — it's actually smart.",
  },
];

export default function ReviewsSection() {
  return (
    <section
      className="hl-section-surface"
      style={{ padding: "108px 0" }}
    >
      <div className="hl-container">
        {/* Header */}
        <ScrollReveal>
          <div style={{ textAlign: "center", marginBottom: "64px" }}>
            <span className="hl-section-label">Patient Reviews</span>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: "700",
                color: "#162920",
                lineHeight: "1.15",
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Heard from patients,
              <br />
              not focus groups.
            </h2>
            <p
              style={{
                color: "#476355",
                fontSize: "15px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Real people. Real appointments. Unedited.
            </p>
          </div>
        </ScrollReveal>

        {/* Review Cards */}
        <div
          className="hl-three-col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px",
          }}
        >
          {REVIEWS.map((review, i) => (
            <ScrollReveal key={i} delay={i * 110}>
              <div className="hl-review-card">
                {/* Stars */}
                <div style={{ marginBottom: "20px", display: "flex", gap: "3px" }}>
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <svg
                      key={j}
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="#185C45"
                      aria-hidden="true"
                    >
                      <path d="M8 1.5l1.75 3.55 3.91.57-2.83 2.76.67 3.9L8 10.27l-3.5 1.01.67-3.9L2.34 5.62l3.91-.57z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p
                  style={{
                    color: "#162920",
                    fontSize: "15px",
                    fontFamily: "var(--font-dm-sans)",
                    lineHeight: "1.7",
                    fontStyle: "italic",
                    flex: 1,
                    marginBottom: "28px",
                  }}
                >
                  &ldquo;{review.quote}&rdquo;
                </p>

                {/* Divider */}
                <div
                  style={{
                    height: "1px",
                    background:
                      "linear-gradient(to right, rgba(208, 212, 209, 0.9), transparent)",
                    marginBottom: "20px",
                  }}
                />

                {/* Author row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: "rgba(24, 92, 69, 0.07)",
                      border: "1px solid rgba(24, 92, 69, 0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#185C45",
                      fontSize: "12px",
                      fontFamily: "var(--font-playfair)",
                      fontWeight: "700",
                      flexShrink: 0,
                    }}
                  >
                    {review.initials}
                  </div>

                  {/* Name + context */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "#162920",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        fontWeight: "600",
                      }}
                    >
                      {review.name}
                    </div>
                    <div
                      style={{
                        color: "#7C9488",
                        fontSize: "12px",
                        fontFamily: "var(--font-dm-sans)",
                        marginTop: "2px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {review.context}
                    </div>
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      color: "#7C9488",
                      fontSize: "11px",
                      fontFamily: "var(--font-dm-sans)",
                      flexShrink: 0,
                    }}
                  >
                    {review.date}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Aggregate trust line */}
        <ScrollReveal delay={350}>
          <div
            style={{
              textAlign: "center",
              marginTop: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "4.9", label: "Average rating" },
              { value: "200+", label: "Appointments booked" },
              { value: "98%", label: "Would recommend" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{ textAlign: "center" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: "26px",
                    fontWeight: "700",
                    color: "#185C45",
                    lineHeight: "1",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    color: "#7C9488",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans)",
                    marginTop: "4px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
