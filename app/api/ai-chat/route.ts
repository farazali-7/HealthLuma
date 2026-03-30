// ============================================================
// HealthLuma — AI Chat API Route
//
// POST /api/ai-chat
//
// Accepts an authenticated patient's message, validates it,
// calls the Groq service, and returns a structured reply.
//
// Access:  authenticated patients only
// Blocked: unauthenticated users, doctor role
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callGroq, type GroqChatMessage } from "@/lib/ai/groq";
import { logger } from "@/lib/logger";

// ── Constants ────────────────────────────────────────────────

const MAX_MESSAGE_LENGTH  = 1_000; // characters
const MAX_HISTORY_ENTRIES = 20;    // messages in history array

// ── Types ────────────────────────────────────────────────────

interface ChatRequest {
  message: string;
  history?: GroqChatMessage[];
}

// ── Route Handler ────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Authenticate ─────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse("Unauthorized.", 401);
  }

  // ── 2. Role guard ────────────────────────────────────────
  // Role is injected into app_metadata by the JWT hook (migration 20260328000002).
  // Doctors do not use the AI assistant. Default to 'patient' if missing
  // (backwards-compatible with accounts created before the hook existed).
  const role: string = (user.app_metadata?.role as string | undefined) ?? "patient";

  if (role === "doctor") {
    return errorResponse("AI assistant is not available for doctor accounts.", 403);
  }

  if (role !== "patient") {
    return errorResponse("Unauthorized.", 403);
  }

  // ── 3. Parse & validate request body ────────────────────
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid request body.", 400);
  }

  const validation = validateBody(body);
  if (!validation.ok) {
    return errorResponse(validation.error, 400);
  }

  const { message, history } = validation.data;

  // ── 4. Call Groq ─────────────────────────────────────────
  try {
    const reply = await callGroq(message, history);
    return NextResponse.json({ success: true, reply }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    logger.error("ai-chat", err instanceof Error ? err : new Error(message), { userId: user.id });
    return errorResponse(message, 502);
  }
}

// ── Validation ───────────────────────────────────────────────

type ValidationResult =
  | { ok: true;  data: Required<ChatRequest> }
  | { ok: false; error: string };

function validateBody(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const raw = body as Record<string, unknown>;

  // message
  if (typeof raw.message !== "string") {
    return { ok: false, error: "Field 'message' is required and must be a string." };
  }

  const message = raw.message.trim();

  if (message.length === 0) {
    return { ok: false, error: "Message cannot be empty." };
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return {
      ok: false,
      error: `Message exceeds the maximum length of ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  // history (optional)
  let history: GroqChatMessage[] = [];

  if (raw.history !== undefined) {
    if (!Array.isArray(raw.history)) {
      return { ok: false, error: "Field 'history' must be an array." };
    }

    if (raw.history.length > MAX_HISTORY_ENTRIES) {
      return {
        ok: false,
        error: `History cannot exceed ${MAX_HISTORY_ENTRIES} messages.`,
      };
    }

    for (const entry of raw.history) {
      if (
        typeof entry !== "object" ||
        entry === null ||
        !("role" in entry) ||
        !("content" in entry) ||
        (entry.role !== "user" && entry.role !== "assistant") ||
        typeof entry.content !== "string"
      ) {
        return {
          ok: false,
          error: "Each history entry must have role ('user'|'assistant') and content (string).",
        };
      }
    }

    history = raw.history as GroqChatMessage[];
  }

  return { ok: true, data: { message, history } };
}

// ── Helpers ──────────────────────────────────────────────────

function errorResponse(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}
