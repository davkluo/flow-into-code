import { NextResponse } from "next/server";
import { openAIClient } from "@/lib/openai";
import { TAG_METADATA_PROMPT } from "@/lib/prompts";
import { denormalizeTagName } from "@/lib/firestore/tags";
import { TagDoc } from "@/types/firestore";
import { TagDocSchema } from "@/types/tags";

export async function POST(req: Request) {
  try {
    const { tagId } = await req.json();
    const displayName = denormalizeTagName(tagId);

    const response = await openAIClient.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: TAG_METADATA_PROMPT },
        { role: "system", content: `Tag: ${tagId}` },
      ],
    });

    const raw = response.choices[0].message?.content;
    if (!raw) {
      return NextResponse.json({ error: "No tag metadata generated" }, { status: 500 });
    }

    const llmData = JSON.parse(raw);

    const tagDoc: TagDoc = TagDocSchema.parse({
      id: tagId,
      displayName,
      commonHints: llmData.commonHints,
      commonPitfalls: llmData.commonPitfalls,
    });

    return NextResponse.json(tagDoc);
  } catch (err) {
    console.error("Error generating tag metadata:", err);
    return NextResponse.json({ error: "Failed to generate tag metadata" }, { status: 500 });
  }
}
