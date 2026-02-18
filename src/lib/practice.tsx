import { ReactNode } from "react";
import { SectionKey } from "@/types/practice";

interface SectionDetails {
  title: string;
  description: string;
  explanation: ReactNode;
}

export const SECTION_ORDER: SectionKey[] = [
  "problem_understanding",
  "approach_and_reasoning",
  "algorithm_design",
  "implementation",
  "complexity_analysis",
];

export const SECTION_KEY_TO_DETAILS: Record<SectionKey, SectionDetails> = {
  problem_understanding: {
    title: "Understanding",
    description:
      "Ensure that you fully understand the requirements and edge cases of the problem before diving into the solution. " +
      "Restate the problem in your own words and asking clarifying questions using the AI interviewer if necessary.",
    explanation: (
      <>
        <p>
          Many incorrect solutions come from{" "}
          <strong>solving the wrong problem</strong>, not from poor
          implementation. Taking the time to restate the problem and ask
          clarifying questions shows that you think critically before writing a
          single line of code.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>
            Interviewers specifically watch for candidates who{" "}
            <strong>surface ambiguities</strong> and{" "}
            <strong>identify edge cases early</strong> — it signals a
            methodical, senior-level approach.
          </li>
          <li>
            In real engineering, requirements are rarely complete. Engineers who{" "}
            <strong>proactively align on intent</strong> avoid costly rework and
            build the right thing the first time.
          </li>
        </ul>
      </>
    ),
  },

  approach_and_reasoning: {
    title: "Thought Process",
    description:
      "Explain your high-level approach and the reasoning behind it before writing code. " +
      "Discuss why you chose this strategy and any alternatives you considered.",
    explanation: (
      <>
        <p>
          Your approach reveals <strong>how you think</strong>, not just what
          you know. Interviewers care less about finding the optimal solution
          immediately and more about seeing{" "}
          <strong>structured reasoning</strong> and the ability to evaluate
          tradeoffs.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>
            Clearly explaining <strong>why</strong> you chose a strategy — and
            what alternatives you considered — demonstrates depth that
            distinguishes strong candidates.
          </li>
          <li>
            On the job, this is the foundation of{" "}
            <strong>design reviews</strong>, technical discussions, and
            long-term maintainability. Code without clear reasoning behind it
            becomes a liability.
          </li>
        </ul>
      </>
    ),
  },

  algorithm_design: {
    title: "Pseudocode",
    description:
      "Translate your approach into clear, step-by-step pseudocode that outlines the core logic of your solution.",
    explanation: (
      <>
        <p>
          Pseudocode bridges the gap between{" "}
          <strong>abstract reasoning and concrete execution</strong>. Writing it
          out forces you to confront logical gaps before you get tangled in
          syntax and language details.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>
            Interviewers look for <strong>logical completeness</strong> and{" "}
            <strong>clarity of flow</strong> — a solid pseudocode pass often
            makes implementation nearly mechanical.
          </li>
          <li>
            In practice, sketching logic before coding helps you{" "}
            <strong>catch mistakes early</strong> and communicate ideas to
            teammates before committing to an implementation.
          </li>
        </ul>
      </>
    ),
  },

  implementation: {
    title: "Implementation",
    description:
      "Implement your algorithm in clean, readable code that correctly handles edge cases and follows best practices.",
    explanation: (
      <>
        <p>
          This is where your plan becomes working software. Interviewers are
          looking for <strong>correctness and clarity</strong> — clean code that
          a teammate could read and understand, not clever one-liners.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>
            <strong>Attention to detail</strong> matters: proper edge case
            handling, meaningful variable names, and consistent style signal
            professional-grade work.
          </li>
          <li>
            Production code is <strong>read far more than it is written</strong>
            . Readable, maintainable code is critical for long-term ownership,
            debugging, and collaboration.
          </li>
        </ul>
      </>
    ),
  },

  complexity_analysis: {
    title: "Complexity Analysis",
    description:
      "Analyze the time and space complexity of your solution and explain how it scales with input size.",
    explanation: (
      <>
        <p>
          Understanding complexity shows you can think beyond small test cases
          and reason about how your solution <strong>behaves at scale</strong>.
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-4">
          <li>
            Interviewers expect correct <strong>Big-O analysis</strong> for both
            time and space, and awareness of whether a more optimal approach
            exists — even if you chose not to implement it.
          </li>
          <li>
            On the job, this mindset is what separates code that works in
            development from code that{" "}
            <strong>holds up under real-world data volumes</strong>.
          </li>
        </ul>
      </>
    ),
  },
};
