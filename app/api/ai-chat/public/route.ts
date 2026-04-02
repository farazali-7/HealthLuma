// ============================================================
// HealthLuma — Public AI Chat API Route (Landing Page)
//
// POST /api/ai-chat/public
//
// Unauthenticated endpoint for the landing page chat widget.
// Intended for visitors exploring the clinic before signing up.
//
// Scope:   HealthLuma clinic info, general health Q&A, booking guidance
// Auth:    None required (public endpoint)
// Limits:  500-char message, no conversation history (stateless per turn)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

// ── Constants ────────────────────────────────────────────────

const GROQ_API_URL        = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL          = "llama-3.3-70b-versatile";
const MAX_TOKENS          = 300; // shorter replies for a landing page widget
const MAX_MESSAGE_LENGTH  = 500;

// ── System Prompt ────────────────────────────────────────────
// Focused on HealthLuma clinic context for visitor-facing interactions.

const SYSTEM_PROMPT = `\
You are the AI assistant for HealthLuma, a private digital clinic. \
You help visitors learn about the clinic and its services before they sign up.

ABOUT HEALTHLUMA:
- A digital clinic run by Dr. Emily Carter, a licensed general practitioner
- Patients can book online consultations, manage prescriptions, and access lab results
- Standard consultation fee: $100
- Family Care Pro plan: $150/year — covers up to 4 family members, 20% off every visit, \
  priority booking slots, same-day urgent booking, and prescription archive
- Appointments available Monday–Saturday with 15 and 30-minute slots
- Secure, HIPAA-compliant platform

STRICT RULES:
1. Never diagnose any condition or suggest a specific diagnosis.
2. Never recommend, prescribe, or advise on specific medications or dosages.
3. For any medical concern, encourage the visitor to book a consultation with Dr. Emily Carter.
4. For emergencies, immediately advise calling 911 or visiting an emergency room.
5. Be conversational, warm, and concise — max 3–4 sentences per reply.
6. You may answer general health questions (e.g. what a symptom might indicate broadly, \
   healthy habits, what tests measure) but always close with a gentle nudge to consult a doctor.
7. If asked about yourself, say: "I'm HealthLuma's AI assistant — here to help you explore \
   the clinic and answer general health questions before you sign up."
8. Do not invent specific doctor availability, test results, or patient data.`;

// ── Route Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Parse & validate body ─────────────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  if (typeof body !== "object" || body === null) {
    return errorResponse("Request body must be a JSON object.", 400);
  }

  const raw = body as Record<string, unknown>;

  if (typeof raw.message !== "string") {
    return errorResponse("Field 'message' is required and must be a string.", 400);
  }

  const message = raw.message.trim();

  if (message.length === 0) {
    return errorResponse("Message cannot be empty.", 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(
      `Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
      400,
    );
  }

  // ── 2. Call Groq ─────────────────────────────────────────
  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serverEnv.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.65,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: message },
        ],
      }),
    });
  } catch (err) {
    logger.error("ai-chat/public", err instanceof Error ? err : new Error("Network error"));
    return errorResponse("Could not reach the AI service. Please try again.", 502);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "(unreadable)");
    logger.error(
      "ai-chat/public",
      new Error(`Groq HTTP ${response.status}`),
      { status: response.status, body },
    );
    return errorResponse("AI service is temporarily unavailable.", 502);
  }

  // ── 3. Parse reply ───────────────────────────────────────
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    logger.error("ai-chat/public", new Error("Groq returned invalid JSON"));
    return errorResponse("AI service returned an unreadable response.", 502);
  }

  const reply = extractReply(json);

  if (!reply) {
    logger.error("ai-chat/public", new Error("Groq returned empty reply"));
    return errorResponse("AI service returned an empty response.", 502);
  }

  return NextResponse.json({ success: true, reply }, { status: 200 });
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

  const first = (json as { choices: unknown[] }).choices[0];

  if (typeof first !== "object" || first === null || !("message" in first)) {
    return null;
  }

  const msg = (first as { message: unknown }).message;

  if (typeof msg !== "object" || msg === null || !("content" in msg)) {
    return null;
  }

  const content = (msg as { content: unknown }).content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}
