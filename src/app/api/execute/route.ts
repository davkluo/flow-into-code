import { NextResponse } from "next/server";
import { DEFAULT_LANGUAGE } from "@/constants/languages";
import { getExecuteRateLimit } from "@/lib/rateLimit";
import { withAuth } from "@/lib/withAuth";

// Default value references the docker-compose service name and port
const EXECUTOR_URL = process.env.EXECUTOR_URL ?? "http://executor:8080";

export const POST = withAuth(async (req, uid) => {
  const { success, reset } = await getExecuteRateLimit().limit(uid);
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too Many Requests" },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfter) },
      },
    );
  }

  const { code, language = DEFAULT_LANGUAGE } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json(
      { error: "Code is required" },
      {
        status: 400,
      },
    );
  }

  const res = await fetch(`${EXECUTOR_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, language }),
    signal: AbortSignal.timeout(15000), // executor allows 10s + overhead
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Execution service unavailable" },
      {
        status: 502,
      },
    );
  }

  return NextResponse.json(await res.json());
});
