"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#" },
  { label: "About Doctor", href: "#" },
  { label: "Services", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Contact", href: "#" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <> <div className="bg-white">
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "72px",
          zIndex: 100,
          transition:
            "background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease",
          background: scrolled ? "rgba(255, 255, 255, 0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(140%)" : "none",
          WebkitBackdropFilter: scrolled
            ? "blur(20px) saturate(140%)"
            : "none",
          borderBottom: scrolled
            ? "1px solid rgba(208, 212, 209, 0.8)"
            : "1px solid transparent",
          boxShadow: scrolled
            ? "0 1px 12px rgba(22, 41, 32, 0.06)"
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
          {/* Logo */}
          <a
            href="#"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span className="hl-logo-dot" />
            <span
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "20px",
                fontWeight: "700",
                color: "#162920",
                letterSpacing: "-0.02em",
              }}
            >
              HealthLuma
            </span>
          </a>

          {/* Desktop Navigation */}
          <div
            className="hl-desktop-nav"
            style={{ display: "flex", alignItems: "center", gap: "28px" }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} className="hl-nav-link">
                {label}
              </a>
            ))}

            {/* Divider */}
            <div
              style={{
                width: "1px",
                height: "18px",
                background: "rgba(208, 212, 209, 0.9)",
              }}
            />

            {/* Login — ghost */}
            <a
              href="/login"
              className="hl-nav-login"
            >
              Login
            </a>

            {/* Sign Up — primary */}
            <a href="/signup" className="hl-nav-book">
              Sign Up
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="hl-mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: "none",
              border: "none",
              color: "#162920",
              cursor: "pointer",
              padding: "8px",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="hl-mobile-menu"
          style={{
            position: "fixed",
            top: "72px",
            left: 0,
            right: 0,
            zIndex: 99,
            background: "rgba(255, 255, 255, 0.97)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(208, 212, 209, 0.7)",
            boxShadow: "0 8px 24px rgba(22, 41, 32, 0.08)",
            padding: "24px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                style={{
                  color: "#476355",
                  fontSize: "17px",
                  fontFamily: "var(--font-dm-sans)",
                  textDecoration: "none",
                  fontWeight: "500",
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(208, 212, 209, 0.5)",
                  display: "block",
                }}
              >
                {label}
              </a>
            ))}
            {/* Login row */}
            <a
              href="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                color: "#476355",
                fontSize: "17px",
                fontFamily: "var(--font-dm-sans)",
                textDecoration: "none",
                fontWeight: "500",
                padding: "16px 0",
                borderBottom: "1px solid rgba(208, 212, 209, 0.5)",
                display: "block",
              }}
            >
              Login
            </a>
            <a
              href="/signup"
              onClick={() => setMobileOpen(false)}
              style={{
                background: "#185C45",
                color: "#FFFFFF",
                padding: "16px",
                borderRadius: "9999px",
                fontSize: "16px",
                fontWeight: "600",
                fontFamily: "var(--font-dm-sans)",
                textDecoration: "none",
                textAlign: "center",
                boxShadow: "0 4px 16px rgba(24, 92, 69, 0.25)",
                marginTop: "20px",
                display: "block",
              }}
            >
              Book Appointment
            </a>
          </div>
        </div>
      )}
    </div></>
  );
}
