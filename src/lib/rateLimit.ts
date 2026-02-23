import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * 4 requests per 60-second sliding window per user.
 *
 * Slightly more permissive than the 20s client-side cooldown (~3/min) to give
 * one retry's worth of headroom for failed requests. This limit only activates
 * for API-level abuse bypassing the UI entirely.
 */
export const chatRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(4, "60 s"),
  prefix: "ratelimit:chat",
});

/**
 * 10 requests per 60-second sliding window per user.
 *
 * This is the main rate limit for the "Run Code" button, which is more
 * permissive than the chat rate limit to allow for iterative debugging. The UI
 * enforces a 15s cooldown between runs, but this server-side limit gives some
 * headroom for retries and failed requests.
 */
export const executeRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "ratelimit:execute",
});
