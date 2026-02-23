"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, Clock, TrendingUp, Send, Bot } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const PROOF_POINTS = [
  {
    Icon: Shield,
    text: "Never diagnoses — only guides safely",
  },
  {
    Icon: Clock,
    text: "Responds in under 1 second",
  },
  {
    Icon: TrendingUp,
    text: "34% of conversations lead to bookings",
  },
];

/* Stage map:
   0 = nothing visible
   1 = msg1 (AI welcome)
   2 = typing indicator 1
   3 = msg2 (user symptom)
   4 = typing indicator 2
   5 = msg3 (AI recommendation)
   6 = booking CTA
*/

export default function AiDemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && stage === 0) {
          // Kick off the animation sequence
          const advance = (nextStage: number, delay: number) =>
            setTimeout(() => setStage(nextStage), delay);

          setStage(1); // msg1
          timerRef.current = advance(2, 1100); // typing 1
          setTimeout(() => {
            advance(3, 2200); // msg2
            setTimeout(() => {
              advance(4, 3000); // typing 2
              setTimeout(() => {
                advance(5, 4400); // msg3
                setTimeout(() => advance(6, 5400), 0); // CTA
              }, 0);
            }, 0);
          }, 0);

          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const msgStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
    pointerEvents: visible ? "auto" : "none",
  });

  return (
    <section
      className="hl-section-surface"
      style={{ padding: "108px 0" }}
    >
      <div className="hl-container">
        <div
          className="hl-two-col"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 3fr",
            gap: "64px",
            alignItems: "center",
          }}
        >
          {/* ── Left: Context ── */}
          <ScrollReveal>
            <div>
              <span className="hl-section-label">Signature Feature</span>
              <h2
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "clamp(28px, 3vw, 40px)",
                  fontWeight: "700",
                  color: "#162920",
                  lineHeight: "1.15",
                  letterSpacing: "-0.02em",
                  marginBottom: "20px",
                }}
              >
                Watch the AI
                <br />
                Guide a Real Visit
              </h2>
              <p
                style={{
                  color: "#476355",
                  fontSize: "15px",
                  fontFamily: "var(--font-dm-sans)",
                  lineHeight: "1.7",
                  maxWidth: "420px",
                  marginBottom: "32px",
                }}
              >
                Our virtual receptionist doesn&apos;t just answer questions.
                It listens to symptoms, understands urgency, recommends the
                right appointment type, and walks you all the way to a
                confirmed booking — in one conversation.
              </p>

              {/* Proof Points */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {PROOF_POINTS.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      color: "#476355",
                      fontSize: "14px",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    <p.Icon
                      size={15}
                      color="rgba(24, 92, 69, 0.65)"
                      strokeWidth={1.75}
                      style={{ flexShrink: 0 }}
                    />
                    {p.text}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Right: Chat Mockup ── */}
          <ScrollReveal delay={200}>
            <div
              ref={sectionRef}
              className="hl-chat-card"
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(208, 212, 209, 0.8)",
                boxShadow:
                  "0 32px 80px rgba(22, 41, 32, 0.1), 0 4px 16px rgba(22, 41, 32, 0.06)",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  borderBottom: "1px solid rgba(208, 212, 209, 0.7)",
                  background: "rgba(246, 247, 246, 0.8)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "rgba(24, 92, 69, 0.08)",
                      border: "1px solid rgba(24, 92, 69, 0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Bot size={15} color="#185C45" strokeWidth={1.75} />
                  </div>
                  <div>
                    <div
                      style={{
                        color: "#162920",
                        fontSize: "13px",
                        fontWeight: "600",
                        fontFamily: "var(--font-dm-sans)",
                      }}
                    >
                      HealthLuma AI
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        marginTop: "2px",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#16a34a",
                          display: "inline-block",
                        }}
                      />
                      <span
                        style={{
                          color: "#7C9488",
                          fontSize: "11px",
                          fontFamily: "var(--font-dm-sans)",
                        }}
                      >
                        Online
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(24, 92, 69, 0.07)",
                    border: "1px solid rgba(24, 92, 69, 0.14)",
                    borderRadius: "9999px",
                    padding: "3px 12px",
                    color: "#185C45",
                    fontSize: "10px",
                    fontWeight: "600",
                    fontFamily: "var(--font-dm-sans)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Live Demo
                </div>
              </div>

              {/* Message Area */}
              <div
                style={{
                  padding: "24px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  minHeight: "320px",
                  background: "#FFFFFF",
                }}
              >
                {/* Message 1 — AI Welcome */}
                <div style={msgStyle(stage >= 1)}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: "8px",
                      maxWidth: "85%",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(24, 92, 69, 0.06)",
                        border: "1px solid rgba(24, 92, 69, 0.1)",
                        borderBottomLeftRadius: "6px",
                        borderRadius: "16px",
                        padding: "12px 16px",
                        color: "#162920",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        lineHeight: "1.65",
                      }}
                    >
                      Hi! Welcome to HealthLuma Family Clinic. I can help
                      you book an appointment, answer questions about our
                      services, or guide you based on your symptoms. How can
                      I help today?
                    </div>
                  </div>
                </div>

                {/* Typing Indicator 1 */}
                {stage === 2 && (
                  <div style={msgStyle(true)}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(24, 92, 69, 0.06)",
                        border: "1px solid rgba(24, 92, 69, 0.1)",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "6px",
                        padding: "12px 16px",
                        width: "fit-content",
                      }}
                    >
                      <span
                        className="hl-typing-dot-1"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                      <span
                        className="hl-typing-dot-2"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                      <span
                        className="hl-typing-dot-3"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Message 2 — User Symptom */}
                <div style={msgStyle(stage >= 3)}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(184, 92, 60, 0.07)",
                        border: "1px solid rgba(184, 92, 60, 0.12)",
                        borderRadius: "16px",
                        borderBottomRightRadius: "6px",
                        padding: "12px 16px",
                        color: "#162920",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        lineHeight: "1.65",
                        maxWidth: "80%",
                      }}
                    >
                      My son has had a fever for 2 days and I&apos;m getting
                      worried.
                    </div>
                  </div>
                </div>

                {/* Typing Indicator 2 */}
                {stage === 4 && (
                  <div style={msgStyle(true)}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(24, 92, 69, 0.06)",
                        border: "1px solid rgba(24, 92, 69, 0.1)",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "6px",
                        padding: "12px 16px",
                        width: "fit-content",
                      }}
                    >
                      <span
                        className="hl-typing-dot-1"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                      <span
                        className="hl-typing-dot-2"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                      <span
                        className="hl-typing-dot-3"
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#185C45",
                          display: "inline-block",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Message 3 — AI Recommendation */}
                <div style={msgStyle(stage >= 5)}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      maxWidth: "88%",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(24, 92, 69, 0.06)",
                        border: "1px solid rgba(24, 92, 69, 0.1)",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "6px",
                        padding: "12px 16px",
                        color: "#162920",
                        fontSize: "14px",
                        fontFamily: "var(--font-dm-sans)",
                        lineHeight: "1.65",
                      }}
                    >
                      I understand your concern. Based on what you&apos;ve
                      described, I&apos;d recommend a{" "}
                      <span style={{ color: "#185C45", fontWeight: "600" }}>
                        Pediatric Consultation
                      </span>
                      . As a Family Care Member, you have a priority slot
                      available{" "}
                      <span style={{ color: "#162920", fontWeight: "600" }}>
                        today at 2:00 PM
                      </span>
                      .
                    </div>

                    {/* Booking CTA */}
                    <div style={msgStyle(stage >= 6)}>
                      <button
                        style={{
                          background: "#185C45",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "12px",
                          padding: "12px 20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          fontFamily: "var(--font-dm-sans)",
                          cursor: "pointer",
                          boxShadow: "0 4px 16px rgba(24, 92, 69, 0.25)",
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Book Priority Slot — $80</span>
                        <span
                          style={{
                            background: "rgba(255, 255, 255, 0.15)",
                            borderRadius: "6px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          20% off
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid rgba(208, 212, 209, 0.7)",
                  background: "rgba(246, 247, 246, 0.8)",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    border: "1px solid rgba(208, 212, 209, 0.8)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "#7C9488",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                    userSelect: "none",
                  }}
                >
                  Describe your symptoms...
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(24, 92, 69, 0.08)",
                    border: "1px solid rgba(24, 92, 69, 0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Send size={14} color="#185C45" strokeWidth={1.75} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
