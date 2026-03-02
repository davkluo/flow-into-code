import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30_000, // 30s per request (default is 10 minutes)
      maxRetries: 1,
    });
  }
  return _client;
}
