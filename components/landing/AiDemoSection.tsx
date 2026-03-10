"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { Shield, Clock, TrendingUp, Send, Bot } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const PROOF_POINTS = [
  { Icon: Shield,     text: "Never diagnoses — only guides safely" },
  { Icon: Clock,      text: "Responds in under 1 second" },
  { Icon: TrendingUp, text: "34% of conversations lead to bookings" },
];

type Message = {
  role: "ai" | "user";
  text: string;
  cta?: { label: string; badge: string };
};

const INITIAL_MESSAGES: Message[] = [
  {
    role: "ai",
    text: "Hi! Welcome to HealthLuma Family Clinic. I can help you book an appointment, answer questions about our services, or guide you based on your symptoms. How can I help today?",
  },
];

function getCannedReply(input: string): Message {
  const q = input.toLowerCase();
  if (q.match(/fever|temperature|hot|38|39|40/)) {
    return {
      role: "ai",
      text: "A persistent fever can be concerning, especially in children. Based on what you've described, I'd recommend a Pediatric Consultation. As a Family Care Member, you have a priority slot available today at 2:00 PM.",
      cta: { label: "Book Priority Slot — $80", badge: "20% off" },
    };
  }
  if (q.match(/headache|migraine|head pain|head ache/)) {
    return {
      role: "ai",
      text: "Persistent headaches should be properly assessed. I'd suggest booking a General Consultation with Dr. Jack. Next available slot is tomorrow at 9:00 AM.",
      cta: { label: "Book General Consultation — $100", badge: "Today" },
    };
  }
  if (q.match(/chest|heart|tight|breathing|breath/)) {
    return {
      role: "ai",
      text: "Chest discomfort or breathing difficulty should be assessed promptly. I recommend our Urgent Consultation. Dr. Jack has an opening today at 3:30 PM — would you like me to reserve it?",
      cta: { label: "Book Urgent Slot — $100", badge: "Urgent" },
    };
  }
  if (q.match(/prescription|refill|medication|medicine|drug/)) {
    return {
      role: "ai",
      text: "For prescription renewals, I'd suggest a 20-minute Quick Consultation. Next available slot is tomorrow at 11:00 AM. It usually takes under a minute to confirm.",
      cta: { label: "Book Quick Consult — $100", badge: "20 min" },
    };
  }
  if (q.match(/checkup|check.?up|annual|routine|physical/)) {
    return {
      role: "ai",
      text: "Annual health reviews are a great idea — early detection saves lives. We have openings next week for a full Health Review. Would you like to see available times?",
      cta: { label: "View Health Review Slots", badge: "Next week" },
    };
  }
  if (q.match(/book|appointment|schedule|slot|visit/)) {
    return {
      role: "ai",
      text: "Happy to help you book! We have openings today, tomorrow, and next week. What type of appointment are you looking for — a general consultation, urgent care, or something specific?",
    };
  }
  if (q.match(/price|cost|how much|fee|pricing|charge/)) {
    return {
      role: "ai",
      text: "Standard consultations are $100. With our Family Care Membership ($150/year), every visit drops to $80 — and your whole family is covered. The plan pays for itself after 8 visits.",
      cta: { label: "Learn about Family Care Plan", badge: "Best value" },
    };
  }
  if (q.match(/family|kid|child|children|wife|husband|parent|spouse/)) {
    return {
      role: "ai",
      text: "Our Family Care Membership covers you, your spouse, up to 6 children, and both parents — all under one $150/year plan. You can book for any family member from one account.",
      cta: { label: "See Family Care Plan — $150/yr", badge: "Save $90+" },
    };
  }
  return {
    role: "ai",
    text: "Thanks for reaching out. Based on what you've described, I'd recommend booking a General Consultation with Dr. Jack. He'll be able to assess your situation properly. Next available slot is tomorrow morning.",
    cta: { label: "Book General Consultation — $100", badge: "Tomorrow" },
  };
}

