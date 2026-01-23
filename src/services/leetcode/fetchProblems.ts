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

  const json = await res.json();

  return json.data.problemsetQuestionList.questions;
}
