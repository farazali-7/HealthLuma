"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

// "Home" removed — logo handles that. "About Doctor" → "About" for scannability.
const NAV_LINKS = [
  { label: "About",    href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing",  href: "/pricing" },
  { label: "Contact",  href: "/contact" },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeLink,  setActiveLink]  = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 769) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "68px",
          zIndex: 100,
          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          background: scrolled ? "rgba(252, 253, 252, 0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(196, 209, 200, 0.7)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 1px 0 rgba(22,41,32,0.04), 0 4px 16px rgba(22,41,32,0.05)"
            : "none",
        }}
      >
        <div
          className="hl-container"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo ── */}
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              textDecoration: "none",
              flexShrink: 0,
              outline: "none",
            }}
          >
            {/* Medical cross mark — more distinctive than a plain dot */}
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
                boxShadow: "0 2px 8px rgba(26,92,68,0.28)",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <rect x="5"  y="1" width="3" height="11" rx="1.2" fill="white"/>
                <rect x="1"  y="5" width="11" height="3" rx="1.2" fill="white"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "19px",
                fontWeight: "700",
                color: "#0F2218",
                letterSpacing: "-0.025em",
                lineHeight: "1",
              }}
            >
              HealthLuma
            </span>
          </a>

          {/* ── Desktop Navigation ── */}
          <nav
            className="hl-desktop-nav"
            aria-label="Main navigation"
            style={{ display: "flex", alignItems: "center", gap: "4px" }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="hl-nav-link"
                data-active={activeLink === href ? "true" : undefined}
                onClick={() => setActiveLink(href)}
              >
                {label}
              </a>
            ))}

            {/* Separator */}
            <div
              style={{
                width: "1px",
                height: "16px",
                background: "rgba(180,198,185,0.8)",
                margin: "0 6px",
                flexShrink: 0,
              }}
            />

            {/* Login — ghost */}
            <a href="/login" className="hl-nav-login">
              Log in
            </a>

            {/* Primary CTA */}
            <a href="/book" className="hl-nav-book">
              Book Appointment
            </a>
          </nav>

          {/* ── Mobile hamburger ── */}
          <button
            className="hl-mobile-btn"
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              display: "none", // overridden by media query
              background: "none",
              border: "none",
              color: "#162920",
              cursor: "pointer",
              padding: "8px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(26,92,68,0.07)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = "none")
            }
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} strokeWidth={2} /> : <Menu size={20} strokeWidth={2} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          className="hl-mobile-menu"
          role="dialog"
          aria-label="Mobile navigation"
          style={{
            position: "fixed",
            top: "68px",
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(250, 252, 250, 0.98)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(196,209,200,0.7)",
            boxShadow: "0 12px 32px rgba(22,41,32,0.09)",
            padding: "8px 24px 28px",
            animation: "mobile-menu-in 0.22s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: "#304A3A",
                  fontSize: "16px",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "14px 0",
                  borderBottom: "1px solid rgba(196,209,200,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  letterSpacing: "-0.01em",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#1A5C44")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#304A3A")
                }
              >
                {label}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ opacity: 0.35 }}
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>
            ))}

            {/* Auth row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <a
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  flex: 1,
                  color: "#304A3A",
                  fontSize: "15px",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "13px",
                  border: "1.5px solid rgba(180,198,185,0.9)",
                  borderRadius: "12px",
                  textAlign: "center",
                  letterSpacing: "-0.01em",
                }}
              >
                Log in
              </a>
              <a
                href="/book"
                onClick={() => setMobileOpen(false)}
                style={{
                  flex: 2,
                  background: "#1A5C44",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: "none",
                  fontWeight: "600",
                  padding: "13px",
                  borderRadius: "12px",
                  textAlign: "center",
                  boxShadow: "0 4px 14px rgba(26,92,68,0.28)",
                  letterSpacing: "-0.01em",
                }}
              >
                Book Appointment
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
