import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}

let _chatRateLimit: Ratelimit | null = null;
let _executeRateLimit: Ratelimit | null = null;

/**
 * 7 requests per 60-second sliding window per user.
 *
 * Slightly more permissive than the 10s client-side cooldown (~6/min) to give
 * one retry's worth of headroom for failed requests. This limit only activates
 * for API-level abuse bypassing the UI entirely.
 */
export function getChatRateLimit(): Ratelimit {
  if (!_chatRateLimit) {
    _chatRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(7, "60 s"),
      prefix: "ratelimit:chat",
    });
  }
  return _chatRateLimit;
}

/**
 * 10 requests per 60-second sliding window per user.
 *
 * This is the main rate limit for the "Run Code" button, which is more
 * permissive than the chat rate limit to allow for iterative debugging. The UI
 * enforces a 15s cooldown between runs, but this server-side limit gives some
 * headroom for retries and failed requests.
 */
export function getExecuteRateLimit(): Ratelimit {
  if (!_executeRateLimit) {
    _executeRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "ratelimit:execute",
    });
  }
  return _executeRateLimit;
}
