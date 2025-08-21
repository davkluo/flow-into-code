import { NextRequest, NextResponse } from "next/server";
import { openAIClient } from "@/lib/openai";
import { FEEDBACK_GENERATION_PROMPT } from "@/lib/prompts";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { FeedbackData } from "@/types/firestore";
import { FeedbackSchema } from "@/types/session";

export async function POST(req: NextRequest) {
  try {
    const { distilledSummaries, implementation, implementationLanguage, pseudocode } = await req.json();

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: FEEDBACK_GENERATION_PROMPT },
      { role: "system", content: "Distilled Summaries:\n" + JSON.stringify(distilledSummaries) },
      { role: "system", content: `Implementation in ${implementationLanguage}:\n` + implementation },
    ];
    if (pseudocode) {
      messages.push({ role: "system", content: "Pseudocode:\n" + pseudocode });
    }

    const response = await openAIClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message?.content;
    if (!raw) {
      return NextResponse.json({ error: "No feedback generated" }, { status: 500 });
    }

    const feedback: FeedbackData = FeedbackSchema.parse(JSON.parse(raw));
    return NextResponse.json(feedback);
  } catch (err) {
    console.error("Error generating feedback:", err);
    return NextResponse.json({ error: "Failed to generate feedback" }, { status: 500 });
  }
}