export default function AiDemoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [inputEnabled, setInputEnabled] = useState(false);
  const [animStage, setAnimStage] = useState(0);

  // Scroll chat container only — NOT the page window
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  // Initial animation sequence on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && animStage === 0) {
          setAnimStage(1);
          setTimeout(() => setMessages([INITIAL_MESSAGES[0]]), 600);
          setTimeout(() => setIsTyping(true), 1400);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
              role: "user",
              text: "My son has had a fever for 2 days and I'm getting worried.",
            }]);
          }, 2600);
          setTimeout(() => setIsTyping(true), 3000);
          setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, {
              role: "ai",
              text: "I understand your concern. Based on what you've described, I'd recommend a Pediatric Consultation. As a Family Care Member, you have a priority slot available today at 2:00 PM.",
              cta: { label: "Book Priority Slot — $80", badge: "20% off" },
            }]);
            setInputEnabled(true);
          }, 4800);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isTyping) return;
    const userMsg: Message = { role: "user", text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    const delay = 900 + Math.random() * 600;
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, getCannedReply(trimmed)]);
    }, delay);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const msgStyle = (visible: boolean): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(8px)",
    transition: "opacity 0.4s cubic-bezier(0.16,1,0.3,1), transform 0.4s cubic-bezier(0.16,1,0.3,1)",
  });

  return (
    <section className="hl-section-surface" style={{ padding: "108px 0" }}>
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
                Ask anything.
                <br />
                Get the right slot.
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
                Our AI doesn&apos;t just answer questions — it listens to your
                symptoms, understands urgency, recommends the right appointment
                type, and books you in one conversation.{" "}
                <span style={{ color: "#162920", fontWeight: "500" }}>
                  Try it. Type your own question.
                </span>
              </p>

              {/* Proof Points */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
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
                    <p.Icon size={15} color="rgba(24, 92, 69, 0.65)" strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    {p.text}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* ── Right: Interactive Chat ── */}
          <ScrollReveal delay={200}>
            <div
              ref={sectionRef}
              className="hl-chat-card"
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                overflow: "hidden",
                border: "1px solid rgba(208, 212, 209, 0.8)",
                boxShadow: "0 32px 80px rgba(22, 41, 32, 0.1), 0 4px 16px rgba(22, 41, 32, 0.06)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "520px",
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
                  background: "#FFFFFF",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
                    <div style={{ color: "#162920", fontSize: "13px", fontWeight: "600", fontFamily: "var(--font-dm-sans)" }}>
                      HealthLuma AI
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                      <span style={{ color: "#7C9488", fontSize: "11px", fontFamily: "var(--font-dm-sans)" }}>
                        Online · replies instantly
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    background: inputEnabled ? "rgba(196, 151, 90, 0.1)" : "rgba(24, 92, 69, 0.07)",
                    border: inputEnabled ? "1px solid rgba(196, 151, 90, 0.25)" : "1px solid rgba(24, 92, 69, 0.14)",
                    borderRadius: "9999px",
                    padding: "3px 12px",
                    color: inputEnabled ? "#7A6240" : "#185C45",
                    fontSize: "10px",
                    fontWeight: "600",
                    fontFamily: "var(--font-dm-sans)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    transition: "all 0.4s",
                  }}
                >
                  {inputEnabled ? "Try it" : "Live Demo"}
                </div>
              </div>

              {/* Message Area */}
              <div
                ref={messagesContainerRef}
                style={{
                  padding: "20px 20px 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  overflowY: "auto",
                  flex: 1,
                  background: "#FFFFFF",
                  minHeight: "320px",
                }}
              >
                {messages.map((msg, i) => (
                  <div key={i} style={msgStyle(true)}>
                    {msg.role === "ai" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "88%" }}>
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
                          {msg.text}
                        </div>
                        {msg.cta && (
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
                            <span>{msg.cta.label}</span>
                            <span
                              style={{
                                background: "rgba(255,255,255,0.18)",
                                borderRadius: "6px",
                                padding: "2px 8px",
                                fontSize: "11px",
                                fontWeight: "700",
                              }}
                            >
                              {msg.cta.badge}
                            </span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
                          {msg.text}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div style={msgStyle(true)}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: "rgba(24, 92, 69, 0.06)",
                        border: "1px solid rgba(24, 92, 69, 0.1)",
                        borderRadius: "16px",
                        borderBottomLeftRadius: "6px",
                        padding: "12px 16px",
                      }}
                    >
                      {[0,1,2].map((i) => (
                        <span
                          key={i}
                          className={`hl-typing-dot-${i+1}`}
                          style={{
                            width: "7px", height: "7px", borderRadius: "50%",
                            background: "#185C45", display: "inline-block",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Bar */}
              <div
                style={{
                  padding: "14px 16px",
                  borderTop: "1px solid rgba(208, 212, 209, 0.7)",
                  background: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!inputEnabled}
                  placeholder={inputEnabled ? "Ask about symptoms, pricing, or booking..." : "Watch the demo..."}
                  style={{
                    flex: 1,
                    background: inputEnabled ? "#FFFFFF" : "rgba(208,212,209,0.12)",
                    border: "1px solid rgba(208, 212, 209, 0.8)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: inputEnabled ? "#162920" : "#7C9488",
                    fontSize: "13px",
                    fontFamily: "var(--font-dm-sans)",
                    outline: "none",
                    transition: "border-color 0.2s, background 0.3s",
                    cursor: inputEnabled ? "text" : "default",
                  }}
                  onFocus={(e) => {
                    if (inputEnabled) e.target.style.borderColor = "rgba(24,92,69,0.4)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(208,212,209,0.8)";
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputEnabled || !inputValue.trim()}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: inputEnabled && inputValue.trim() ? "#185C45" : "rgba(24, 92, 69, 0.08)",
                    border: "1px solid rgba(24, 92, 69, 0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: inputEnabled && inputValue.trim() ? "pointer" : "default",
                    transition: "background 0.2s",
                  }}
                >
                  <Send
                    size={14}
                    color={inputEnabled && inputValue.trim() ? "#FFFFFF" : "#185C45"}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
