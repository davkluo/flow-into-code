import { LCProblem } from "@/types/leetcode";
import { lcProblemListQuery } from "./graphql";

export async function fetchLCProblems(): Promise<LCProblem[]> {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: lcProblemListQuery,
      variables: {
        categorySlug: "",
        skip: 0,
        limit: 5000, // LeetCode has 3625 problems as of July 2025
        filters: {},
      },
    }),
    next: { revalidate: 86400 }, // Revalidate every 24 hours
  });

  if (!res.ok) {
    throw new Error(`LeetCode GraphQL failed: ${res.status}`);
  }

  const json = await res.json();

  const questions = json?.data?.problemsetQuestionList?.questions;

  if (!Array.isArray(questions)) {
    throw new Error("Unexpected LeetCode GraphQL response shape");
  }

  return questions as LCProblem[];
}
