"use client";

import LogoLoop, { type LogoItem } from "@/components/ui/LogoLoop";

// ─── Avatar SVGs ───────────────────────────
const AVATARS = {
  sarah: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#E6F3ED"/>
      <circle cx="22" cy="16" r="8" fill="#3A8C62"/>
      <path d="M14 16c0-5 3.5-9 8-9s8 4 8 9" fill="#1A3D2B"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#3A8C62"/>
    </svg>
  ),
  james: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#EBF0F5"/>
      <circle cx="22" cy="16" r="8" fill="#2D5C7A"/>
      <path d="M14 14c0-4.5 3.5-7 8-7s8 2.5 8 7v1.5H14z" fill="#162428"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#2D5C7A"/>
    </svg>
  ),
  rachel: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#F5EFE8"/>
      <circle cx="22" cy="16" r="8" fill="#8B5E3C"/>
      <path d="M14 17c0-4.5 3.5-9 8-9s8 4.5 8 9l2 9H12z" fill="#5C3A1E"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#8B5E3C"/>
    </svg>
  ),
  marcus: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#EDF3F0"/>
      <circle cx="22" cy="16" r="8" fill="#4A7A5E"/>
      <path d="M14 14.5c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5v2H14z" fill="#243D30"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#4A7A5E"/>
    </svg>
  ),
  priya: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#F3EDF5"/>
      <circle cx="22" cy="16" r="8" fill="#7A5A8C"/>
      <path d="M13 17c0-5 4-10 9-10s9 5 9 10l2 9H11z" fill="#3D2B4A"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#7A5A8C"/>
    </svg>
  ),
  david: (
    <svg viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "44px", height: "44px" }}>
      <circle cx="22" cy="22" r="22" fill="#EFF4F0"/>
      <circle cx="22" cy="16" r="8" fill="#5A7A5C"/>
      <path d="M14 14c0-4.5 3.5-7 8-7s8 2.5 8 7v2H14z" fill="#2A3D2C"/>
      <path d="M10 44c0-9 5.5-14.5 12-14.5S34 35 34 44" fill="#5A7A5C"/>
    </svg>
  ),
};

const REVIEWS = [
  {
    id: "sarah",
    avatar: AVATARS.sarah,
    name: "Sarah M.",
    context: "Mother of two · Pro Member",
    date: "Feb 2026",
    stars: 5,
    dark: false,
    quote: "I booked my son's appointment at 11 pm while he was running a fever. Priority slot confirmed by morning. That used to take three phone calls and a half-day off work.",
  },
  {
    id: "james",
    avatar: AVATARS.james,
    name: "James K.",
    context: "Family of four · Pro Member",
    date: "Jan 2026",
    stars: 5,
    dark: true,
    quote: "12 visits last year across my whole family. The savings practically paid for the plan twice over. The dashboard alone is worth it.",
  },
  {
    id: "rachel",
    avatar: AVATARS.rachel,
    name: "Rachel T.",
    context: "Working professional · Standard",
    date: "Feb 2026",
    stars: 5,
    dark: false,
    quote: "The AI flagged my symptoms as urgent, not routine. It was exactly right. This isn't just a scheduling app — it's actually intelligent.",
  },
  {
    id: "marcus",
    avatar: AVATARS.marcus,
    name: "Marcus L.",
    context: "Parent · Pro Member",
    date: "Mar 2026",
    stars: 5,
    dark: false,
    quote: "Same-week slot, clear pricing upfront, and Dr. Jack remembered every detail from our previous visit. I didn't have to repeat myself once.",
  },
  {
    id: "priya",
    avatar: AVATARS.priya,
    name: "Priya S.",
    context: "New patient · Standard",
    date: "Mar 2026",
    stars: 5,
    dark: true,
    quote: "Moved cities and was dreading finding a new GP. Booked online, got a confirmed slot, and had a proper consultation — all within 48 hours. Genuinely impressed.",
  },
  {
    id: "david",
    avatar: AVATARS.david,
    name: "David R.",
    context: "Senior patient · Pro Member",
    date: "Jan 2026",
    stars: 5,
    dark: false,
    quote: "The follow-up prescription was ready before I even got home from the appointment. The whole system runs like it was designed by someone who's actually used healthcare.",
  },
];

