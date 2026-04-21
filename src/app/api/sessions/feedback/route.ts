import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { getGeneralRateLimit } from "@/lib/rateLimit";
import { DailyLimitExceededError } from "@/lib/errors";
import { generateSessionFeedback } from "@/services/sessionFeedback";
import type { LLMState } from "@/hooks/useLLM";

export const POST = withAuth(async (req, uid) => {
  const { success, reset } = await getGeneralRateLimit().limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const body: { problemSlug: string; llmState: LLMState } = await req.json();
  const { problemSlug, llmState } = body;

  if (!problemSlug || !llmState) {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }

  try {
    const sessionId = await generateSessionFeedback(uid, problemSlug, llmState);
    return NextResponse.json({ sessionId });
  } catch (err) {
    if (err instanceof DailyLimitExceededError) {
      return NextResponse.json(
        { error: "Daily session limit reached" },
        { status: 429 },
      );
    }
    console.error("Session feedback generation failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
});
