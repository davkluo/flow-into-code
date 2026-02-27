import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LANGUAGE } from "@/constants/languages";
import { executeRateLimit } from "@/lib/rateLimit";
import { verifyFirebaseToken } from "@/lib/firebase/verifyToken";

// Default value references the docker-compose service name and port
const EXECUTOR_URL = process.env.EXECUTOR_URL ?? "http://executor:8080";

export async function POST(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { success, reset } = await executeRateLimit.limit(uid);
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
}
