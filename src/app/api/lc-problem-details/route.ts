// src/app/api/leetcode-question/route.ts
import { lcProblemDetailQuery } from "@/services/leetcode/graphql";

const LEETCODE_GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

export async function POST(req: Request) {
  try {
    const { titleSlug } = await req.json();

    const res = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
      },
      body: JSON.stringify({
        query: lcProblemDetailQuery,
        variables: { titleSlug },
      }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("LeetCode API error:", errorText);
      return new Response("Upstream error", { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error("API Route Error:", err);
    return new Response("Internal server error", { status: 500 });
  }
}