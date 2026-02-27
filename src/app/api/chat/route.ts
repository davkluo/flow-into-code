import { NextRequest } from "next/server";
import { streamChatCompletion } from "@/services/llm/client";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";
import { chatRateLimit } from "@/lib/rateLimit";
import { Message } from "@/types/chat";

export async function POST(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const { success, reset } = await chatRateLimit.limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return new Response(JSON.stringify({ error: "Too Many Requests" }), {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    });
  }

  const { messages }: { messages: Message[] } = await req.json();

  const stream = await streamChatCompletion({ messages });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
