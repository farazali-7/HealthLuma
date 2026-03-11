"use client";

const NAV_LINKS = [
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Contact",  href: "/contact" },
];

const SERVICE_LINKS = [
  { label: "General Consultation", href: "/services" },
  { label: "Pediatric Care",        href: "/services" },
  { label: "Family Health Plan",    href: "/pricing" },
  { label: "Preventive Care",       href: "/services" },
  { label: "Follow-Up Visit",       href: "/services" },
];

const SUPPORT_LINKS = [
  { label: "Help Center",    href: "/contact" },
  { label: "FAQs",           href: "/pricing#faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Medical Disclaimer", href: "/medical-disclaimer" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0C1810",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Watermark ──────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-24px",
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(80px, 14vw, 160px)",
          fontWeight: "800",
          color: "rgba(255,255,255,0.025)",
          letterSpacing: "-0.04em",
          whiteSpace: "nowrap",
          userSelect: "none",
          lineHeight: "1",
          pointerEvents: "none",
        }}
      >
        HealthLuma
      </div>

      {/* ── CTA Strip ──────────────────────────── */}
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 0",
        }}
      >
        <div
          className="hl-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(18px, 2.5vw, 22px)",
                fontWeight: "700",
                color: "#E8E5DE",
                letterSpacing: "-0.02em",
                lineHeight: "1.2",
                marginBottom: "6px",
              }}
            >
              Need to see Dr. Jack?
            </div>
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                color: "rgba(190,218,200,0.45)",
                margin: 0,
              }}
            >
              Same-week appointments available. Book in under 2 minutes.
            </p>
          </div>

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
              fontSize: "14px",
              padding: "12px 22px",
              borderRadius: "12px",
              textDecoration: "none",
              letterSpacing: "-0.01em",
              flexShrink: 0,
              transition: "background 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#B8883E";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#C4975A";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            Book Appointment
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Main Grid ──────────────────────────── */}
      <div
        className="hl-container"
        style={{ padding: "64px 24px 56px", position: "relative", zIndex: 1 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
            gap: "48px",
          }}
          className="hl-footer-grid"
        >
          {/* Column 1 — Brand */}
          <div>
            {/* Logo */}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                textDecoration: "none",
                marginBottom: "18px",
              }}
            >
              <div
                style={{
                  width: "26px",
                  height: "26px",
                  borderRadius: "7px",
                  background: "linear-gradient(135deg, #1A5C44 0%, #2E7D5E 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(26,92,68,0.45)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="5" y="1" width="3" height="11" rx="1.2" fill="white"/>
                  <rect x="1" y="5" width="11" height="3" rx="1.2" fill="white"/>
                </svg>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#E8E5DE",
                  letterSpacing: "-0.025em",
                  lineHeight: "1",
                }}
              >
                HealthLuma
              </span>
            </a>

            <p
              style={{
                color: "rgba(190,218,200,0.45)",
                fontSize: "13.5px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.7",
                marginBottom: "24px",
                maxWidth: "220px",
              }}
            >
              Modern family healthcare — fast appointments, thoughtful care,
              and an AI assistant that actually helps.
            </p>

            {/* Trust badges */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                "Family Medicine · General Practice",
                "CCFP Certified · 15 Years Experience",
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "11px",
                    color: "rgba(190,218,200,0.35)",
                  }}
                >
                  <div
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "rgba(196,151,90,0.5)",
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2 — Navigate */}
          <FooterColumn label="Navigate" links={NAV_LINKS} />

          {/* Column 3 — Services */}
          <FooterColumn label="Services" links={SERVICE_LINKS} />

          {/* Column 4 — Support */}
          <FooterColumn label="Support" links={SUPPORT_LINKS} />
        </div>
      </div>

      {/* ── Divider ────────────────────────────── */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

      {/* ── Bottom Bar ─────────────────────────── */}
      <div
        className="hl-container"
        style={{
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          style={{
            color: "rgba(190,218,200,0.25)",
            fontSize: "12px",
            fontFamily: "var(--font-dm-sans)",
            margin: 0,
          }}
        >
          © 2026 HealthLuma. All rights reserved.
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
          {[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
            { label: "Medical Disclaimer", href: "/medical-disclaimer" },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="hl-fdark-legal">
              {label}
            </a>
          ))}
        </div>
      </div>

    </footer>
  );
}

// ─── Sub-component ─────────────────────────
function FooterColumn({
  label,
  links,
}: {
  label: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: "11px",
          fontWeight: "700",
          letterSpacing: "0.13em",
          textTransform: "uppercase",
          color: "rgba(196,151,90,0.65)",
          marginBottom: "20px",
        }}
      >
        {label}
      </div>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "13px" }}>
        {links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="hl-fdark-link">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
