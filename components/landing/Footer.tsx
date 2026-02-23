import { MapPin, Phone, Mail, Clock } from "lucide-react";

const QUICK_LINKS = ["Home", "About", "Services", "Pricing", "FAQ"];
const PATIENT_LINKS = [
  "Book Appointment",
  "Register",
  "Login",
  "Family Care",
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#F6F7F6",
        borderTop: "1px solid #E4E6E4",
      }}
    >
      {/* Main Footer Grid */}
      <div
        className="hl-container"
        style={{ padding: "64px 24px 48px" }}
      >
        <div
          className="hl-four-col"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "40px",
          }}
        >
          {/* Column 1 — Brand */}
          <div>
            <a
              href="#"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none",
                marginBottom: "14px",
              }}
            >
              <span className="hl-logo-dot" />
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#162920",
                  letterSpacing: "-0.02em",
                }}
              >
                HealthLuma
              </span>
            </a>
            <p
              style={{
                color: "#7C9488",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans)",
                lineHeight: "1.65",
                marginBottom: "20px",
                maxWidth: "200px",
              }}
            >
              AI-powered care for modern families.
            </p>
            <p
              style={{
                color: "#7C9488",
                fontSize: "12px",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              © 2026 HealthLuma.
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <div
              style={{
                color: "#476355",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "600",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Quick Links
            </div>
            <ul
              style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {QUICK_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="hl-footer-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — For Patients */}
          <div>
            <div
              style={{
                color: "#476355",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "600",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              For Patients
            </div>
            <ul
              style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {PATIENT_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="hl-footer-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact */}
          <div>
            <div
              style={{
                color: "#476355",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans)",
                fontWeight: "600",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              Contact
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {[
                {
                  Icon: MapPin,
                  text: "123 Care Street, Suite 100",
                },
                {
                  Icon: Phone,
                  text: "(555) 123-4567",
                },
                {
                  Icon: Mail,
                  text: "hello@healthluma.com",
                },
                {
                  Icon: Clock,
                  text: "Mon–Fri: 9AM–6PM",
                },
              ].map(({ Icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <Icon
                    size={14}
                    color="#7C9488"
                    style={{ flexShrink: 0, marginTop: "2px" }}
                    strokeWidth={1.75}
                  />
                  <span
                    style={{
                      color: "#476355",
                      fontSize: "14px",
                      fontFamily: "var(--font-dm-sans)",
                      lineHeight: "1.5",
                    }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          borderTop: "1px solid #E4E6E4",
          padding: "20px 0",
        }}
      >
        <div
          className="hl-container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p
            style={{
              color: "#7C9488",
              fontSize: "12px",
              fontFamily: "var(--font-dm-sans)",
              margin: 0,
            }}
          >
            © 2026 HealthLuma. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Privacy Policy", "Terms of Service", "Medical Disclaimer"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="hl-footer-legal-link"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div
        style={{
          borderTop: "1px solid #E4E6E4",
          padding: "16px 0",
        }}
      >
        <div className="hl-container">
          <p
            style={{
              color: "rgba(124, 148, 136, 0.7)",
              fontSize: "11px",
              fontFamily: "var(--font-dm-sans)",
              lineHeight: "1.6",
              textAlign: "center",
              maxWidth: "720px",
              margin: "0 auto",
            }}
          >
            HealthLuma AI provides general guidance only and does not
            diagnose, prescribe, or provide medical treatment. Always consult
            your doctor for medical advice. In an emergency, call 911.
          </p>
        </div>
      </div>
    </footer>
  );
}
