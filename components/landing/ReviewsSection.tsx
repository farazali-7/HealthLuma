import ScrollReveal from "./ScrollReveal";

const REVIEWS = [
  {
    avatar: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px" }}>
        <circle cx="20" cy="20" r="20" fill="#E6F3ED"/>
        {/* Head */}
        <circle cx="20" cy="15" r="7" fill="#3A8C62"/>
        {/* Hair */}
        <path d="M13 14c0-4 3-7 7-7s7 3 7 7" fill="#1A3D2B"/>
        {/* Body */}
        <path d="M9 40c0-8 5-13 11-13s11 5 11 13" fill="#3A8C62"/>
      </svg>
    ),
    name: "Sarah M.",
    context: "Mother of two · Pro Member",
    date: "Feb 2026",
    stars: 5,
    quote:
      "I booked my son's appointment at 11pm while he was running a fever. Priority slot confirmed by morning. That used to require three phone calls and a half-day off work.",
  },
  {
    avatar: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px" }}>
        <circle cx="20" cy="20" r="20" fill="#EDF4F0"/>
        {/* Head */}
        <circle cx="20" cy="15" r="7" fill="#2D6E4E"/>
        {/* Short hair */}
        <path d="M13 13c0-4 3-6 7-6s7 2 7 6v1h-14z" fill="#162920"/>
        {/* Body */}
        <path d="M9 40c0-8 5-13 11-13s11 5 11 13" fill="#2D6E4E"/>
      </svg>
    ),
    name: "James K.",
    context: "Family of four · Pro Member",
    date: "Jan 2026",
    stars: 5,
    quote:
      "Pro plan covers me, my wife, and both kids. We had 12 visits last year and saved over $90 on consultations alone. The family dashboard makes scheduling feel like nothing.",
  },
  {
    avatar: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px" }}>
        <circle cx="20" cy="20" r="20" fill="#F0F5F2"/>
        {/* Head */}
        <circle cx="20" cy="15" r="7" fill="#4A8C6A"/>
        {/* Long hair */}
        <path d="M13 15c0-4 3-8 7-8s7 4 7 8l2 8h-18z" fill="#8B5E3C"/>
        {/* Body */}
        <path d="M9 40c0-8 5-13 11-13s11 5 11 13" fill="#4A8C6A"/>
      </svg>
    ),
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
      className="hl-section-dark"
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
                  {/* Illustrated avatar */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      border: "1px solid rgba(24, 92, 69, 0.14)",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {review.avatar}
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
