"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context";

// ─── Types & Data ─────────────────────────────────────────────

interface Message {
  role: "user" | "ai";
  text: string;
  cta?: { label: string; href: string };
}

const SUGGESTED_QUESTIONS = [
  "What do my latest lab results mean?",
  "Is my Vitamin D level a concern?",
  "How do I prepare for a fasting blood test?",
  "What's a normal blood pressure reading?",
  "Can I request a prescription refill online?",
  "When should I book a checkup?",
];

function getCannedReply(input: string): { text: string; cta?: { label: string; href: string } } {
  const q = input.toLowerCase();

  if (q.match(/vitamin d|vit d|vitamin-d/)) {
    return {
      text: "Your latest Vitamin D (25-OH) result was 28 ng/mL, which is slightly below the optimal range of 30–100 ng/mL. Dr. Ahmed has already prescribed Vitamin D3 2000 IU daily. Taking it consistently with a fatty meal improves absorption. A recheck in 3 months is advisable.",
      cta: { label: "View lab result", href: "/dashboard/records" },
    };
  }
  if (q.match(/lab|result|blood test|cholesterol|glucose|hba1c/)) {
    return {
      text: "Your February 2026 panel looks mostly reassuring. Cholesterol is 182 mg/dL (below the 200 threshold), fasting glucose is 94 mg/dL (normal range), and HbA1c is 5.4% (well below the pre-diabetes cutoff of 5.7%). Vitamin D is slightly low and worth monitoring.",
      cta: { label: "Full lab breakdown", href: "/dashboard/records" },
    };
  }
  if (q.match(/blood pressure|bp|hypertension|systolic|diastolic/)) {
    return {
      text: "A normal blood pressure is below 120/80 mmHg. Your most recent reading is 118/75 mmHg — that's excellent and trending down from your September high of 128/82. Staying consistent with your current habits is working well.",
    };
  }
  if (q.match(/appointment|book|schedule|slot|availability/)) {
    return {
      text: "You can view live availability and book a slot in under 60 seconds. Your next scheduled appointment is with Dr. Sarah Ahmed on March 15 at 10:30 AM for a follow-up.",
      cta: { label: "Book appointment", href: "/dashboard/appointments" },
    };
  }
  if (q.match(/prescription|refill|medication|medicine|metformin|vitamin/)) {
    return {
      text: "You currently have 3 active prescriptions: Vitamin D3 (5 refills), Omega-3 (5 refills), and Metformin (2 refills). You can request a refill directly from the Records page — no phone call needed.",
      cta: { label: "View prescriptions", href: "/dashboard/records" },
    };
  }
  if (q.match(/fever|temperature|chills|flu/)) {
    return {
      text: "A fever above 38.3°C (101°F) for more than 3 days, or any fever above 39.4°C (103°F), warrants a same-day appointment. For mild fevers with no other alarming symptoms, rest and fluids are usually appropriate. Would you like to book an urgent slot today?",
      cta: { label: "Book urgent appointment", href: "/dashboard/appointments" },
    };
  }
  if (q.match(/chest|heart|pain|pressure|palpitation/)) {
    return {
      text: "Chest discomfort, pressure, or pain that radiates to the arm or jaw should be evaluated urgently. If symptoms are severe or sudden, call emergency services (115/1122). For mild, recurring chest pressure, Dr. Khan (Cardiology) is your next scheduled contact on March 22.",
      cta: { label: "View cardiology appointment", href: "/dashboard/appointments" },
    };
  }
  if (q.match(/checkup|annual|physical|screen/)) {
    return {
      text: "For adults under 40 with no chronic conditions, an annual check-up is recommended. Your last full physical was October 2025. Your next annual checkup with Dr. Ahmed is scheduled for April 1, 2026 — you're well within the recommended interval.",
      cta: { label: "View appointments", href: "/dashboard/appointments" },
    };
  }
  if (q.match(/fasting|prepare|preparation|before test/)) {
    return {
      text: "For most fasting blood tests (glucose, cholesterol, metabolic panel): fast for 8–12 hours, drink only plain water, take regular medications unless told otherwise, avoid strenuous exercise the night before, and arrive well-hydrated. Your clinic can confirm specific instructions when booking.",
    };
  }
  if (q.match(/family|member|child|spouse|parent/)) {
    return {
      text: "With a HealthLuma Family Care membership, you can manage appointments and records for up to 9 family members (spouse + 6 children + 2 parents) from a single account. The plan is $150/year and pays for itself in about 8 family visits.",
      cta: { label: "Manage family", href: "/dashboard/family" },
    };
  }
  if (q.match(/billing|invoice|payment|plan|membership|pro/)) {
    return {
      text: "Your current plan is HealthLuma Standard. Upgrading to Family Care ($150/year) gives you 20% off every visit plus priority slots and same-day urgent booking for your whole family.",
      cta: { label: "View billing & plans", href: "/dashboard/billing" },
    };
  }

  return {
    text: "That's a good question. For the most accurate guidance, I'd recommend booking a short consultation with Dr. Sarah Ahmed — she can review your complete history and give personalised advice. I can help you book a slot right now.",
    cta: { label: "Book a consultation", href: "/dashboard/appointments" },
  };
}

// ─── Page ──────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const user = useUser();
  const firstName =
    (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "there").split(" ")[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `Hi ${firstName}! I'm your HealthLuma AI assistant. I can help you understand your lab results, manage medications, prepare for appointments, and more. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;
    const userMsg: Message = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    const reply = getCannedReply(text);
    setMessages((prev) => [...prev, { role: "ai", ...reply }]);
    setTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const reset = () => {
    setMessages([
      {
        role: "ai",
        text: `Hi ${firstName}! I'm your HealthLuma AI assistant. What would you like to know?`,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col px-4 py-7 sm:px-6 lg:px-8">

      {/* ── Header ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            AI Health Assistant
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask anything about your health, results, or appointments
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          onClick={reset}
        >
          <RefreshCw className="size-3" />
          New chat
        </Button>
      </div>

      {/* ── Chat Window ── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card shadow-sm">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {/* Avatar */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                  msg.role === "ai"
                    ? "bg-primary/10"
                    : "bg-muted/60"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot className="size-4 text-primary" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] space-y-2 ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "ai"
                      ? "rounded-tl-sm bg-muted/40 text-foreground"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.cta && (
                  <a
                    href={msg.cta.href}
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
                  >
                    {msg.cta.label}
                    <ChevronRight className="size-3" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Bot className="size-4 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted/40 px-4 py-3">
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions — shown when only greeting is present */}
        {messages.length === 1 && (
          <div className="border-t border-border/50 px-5 py-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Suggested
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/8 hover:text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/50 px-4 py-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your health, results, appointments…"
                className="w-full rounded-xl border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="size-4" />
            </button>
          </form>
          <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
            AI responses are informational only — always consult your doctor for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
