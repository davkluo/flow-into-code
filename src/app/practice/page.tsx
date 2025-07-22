import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { lcProblemListQuery as query } from "@/services/leetcode/graphql";
import { Problem } from "@/types/leetcode";

export default async function PracticePage() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
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
    <div className="px-12 py-8">
      <Accordion
        type="multiple"
        className="w-full"
        defaultValue={["accordion-item-problem-selection"]}
      >
        <AccordionItem value="accordion-item-problem-selection">
          <AccordionTrigger>1. Select Problem</AccordionTrigger>
          <ProblemSelectSection problems={problems} />
        </AccordionItem>
        <AccordionItem value="accordion-item-clarification">
          <AccordionTrigger>2. Ask Clarifying Questions</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Display problem here</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-thought-process">
          <AccordionTrigger>3. Explain Thought Process</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-pseudocode">
          <AccordionTrigger>4. Draft Pseudocode</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-implementation">
          <AccordionTrigger>5. Implement Code</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="accordion-item-complexity-analysis">
          <AccordionTrigger>6. Analyze Complexity</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <p>Placeholder</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