function Stars({ light = false }: { light?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={light ? "rgba(255,215,140,0.9)" : "#C4975A"} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: typeof REVIEWS[0] }) {
  return (
    <div
      style={{
        width: "340px",
        height: "220px",
        background: review.dark ? "#0F2218" : "#FFFFFF",
        border: review.dark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #E0E8E2",
        borderRadius: "18px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: review.dark
          ? "0 4px 20px rgba(0,0,0,0.22)"
          : "0 2px 12px rgba(22,41,32,0.06)",
        flexShrink: 0,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Stars + date */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stars light={review.dark} />
        <span style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "11px",
          color: review.dark ? "rgba(190,218,200,0.28)" : "#B0BDB8",
          letterSpacing: "0.04em",
        }}>
          {review.date}
        </span>
      </div>

      {/* Quote */}
      <p style={{
        fontFamily: "var(--font-playfair)",
        fontSize: "14.5px",
        fontStyle: "italic",
        fontWeight: "500",
        color: review.dark ? "rgba(232,229,222,0.82)" : "#1F3028",
        lineHeight: "1.65",
        letterSpacing: "-0.01em",
        margin: 0,
        flex: 1,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
      }}>
        &ldquo;{review.quote}&rdquo;
      </p>

      {/* Divider */}
      <div style={{
        height: "1px",
        background: review.dark
          ? "rgba(255,255,255,0.07)"
          : "linear-gradient(to right, rgba(208,212,209,0.8), transparent)",
      }}/>

      {/* Author */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          overflow: "hidden",
          border: review.dark ? "1.5px solid rgba(255,255,255,0.1)" : "1.5px solid rgba(26,92,68,0.12)",
          flexShrink: 0,
        }}>
          {review.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "13px",
            fontWeight: "600",
            color: review.dark ? "#E8E5DE" : "#162920",
          }}>
            {review.name}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "11px",
            color: review.dark ? "rgba(190,218,200,0.38)" : "#7C9488",
            marginTop: "1px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {review.context}
          </div>
        </div>
        {/* Verified */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          padding: "3px 7px",
          borderRadius: "6px",
          background: review.dark ? "rgba(26,92,68,0.22)" : "rgba(26,92,68,0.06)",
          border: review.dark ? "1px solid rgba(77,154,127,0.18)" : "1px solid rgba(26,92,68,0.09)",
          flexShrink: 0,
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={review.dark ? "#4D9A7F" : "#1A5C44"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "9px",
            fontWeight: "700",
            color: review.dark ? "#4D9A7F" : "#1A5C44",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

// Build logo items from review data
const REVIEW_LOGO_ITEMS: LogoItem[] = REVIEWS.map((r) => ({
  node: <ReviewCard review={r} />,
  title: r.name,
}));

export default function ReviewsSection() {
  return (
    <section
      className="hl-section-dark"
      style={{ padding: "108px 0", overflow: "hidden" }}
    >
      <div className="hl-container">
        {/* ── Header ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {/* Left — headline */}
          <div>
            <span className="hl-section-label">Patient Reviews</span>
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(26px, 3.5vw, 40px)",
                fontWeight: "700",
                color: "#162920",
                lineHeight: "1.15",
                letterSpacing: "-0.025em",
                marginTop: "12px",
                marginBottom: 0,
              }}
            >
              Trusted by families who
              <br />
              value thoughtful care.
            </h2>
          </div>

          {/* Right — trust aggregate */}
          <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap" }}>
            {[
              { value: "4.9 / 5", label: "Average rating" },
              { value: "800+",    label: "Patients served" },
              { value: "98%",     label: "Would return" },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  textAlign: "right",
                  padding: "0 0 0 28px",
                  marginLeft: i > 0 ? "28px" : "0",
                  borderLeft: i > 0 ? "1px solid #D8DED9" : "none",
                }}
              >
                <div style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "22px",
                  fontWeight: "700",
                  color: "#1A5C44",
                  letterSpacing: "-0.03em",
                  lineHeight: "1",
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "11px",
                  color: "#7C9488",
                  marginTop: "4px",
                  letterSpacing: "0.04em",
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrolling Marquee — full bleed ─────── */}
      <div style={{ width: "100%", paddingBottom: "4px" }}>
        <LogoLoop
          logos={REVIEW_LOGO_ITEMS}
          speed={55}
          direction="right"
          gap={20}
          logoHeight={220}
          pauseOnHover
          fadeOut
          fadeOutColor="#FFFFFF"
          ariaLabel="Patient testimonials"
          renderItem={(item, key) => (
            <div key={key} style={{ flexShrink: 0 }}>
              {"node" in item ? item.node : null}
            </div>
          )}
        />
      </div>
    </section>
  );
}
