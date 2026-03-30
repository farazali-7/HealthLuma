"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Quick suggestion chips ────────────────────────────────────────
const SUGGESTIONS = [
  "What symptoms should I watch for?",
  "How do I book an appointment?",
  "What's in Family Care Pro?",
  "Is urgent booking available?",
];

const INITIAL_MESSAGE: Message = {
  id: "0",
  role: "assistant",
  content:
    "Hello! I'm your AI Health Assistant. I can help with symptom questions, appointment guidance, clinic information, and general health advice.\n\nHow can I help you today?",
  timestamp: new Date(),
};

// ─── AI API call ───────────────────────────────────────────────────
async function fetchPublicAiReply(message: string): Promise<string> {
  const res = await fetch("/api/ai-chat/public", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const data: { success: boolean; reply?: string; error?: string } =
    await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? "Failed to get a response.");
  }

  return data.reply!;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── AIMessageBubble ───────────────────────────────────────────────
function AIMessageBubble({
  message,
  isNew,
}: {
  message: Message;
  isNew?: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: "14px",
        animation: isNew ? "msg-in 0.32s cubic-bezier(0.16,1,0.3,1) both" : "none",
      }}
    >
      {!isUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "5px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1A5C44, #4D9A7F)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: "11px",
              color: "#7A9E92",
              fontFamily: "var(--font-dm-sans)",
              fontWeight: "500",
            }}
          >
            AI Health Assistant
          </span>
        </div>
      )}

      <div
        style={{
          maxWidth: "84%",
          padding: isUser ? "10px 14px" : "11px 14px",
          borderRadius: isUser
            ? "16px 16px 4px 16px"
            : "4px 16px 16px 16px",
          background: isUser
            ? "linear-gradient(135deg, #1A5C44 0%, #1E6B50 100%)"
            : "#FFFFFF",
          color: isUser ? "#FFFFFF" : "#1C2B26",
          fontSize: "13.5px",
          lineHeight: "1.6",
          fontFamily: "var(--font-dm-sans)",
          boxShadow: isUser
            ? "0 2px 10px rgba(26,92,68,0.3)"
            : "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
          whiteSpace: "pre-line",
        }}
      >
        {message.content}
      </div>

      <span
        style={{
          fontSize: "10px",
          color: "#AABFB7",
          marginTop: "4px",
          fontFamily: "var(--font-dm-sans)",
        }}
      >
        {formatTime(message.timestamp)}
      </span>
    </div>
  );
}

