import { PracticeAccordionSections } from "@/components/pages/PracticeAccordionSections";
import { lcProblemListQuery } from "@/services/leetcode/graphql";
import { Problem } from "@/types/leetcode";

export default async function PracticePage() {
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
  const problems: Problem[] = json.data.problemsetQuestionList.questions;

  return (
    <div className="grid grid-cols-5 px-12 py-8">
      <div className="col-span-3">
        <PracticeAccordionSections problems={problems} />
      </div>
    </div>
  );
}
