import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/chat";

export async function POST(req: NextRequest) {
  const { messages }: { messages: Message[]; } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.error.message }, { status: res.status });
  }

  return NextResponse.json({ message: data.choices[0].message.content });
}
