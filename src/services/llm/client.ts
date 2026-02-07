import { openAIClient } from "@/lib/openai";

interface CallLLMInput {
  prompt: string;
  model?: string;
  temperature?: number;
}

export async function callLLM({
  prompt,
  model = "gpt-4o-mini",
  temperature = 0,
}: CallLLMInput): Promise<string> {
  const res = await openAIClient.chat.completions.create({
    model,
    temperature,
    messages: [
      {
        role: "system",
        content: "You are a precise JSON-producing assistant.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = res.choices[0]?.message?.content;

  if (!content) {
    throw new Error("LLM returned empty response");
  }

  return content;
}
