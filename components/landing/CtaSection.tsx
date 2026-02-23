import ScrollReveal from "./ScrollReveal";

export default function CtaSection() {
  return (
    <section
      className="hl-section-dark"
      style={{
        padding: "120px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background atmosphere */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(24, 92, 69, 0.06) 0%, transparent 65%)",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="hl-container"
        style={{ position: "relative" }}
      >
        <ScrollReveal>
          <div
            style={{
              textAlign: "center",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            {/* Headline */}
            <h2
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(30px, 4vw, 48px)",
                fontWeight: "800",
                color: "#162920",
                lineHeight: "1.12",
                letterSpacing: "-0.025em",
                marginBottom: "20px",
              }}
            >
              Your Family&apos;s Health Deserves
              <br />
              a Better System.
            </h2>

            {/* Subheadline */}
            <p
              style={{
                color: "#476355",
                fontSize: "17px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.65",
                maxWidth: "460px",
                margin: "0 auto 40px",
              }}
            >
              Book your first appointment in under 60 seconds.{" "}
              <span style={{ color: "#162920" }}>No phone call.</span> No
              registration hassle. Just care.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <a
                href="#"
                className="hl-btn-primary"
                style={{ fontSize: "17px", padding: "18px 44px" }}
              >
                Book Appointment
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
              <a
                href="#"
                className="hl-btn-secondary"
                style={{ fontSize: "17px", padding: "18px 44px" }}
              >
                Explore Family Care
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
            </div>

            {/* Pricing transparency */}
            <p
              style={{
                color: "#7C9488",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.6",
              }}
            >
              Free to register · $100 per consultation · Family Care: $150/year
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
