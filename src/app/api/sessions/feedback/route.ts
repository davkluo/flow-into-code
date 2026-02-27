import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { DailyLimitExceededError } from "@/lib/errors";
import { generateSessionFeedback } from "@/services/sessionFeedback";
import type { LLMState } from "@/hooks/useLLM";

export async function POST(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const body: { problemSlug: string; llmState: LLMState } = await req.json();
  const { problemSlug, llmState } = body;

  if (!problemSlug || !llmState) {
    return new Response(JSON.stringify({ error: "Bad Request" }), {
      status: 400,
    });
  }

  try {
    const sessionId = await generateSessionFeedback(uid, problemSlug, llmState);
    return new Response(JSON.stringify({ sessionId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    if (err instanceof DailyLimitExceededError) {
      return new Response(JSON.stringify({ error: "Daily session limit reached" }), {
        status: 429,
      });
    }
    console.error("Session feedback generation failed:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
