import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { DailyLimitExceededError } from "@/lib/errors";
import { generateSessionFeedback } from "@/services/sessionFeedback";
import type { LLMState } from "@/hooks/useLLM";

export const POST = withAuth(async (req, uid) => {
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
