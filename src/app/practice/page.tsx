import { PracticeAccordionSections } from "@/components/pages/PracticeAccordionSections";
import { Timer } from "@/components/pages/Timer";
import { TimerProvider } from "@/context/TimerContext";
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
    <TimerProvider defaultTime={3}>
      <div className="px-12 py-8 pb-16">
        <h1 className="mb-4 text-2xl font-bold">Practice Problems</h1>
        <div>
          <PracticeAccordionSections problems={problems} />
        </div>
      </div>
      <Timer />
    </TimerProvider>
  );
}
