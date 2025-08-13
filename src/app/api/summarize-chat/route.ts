import { NextRequest, NextResponse } from "next/server";
import { Message } from "@/types/chat";
import { DISTILLED_SUMMARY_PROMPT, SECTION_SUMMARY_PROMPTS } from "@/lib/prompts";
import { PracticeProblem, SectionKey } from "@/types/practice";
import { getProblemContext } from "@/lib/buildContext";
import { SectionArtifact } from "@/hooks/useLLM";

export async function POST(req: NextRequest) {
  const { sectionKey, messages, problem, artifact }: { sectionKey: SectionKey; messages: Message[]; problem: PracticeProblem; artifact: SectionArtifact; } =
    await req.json();

  const payload: Message[] = [
    { role: "system", content: DISTILLED_SUMMARY_PROMPT.trim() },
    { role: "system", content: SECTION_SUMMARY_PROMPTS[sectionKey].trim() },
    { role: "system", content: getProblemContext(problem) },
    ...messages,
  ];

  if (artifact) {
    payload.push({
      role: "system",
      content: `Artifact for ${sectionKey}: ${artifact.content}` + (artifact.language ? ` (Language: ${artifact.language})` : ""),
    });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: payload,
      temperature: 0.2, // more deterministic for summaries
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.error?.message ?? "Unknown error" },
      { status: res.status }
    );
  }

  return NextResponse.json({
    summary: data.choices[0].message.content,
  });
}
