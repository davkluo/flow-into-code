import { NextRequest, NextResponse } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { openAIClient } from "@/lib/openai";
import { SESSION_METADATA_PROMPT } from "@/lib/prompts";
import { RagMetadataPartial, RagMetadataPartialSchema, RagMetadataSchema } from "@/types/session";
import { SectionKey } from "@/types/practice";
import { LanguageKey } from "@/lib/codeMirror";
import { RagMetadata } from "@/types/firestore";

export async function POST(req: NextRequest) {
  try {
    const {
      distilledSummaries,
      implementation,
      implementationLanguage,
      pseudocode
    }: {
      distilledSummaries: Record<SectionKey, string>;
      implementation: string;
      implementationLanguage: LanguageKey;
      pseudocode?: string;
    } = await req.json();

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SESSION_METADATA_PROMPT,
      },
      {
        role: "system",
        content: "Distilled Summaries:\n" + JSON.stringify(distilledSummaries)
      },
      {
        role: "system",
        content: `Implementation in ${implementationLanguage}:\n` + implementation
      },
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
      return NextResponse.json(
        { error: "No session metadata generated" },
        { status: 500 }
      );
    }

    const partialMetadata: RagMetadataPartial = RagMetadataPartialSchema
      .parse(JSON.parse(raw));

    const textForEmbedding = [
      "Problem Summary:",
      distilledSummaries.selection,
      "Reasoning Summary:",
      partialMetadata.reasoningSummary,
      "Key Takeaways:",
      ...(partialMetadata.keyTakeaways || []),
    ].join("\n");

    const embeddingRes = await openAIClient.embeddings.create({
      model: "text-embedding-3-small",
      input: textForEmbedding,
    });

    const ragMetadata: RagMetadata = RagMetadataSchema.parse({
      ...partialMetadata,
      embedding: embeddingRes.data[0].embedding,
    });
    return NextResponse.json(ragMetadata);
  } catch (err) {
    console.error("Error generating session metadata:", err);
    return NextResponse.json(
      { error: "Failed to generate session metadata" },
      { status: 500 }
    );
  }
}