// ─── TypingIndicator ───────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        marginBottom: "12px",
        animation: "msg-in 0.32s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1A5C44, #4D9A7F)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
      <div
        style={{
          padding: "12px 16px",
          borderRadius: "4px 16px 16px 16px",
          background: "#FFFFFF",
          boxShadow:
            "0 1px 4px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.05)",
          display: "flex",
          gap: "4px",
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#4D9A7F",
              animation: `typing-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── AIChatInput ───────────────────────────────────────────────────
function AIChatInput({
  onSend,
  disabled,
}: {
  onSend: (msg: string) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus on mount
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "8px",
        padding: "12px 14px 14px",
        background: "#FFFFFF",
        borderTop: "1px solid rgba(0,0,0,0.07)",
        flexShrink: 0,
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Ask about symptoms, appointments, or health advice..."
        rows={1}
        style={{
          flex: 1,
          border: "1.5px solid #D8EAE2",
          borderRadius: "12px",
          padding: "9px 13px",
          fontSize: "13.5px",
          fontFamily: "var(--font-dm-sans)",
          color: "#1C2B26",
          background: "#F6FAF8",
          resize: "none",
          outline: "none",
          lineHeight: "1.5",
          maxHeight: "96px",
          overflowY: "auto",
          transition: "border-color 0.18s",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4D9A7F";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#D8EAE2";
        }}
      />
      <button
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "10px",
          background: canSend ? "#1A5C44" : "#D4E6DC",
          border: "none",
          cursor: canSend ? "pointer" : "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.18s, transform 0.15s",
        }}
        onMouseEnter={(e) => {
          if (canSend)
            (e.currentTarget as HTMLElement).style.transform = "scale(1.06)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke={canSend ? "#fff" : "#8AB5A0"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  );
}

// ─── AIChatPanel ───────────────────────────────────────────────────
function AIChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [newestId, setNewestId] = useState<string>("0");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setNewestId(userMsg.id);
    setIsTyping(true);

    try {
      const reply = await fetchPublicAiReply(content);
      const aiMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setNewestId(aiMsg.id);
    } catch {
      const errMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment, or book a consultation directly through the site.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
      setNewestId(errMsg.id);
    } finally {
      setIsTyping(false);
    }
  };

  const showSuggestions = messages.length === 1;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "60px",
        right: "28px",
        width: "380px",
        maxWidth: "calc(100vw - 32px)",
        height: "520px",
        maxHeight: "calc(100svh - 120px)",
        borderRadius: "20px",
        background: "#EFF5F1",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(22,41,32,0.1), 0 0 0 1px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 51,
        animation: "chat-panel-in 0.38s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: "14px 16px",
          background: "#111820",
          display: "flex",
          alignItems: "center",
          gap: "11px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #1A5C44 0%, #4D9A7F 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#E8E5DE",
              fontFamily: "var(--font-dm-sans)",
              lineHeight: "1.2",
            }}
          >
            AI Health Assistant
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              marginTop: "3px",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#4D9A7F",
                animation: "pulse-dot 2s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#6B8A7F",
                fontFamily: "var(--font-dm-sans)",
              }}
            >
              Online · Usually replies instantly
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.07)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#7A9E92",
            flexShrink: 0,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.14)";
            (e.currentTarget as HTMLElement).style.color = "#E8E5DE";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLElement).style.color = "#7A9E92";
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Suggestion chips ── */}
      {showSuggestions && (
        <div
          style={{
            padding: "10px 12px 8px",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            flexShrink: 0,
            background: "#EFF5F1",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              style={{
                padding: "5px 11px",
                borderRadius: "999px",
                border: "1.5px solid #C3DACA",
                background: "#FFFFFF",
                color: "#2A6B50",
                fontSize: "11.5px",
                fontFamily: "var(--font-dm-sans)",
                cursor: "pointer",
                fontWeight: "500",
                transition: "background 0.15s, border-color 0.15s",
                lineHeight: "1.4",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#E8F5EE";
                (e.currentTarget as HTMLElement).style.borderColor = "#4D9A7F";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#FFFFFF";
                (e.currentTarget as HTMLElement).style.borderColor = "#C3DACA";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 14px 4px",
          scrollBehavior: "smooth",
        }}
      >
        {messages.map((msg) => (
          <AIMessageBubble
            key={msg.id}
            message={msg}
            isNew={msg.id === newestId}
          />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* ── Input ── */}
      <AIChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}

// ─── AIChatButton (default export) ────────────────────────────────
export default function AIChatButton({ show }: { show: boolean }) {
  const [open, setOpen] = useState(false);

  if (!show) return null;

  return (
    <>
      {open && <AIChatPanel onClose={() => setOpen(false)} />}

      <div className="hl-sticky-pill" style={{ display: "block" }}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="hl-sticky-pill-inner"
          style={{
            background: open
              ? "linear-gradient(135deg, #154D3A, #1A5C44)"
              : "linear-gradient(135deg, #1A5C44, #215E49)",
            border: "none",
            cursor: "pointer",
          }}
          aria-label={open ? "Close AI assistant" : "Open AI assistant"}
          aria-expanded={open}
        >
          {open ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close Assistant
            </>
          ) : (
            <>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              AI Health Assistant
            </>
          )}
        </button>
      </div>
    </>
  );
}
