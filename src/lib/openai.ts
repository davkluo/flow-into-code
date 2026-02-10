import OpenAI from "openai";

export const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30_000, // 30s per request (default is 10 minutes)
  maxRetries: 1,
});
