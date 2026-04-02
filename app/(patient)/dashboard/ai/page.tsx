"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, RefreshCw, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "../context";

// ─── Types ────────────────────────────────────────────────────

interface Message {
  role: "user" | "ai";
  text: string;
  cta?: { label: string; href: string };
  isError?: boolean;
}

// ─── Constants ────────────────────────────────────────────────

const SUGGESTED_QUESTIONS = [
  "What do my latest lab results mean?",
  "Is my Vitamin D level a concern?",
  "How do I prepare for a fasting blood test?",
  "What's a normal blood pressure reading?",
  "Can I request a prescription refill online?",
  "When should I book a checkup?",
];

const ERROR_MESSAGE: Message = {
  role: "ai",
  text: "I'm having trouble connecting right now. Please try again in a moment, or book a consultation if you need immediate help.",
  cta: { label: "Book a consultation", href: "/dashboard/appointments" },
  isError: true,
};

// ─── API Layer ────────────────────────────────────────────────

interface GroqHistoryEntry {
  role: "user" | "assistant";
  content: string;
}

async function fetchAiReply(
  message: string,
  history: GroqHistoryEntry[],
): Promise<string> {
  const res = await fetch("/api/ai-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  const data: { success: boolean; reply?: string; error?: string } = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Failed to get a response.");
  }

  return data.reply!;
}

function buildHistory(messages: Message[]): GroqHistoryEntry[] {
  // Convert internal message format to the API's expected format.
  // Exclude error messages from history — they're UI artefacts, not real conversation.
  return messages
    .filter((m) => !m.isError)
    .map((m) => ({
      role: m.role === "ai" ? ("assistant" as const) : ("user" as const),
      content: m.text,
    }));
}

// ─── Page ─────────────────────────────────────────────────────

export default function AiAssistantPage() {
  const user = useUser();
  const firstName = (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "there"
  )
    .split(" ")[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: `Hi ${firstName}! I'm your HealthLuma AI assistant. I can help you understand your lab results, manage medications, prepare for appointments, and more. What would you like to know?`,
    },
  ]);
  const [input, setInput]     = useState("");
  const [typing, setTyping]   = useState(false);
  const messagesEndRef         = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim() || typing) return;

    const userMsg: Message = { role: "user", text: text.trim() };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      // Build history from existing messages before the new user message.
      // The new message itself is passed separately as `message`.
      const history = buildHistory(messages);

      const reply = await fetchAiReply(text.trim(), history);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, ERROR_MESSAGE]);
    } finally {
      setTyping(false);
    }
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
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            Ask anything about your health, results, or appointments
            <span className="inline-flex items-center gap-1 rounded-full border border-vault-positive/30 bg-vault-positive-light px-2 py-0.5 text-[10px] font-semibold text-vault-positive">
              <span className="size-1.5 rounded-full bg-vault-positive" />
              Online
            </span>
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

      {/* ── Disclaimer Banner ── */}
      <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/20 px-4 py-2.5">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0 text-muted-foreground/70"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-[11px] text-muted-foreground">
          Responses are informational only and do not constitute medical advice.
          Always consult Dr. Emily for clinical decisions.
        </p>
      </div>

      {/* ── Chat Window ── */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border bg-card shadow-sm">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${
                  msg.role === "ai"
                    ? msg.isError
                      ? "bg-destructive/10"
                      : "bg-primary/10"
                    : "bg-muted/60"
                }`}
              >
                {msg.role === "ai" ? (
                  msg.isError ? (
                    <AlertCircle className="size-4 text-destructive" />
                  ) : (
                    <Bot className="size-4 text-primary" />
                  )
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {firstName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] space-y-2 ${
                  msg.role === "user" ? "items-end" : "items-start"
                } flex flex-col`}
              >
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "ai"
                      ? msg.isError
                        ? "rounded-tl-sm bg-destructive/5 text-destructive"
                        : "rounded-tl-sm bg-muted/40 text-foreground"
                      : "rounded-tr-sm bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.cta && (
                  <a
                    href={msg.cta.href}
                    className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
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

        {/* Suggested questions — shown only on empty/greeting state */}
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
                  className="rounded-full border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
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
        </div>
      </div>
    </div>
  );
}
