import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const CHAT_LIMIT_PER_MIN = 7;
const EXECUTE_LIMIT_PER_MIN = 10;
const GENERATE_LIMIT_PER_MIN = 5;
const GENERAL_LIMIT_PER_MIN = 30;

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
let _generatePreviewRateLimit: Ratelimit | null = null;
let _generatePracticeRateLimit: Ratelimit | null = null;
let _generateFeedbackRateLimit: Ratelimit | null = null;
let _generalRateLimit: Ratelimit | null = null;

/**
 * Slightly more permissive than the 10s client-side cooldown (~6/min) to give
 * one retry's worth of headroom for failed requests. This limit only activates
 * for API-level abuse bypassing the UI entirely.
 */
export function getChatRateLimit(): Ratelimit {
  if (!_chatRateLimit) {
    _chatRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(CHAT_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:chat",
    });
  }
  return _chatRateLimit;
}

/**
 * Rate limit for the "Run Code" button. More permissive than the chat limit to
 * allow for iterative debugging. The UI enforces a 15s cooldown between runs,
 * but this server-side limit gives headroom for retries and failed requests.
 */
export function getExecuteRateLimit(): Ratelimit {
  if (!_executeRateLimit) {
    _executeRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(EXECUTE_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:execute",
    });
  }
  return _executeRateLimit;
}

/**
 * Each problem generation layer (preview, practice, feedback) gets its own
 * bucket so the normal flow (preview → practice → feedback) doesn't
 * self-throttle across layers. Generation is idempotent per-slug via
 * optimistic locking, but a user could trigger generation across many slugs.
 */
export function getGeneratePreviewRateLimit(): Ratelimit {
  if (!_generatePreviewRateLimit) {
    _generatePreviewRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(GENERATE_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:generate-preview",
    });
  }
  return _generatePreviewRateLimit;
}

export function getGeneratePracticeRateLimit(): Ratelimit {
  if (!_generatePracticeRateLimit) {
    _generatePracticeRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(GENERATE_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:generate-practice",
    });
  }
  return _generatePracticeRateLimit;
}

export function getGenerateFeedbackRateLimit(): Ratelimit {
  if (!_generateFeedbackRateLimit) {
    _generateFeedbackRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(GENERATE_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:generate-feedback",
    });
  }
  return _generateFeedbackRateLimit;
}

/**
 * Blanket limit for all remaining routes (Firestore reads, user init, etc.).
 * Permissive enough to never affect normal use but blocks automated abuse.
 */
export function getGeneralRateLimit(): Ratelimit {
  if (!_generalRateLimit) {
    _generalRateLimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(GENERAL_LIMIT_PER_MIN, "60 s"),
      prefix: "ratelimit:general",
    });
  }
  return _generalRateLimit;
}
