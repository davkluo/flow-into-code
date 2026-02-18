import { NextRequest } from "next/server";
import { streamChatCompletion } from "@/services/llm/client";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { Message } from "@/types/chat";

export async function POST(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

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
