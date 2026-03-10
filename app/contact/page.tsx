"use client";

import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import ScrollReveal from "@/components/landing/ScrollReveal";

const HOURS = [
  { day: "Monday – Friday", time: "9:00 AM – 6:00 PM" },
  { day: "Saturday", time: "10:00 AM – 2:00 PM" },
  { day: "Sunday", time: "Closed" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to API
    setSubmitted(true);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    fontFamily: "var(--font-dm-sans)",
    fontSize: "15px",
    color: "#162920",
    background: "#FFFFFF",
    border: `1.5px solid ${focusedField === field ? "#1A5C44" : "#D8DED9"}`,
    borderRadius: "12px",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(26,92,68,0.08)" : "none",
  });

  return (
    <div className="hl-page">
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────────── */}
        <section
          style={{
            background: "#FFFFFF",
            paddingTop: "120px",
            paddingBottom: "72px",
            borderBottom: "1px solid #EAF0EA",
          }}
        >
          <div className="hl-container">
            <ScrollReveal>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "24px",
                }}
              >
                <div>
                  <span className="hl-section-label">Contact</span>
                  <h1
                    style={{
                      fontFamily: "var(--font-playfair)",
                      fontSize: "clamp(32px, 5vw, 54px)",
                      fontWeight: "700",
                      color: "#162920",
                      lineHeight: "1.1",
                      letterSpacing: "-0.03em",
                      marginTop: "14px",
                      marginBottom: 0,
                    }}
                  >
                    We&apos;re here
                    <br />
                    <span style={{ color: "#1A5C44" }}>when you need us.</span>
                  </h1>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Quick contact chips */}
                  <a
                    href="tel:5551234567"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      background: "#F4FAF6",
                      border: "1px solid rgba(26,92,68,0.12)",
                      borderRadius: "12px",
                      textDecoration: "none",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1A5C44",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    (555) 123-4567
                  </a>
                  <a
                    href="mailto:hello@healthluma.com"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      background: "#F4FAF6",
                      border: "1px solid rgba(26,92,68,0.12)",
                      borderRadius: "12px",
                      textDecoration: "none",
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1A5C44",
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    hello@healthluma.com
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ── Main content ─────────────────────────── */}
        <section style={{ background: "#FFFFFF", padding: "80px 0 100px" }}>
          <div className="hl-container">
            <div
              className="hl-two-col"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.5fr",
                gap: "80px",
                alignItems: "start",
              }}
            >
              {/* Left — Info */}
              <ScrollReveal>
                <div>
                  {/* Address */}
                  <div
                    style={{
                      marginBottom: "36px",
                      paddingBottom: "36px",
                      borderBottom: "1px solid #EAF0EA",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(26,92,68,0.55)",
                        marginBottom: "16px",
                      }}
                    >
                      Clinic Address
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          background: "rgba(26,92,68,0.07)",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#1A5C44",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-dm-sans)", fontWeight: "600", fontSize: "15px", color: "#162920", marginBottom: "4px" }}>
                          123 Care Street, Suite 100
                        </div>
                        <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#7C9488" }}>
                          Toronto, ON M5V 3A9
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div
                    style={{
                      marginBottom: "36px",
                      paddingBottom: "36px",
                      borderBottom: "1px solid #EAF0EA",
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(26,92,68,0.55)",
                        marginBottom: "4px",
                      }}
                    >
                      Direct Contact
                    </div>
                    {[
                      {
                        icon: (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        ),
                        label: "Phone",
                        value: "(555) 123-4567",
                        href: "tel:5551234567",
                      },
                      {
                        icon: (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                          </svg>
                        ),
                        label: "Email",
                        value: "hello@healthluma.com",
                        href: "mailto:hello@healthluma.com",
                      },
                    ].map((item, i) => (
                      <a
                        key={i}
                        href={item.href}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          textDecoration: "none",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            background: "rgba(26,92,68,0.07)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#1A5C44",
                            flexShrink: 0,
                          }}
                        >
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontFamily: "var(--font-dm-sans)", fontSize: "11px", color: "#7C9488", marginBottom: "2px" }}>
                            {item.label}
                          </div>
                          <div style={{ fontFamily: "var(--font-dm-sans)", fontWeight: "500", fontSize: "14px", color: "#162920" }}>
                            {item.value}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Hours */}
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "11px",
                        fontWeight: "700",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(26,92,68,0.55)",
                        marginBottom: "16px",
                      }}
                    >
                      Clinic Hours
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {HOURS.map((h, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "#F8FAF8",
                            borderRadius: "10px",
                          }}
                        >
                          <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "13px", color: "#476355", fontWeight: "500" }}>
                            {h.day}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "13px",
                              color: h.time === "Closed" ? "#B05A3A" : "#162920",
                              fontWeight: "600",
                            }}
                          >
                            {h.time}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Emergency note */}
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "12px 14px",
                        background: "rgba(180,70,50,0.05)",
                        border: "1px solid rgba(180,70,50,0.12)",
                        borderRadius: "10px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B05A3A" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                      </svg>
                      <span style={{ fontFamily: "var(--font-dm-sans)", fontSize: "12px", color: "#7C4433", lineHeight: "1.5" }}>
                        For medical emergencies, call <strong>911</strong> or visit your nearest emergency room.
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Right — Form */}
              <ScrollReveal delay={160}>
                {submitted ? (
                  <div
                    style={{
                      background: "#F4FAF6",
                      border: "1px solid rgba(26,92,68,0.15)",
                      borderRadius: "20px",
                      padding: "56px 40px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "56px",
                        height: "56px",
                        background: "rgba(26,92,68,0.1)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        color: "#1A5C44",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <h3
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "#162920",
                        marginBottom: "10px",
                      }}
                    >
                      Message received
                    </h3>
                    <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#476355", lineHeight: "1.6", marginBottom: "28px" }}>
                      We&apos;ll respond within one business day. For urgent
                      matters, call us directly at (555) 123-4567.
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      style={{
                        background: "none",
                        border: "1.5px solid rgba(26,92,68,0.2)",
                        borderRadius: "10px",
                        padding: "10px 20px",
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "14px",
                        color: "#1A5C44",
                        cursor: "pointer",
                        fontWeight: "500",
                      }}
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      background: "#FAFCFA",
                      border: "1px solid #E4EBE6",
                      borderRadius: "20px",
                      padding: "40px 36px",
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: "var(--font-playfair)",
                        fontSize: "22px",
                        fontWeight: "700",
                        color: "#162920",
                        letterSpacing: "-0.02em",
                        marginBottom: "8px",
                      }}
                    >
                      Send a message
                    </h2>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "14px",
                        color: "#7C9488",
                        lineHeight: "1.5",
                        marginBottom: "32px",
                      }}
                    >
                      For appointment bookings, use the{" "}
                      <a href="/book" style={{ color: "#1A5C44", fontWeight: "500" }}>
                        booking page
                      </a>{" "}
                      for faster response.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                      {/* Name + Email row */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "14px",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#476355",
                              marginBottom: "6px",
                              letterSpacing: "0.03em",
                            }}
                          >
                            Full Name
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Jane Smith"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle("name")}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontFamily: "var(--font-dm-sans)",
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#476355",
                              marginBottom: "6px",
                              letterSpacing: "0.03em",
                            }}
                          >
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="jane@example.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            style={inputStyle("email")}
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#476355",
                            marginBottom: "6px",
                            letterSpacing: "0.03em",
                          }}
                        >
                          Subject
                        </label>
                        <input
                          type="text"
                          placeholder="How can we help?"
                          value={form.subject}
                          onChange={(e) => setForm({ ...form, subject: e.target.value })}
                          onFocus={() => setFocusedField("subject")}
                          onBlur={() => setFocusedField(null)}
                          style={inputStyle("subject")}
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "12px",
                            fontWeight: "600",
                            color: "#476355",
                            marginBottom: "6px",
                            letterSpacing: "0.03em",
                          }}
                        >
                          Message
                        </label>
                        <textarea
                          required
                          rows={5}
                          placeholder="Tell us what&#39;s on your mind..."
                          value={form.message}
                          onChange={(e) => setForm({ ...form, message: e.target.value })}
                          onFocus={() => setFocusedField("message")}
                          onBlur={() => setFocusedField(null)}
                          style={{
                            ...inputStyle("message"),
                            resize: "vertical",
                            minHeight: "120px",
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: "100%",
                          padding: "14px",
                          background: "#1A5C44",
                          color: "#FFFFFF",
                          fontFamily: "var(--font-dm-sans)",
                          fontWeight: "600",
                          fontSize: "15px",
                          borderRadius: "12px",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          marginTop: "4px",
                        }}
                      >
                        Send Message
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </button>
                    </div>
                  </form>
                )}
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ── Map placeholder ───────────────────────── */}
        <section
          style={{
            background: "#F8FAF8",
            borderTop: "1px solid #EAF0EA",
            padding: "64px 0",
          }}
        >
          <div className="hl-container">
            <ScrollReveal>
              <div
                style={{
                  background: "#EDF2EE",
                  border: "1px solid #D8E4DA",
                  borderRadius: "18px",
                  height: "260px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Subtle grid pattern */}
                <svg
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}
                  viewBox="0 0 800 260"
                  preserveAspectRatio="xMidYMid slice"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C8D8CC" strokeWidth="0.8"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#map-grid)"/>
                  {/* Simulated streets */}
                  <line x1="0" y1="130" x2="800" y2="130" stroke="#B8CBBC" strokeWidth="2"/>
                  <line x1="0" y1="90" x2="800" y2="90" stroke="#B8CBBC" strokeWidth="1.5"/>
                  <line x1="0" y1="180" x2="800" y2="180" stroke="#B8CBBC" strokeWidth="1.5"/>
                  <line x1="200" y1="0" x2="200" y2="260" stroke="#B8CBBC" strokeWidth="1.5"/>
                  <line x1="400" y1="0" x2="400" y2="260" stroke="#B8CBBC" strokeWidth="2"/>
                  <line x1="600" y1="0" x2="600" y2="260" stroke="#B8CBBC" strokeWidth="1.5"/>
                  {/* "Blocks" */}
                  <rect x="210" y="100" width="80" height="60" fill="rgba(160,200,170,0.25)" rx="2"/>
                  <rect x="310" y="60" width="70" height="60" fill="rgba(160,200,170,0.2)" rx="2"/>
                  <rect x="420" y="100" width="60" height="70" fill="rgba(160,200,170,0.2)" rx="2"/>
                  <rect x="510" y="50" width="80" height="60" fill="rgba(160,200,170,0.25)" rx="2"/>
                </svg>

                {/* Pin */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    width: "44px",
                    height: "44px",
                    background: "#1A5C44",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(26,92,68,0.35)",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#162920",
                    background: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  123 Care Street, Suite 100 — Toronto, ON
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
