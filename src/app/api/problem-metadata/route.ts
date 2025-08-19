import { NextResponse } from "next/server";
import { openAIClient } from "@/lib/openai";
import { PROBLEM_METADATA_PROMPT } from "@/lib/prompts";
import { PracticeProblemSource } from "@/types/practice";
import { ProblemMetadata } from "@/types/firestore";
import { ProblemMetadataSchema } from "@/types/problems";

export async function POST(req: Request) {
  try {
    const { title, source, description, tags } = await req.json();

    const response = await openAIClient.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: PROBLEM_METADATA_PROMPT,
        },
        {
          role: "system",
          content: `
          Title: ${title}
          Source: ${source === PracticeProblemSource.LeetCode ? "LeetCode" : "AI Generated"}
          Description: ${description}
          ${tags ? `Tags: ${tags.join(", ")}` : ""}
          `,
        },
      ],
    });

    const raw = response.choices[0].message?.content;
    if (!raw) {
      return NextResponse.json({ error: "No metadata returned from LLM" }, { status: 500 });
    }

    let parsed: ProblemMetadata;
    try {
      parsed = ProblemMetadataSchema.parse(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to parse LLM output as ProblemMetadata:", e);
      console.error("Invalid metadata format:", raw);
      return NextResponse.json({ error: "Invalid metadata format:", raw }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Error in problem-metadata API route:", err);
    return NextResponse.json(
      { error: "Failed to generate problem metadata" },
      { status: 500 }
    );
  }
}