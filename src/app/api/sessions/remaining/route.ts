import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { DAILY_SESSION_LIMIT } from "@/constants/practice";
import * as userRepo from "@/repositories/firestore/userRepo";

export async function GET(req: NextRequest) {
  const uid = await verifyFirebaseToken(req);
  if (!uid) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const user = await userRepo.getById(uid);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (user.role !== "user") {
    return new Response(JSON.stringify({ remaining: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" UTC
  const existing = user.dailySessions;
  const usedToday = !existing || existing.date !== today ? 0 : existing.count;

  return new Response(
    JSON.stringify({ remaining: Math.max(0, DAILY_SESSION_LIMIT - usedToday) }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
