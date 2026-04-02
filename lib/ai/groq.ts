// ============================================================
// HealthLuma — Groq AI Service
//
// Isolated service for communicating with the Groq LLM API.
// Import ONLY from server-side code (route handlers, server actions).
// Never import in Client Components or middleware.
// ============================================================

import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

// ── Constants ────────────────────────────────────────────────

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const MAX_TOKENS   = 512;
const TEMPERATURE  = 0.6;

// Maximum history messages forwarded to keep prompt size bounded.
// Each "exchange" is 2 messages (user + assistant), so 10 = 5 exchanges.
const MAX_HISTORY_MESSAGES = 10;

// ── System Prompt ────────────────────────────────────────────

const SYSTEM_PROMPT = `\
You are HealthLuma's AI health assistant — a knowledgeable, empathetic guide \
for patients of a private digital clinic run by Dr. Emily Carter.

STRICT RULES — you must follow these without exception:
1. Never diagnose any medical condition or suggest a specific diagnosis.
2. Never recommend, prescribe, or advise on specific medications or dosages.
3. Always recommend consulting Dr. Emily Carter for clinical decisions, prescription \
   changes, or interpretation of test results.
4. For emergencies (chest pain, difficulty breathing, stroke symptoms, severe \
   bleeding), immediately advise the patient to call emergency services — do \
   not attempt to manage the situation yourself.
5. Keep responses concise: 2–4 sentences for simple questions; a short bullet \
   list only when it genuinely aids clarity.
6. You may explain general health concepts, what common tests measure, healthy \
   lifestyle guidance, and how to navigate HealthLuma's features \
   (appointments, records, prescriptions, family plans).
7. Be warm, professional, and non-alarmist. When uncertain, say so honestly \
   and suggest a consultation.
8. Do not speculate about the patient's specific results unless they provide \
   exact values — and even then, frame it as general context, not personal \
   medical advice.`;

// ── Types ────────────────────────────────────────────────────

export interface GroqChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Service ──────────────────────────────────────────────────

/**
 * Calls the Groq Chat Completions API and returns the assistant's reply.
 *
 * @param userMessage - The new message from the patient.
 * @param history     - Prior conversation messages for context (oldest first).
 *                      Automatically truncated to MAX_HISTORY_MESSAGES.
 * @throws            - Throws a descriptive Error on API failure or bad response.
 */
export async function callGroq(
  userMessage: string,
  history: GroqChatMessage[] = [],
): Promise<string> {
  const trimmedHistory = history.slice(-MAX_HISTORY_MESSAGES);

  const payload = {
    model: GROQ_MODEL,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmedHistory,
      { role: "user", content: userMessage },
    ],
  };

  let response: Response;

  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serverEnv.GROQ_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    logger.error("callGroq", networkError);
    throw new Error("Could not reach the AI service. Please try again.");
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");
    logger.error("callGroq", new Error(`Groq HTTP ${response.status}`), { status: response.status, body });

    if (response.status === 401) {
      throw new Error("AI service authentication failed.");
    }
    if (response.status === 429) {
      throw new Error("AI service rate limit reached. Please wait a moment.");
    }
    throw new Error(`AI service returned an unexpected error (${response.status}).`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    logger.error("callGroq", new Error("Groq returned invalid JSON"));
    throw new Error("AI service returned an unreadable response.");
  }

  const reply = extractReply(json);

  if (!reply) {
    logger.error("callGroq", new Error("Groq returned empty reply"));
    throw new Error("AI service returned an empty response.");
  }

  return reply;
}

// ── Helpers ──────────────────────────────────────────────────

function extractReply(json: unknown): string | null {
  if (
    typeof json !== "object" ||
    json === null ||
    !("choices" in json) ||
    !Array.isArray((json as Record<string, unknown>).choices)
  ) {
    return null;
  }

  const choices = (json as { choices: unknown[] }).choices;
  const first   = choices[0];

  if (
    typeof first !== "object" ||
    first === null ||
    !("message" in first)
  ) {
    return null;
  }

  const message = (first as { message: unknown }).message;

  if (
    typeof message !== "object" ||
    message === null ||
    !("content" in message)
  ) {
    return null;
  }

  const content = (message as { content: unknown }).content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}
