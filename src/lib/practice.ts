import { SectionKey } from "@/types/practice";

interface SectionDetails {
  title: string;
  description: string;
  explanation: string;
}

export const SECTION_KEY_TO_DETAILS: Record<SectionKey, SectionDetails> = {
  problem_understanding: {
    title: "Understanding",
    description:
      "Demonstrate your understanding of the problem by restating it in your own words and asking clarifying questions. " +
      "Identify edge cases and constraints that may impact your solution.",
    explanation:
      "Demonstrating your understanding of the problem shows how you think before you code. " +
      "Interviewers look for candidates who clarify requirements, surface ambiguities, and identify edge cases early, " +
      "since many incorrect solutions come from solving the wrong problem rather than poor implementation. " +
      "In real engineering roles, requirements are often incomplete or evolving, and strong engineers proactively align on intent " +
      "to reduce rework and build the right solution the first time.",
  },

  approach_and_reasoning: {
    title: "Thought Process",
    description:
      "Explain your high-level approach and the reasoning behind it before writing code. " +
      "Discuss why you chose this strategy and any alternatives you considered.",
    explanation:
      "Interviewers want insight into how you break down problems and evaluate tradeoffs. " +
      "Clearly explaining your approach demonstrates structured thinking and helps others follow your logic. " +
      "In real-world engineering, being able to justify decisions and communicate reasoning is essential for collaboration, " +
      "design reviews, and long-term maintainability.",
  },

  algorithm_design: {
    title: "Pseudocode",
    description:
      "Translate your approach into clear, step-by-step pseudocode that outlines the core logic of your solution.",
    explanation:
      "Pseudocode shows that you can move from abstract reasoning to concrete execution without getting lost in syntax. " +
      "Interviewers look for logical completeness and clarity of flow before implementation. " +
      "As an engineer, this skill helps you design reliable systems, catch logical gaps early, and communicate ideas " +
      "before committing to code.",
  },

  implementation: {
    title: "Implementation",
    description:
      "Implement your algorithm in clean, readable code that correctly handles edge cases and follows best practices.",
    explanation:
      "This section evaluates your ability to translate a well-defined plan into working software. " +
      "Interviewers look for correctness, clarity, and attention to detail rather than clever tricks. " +
      "In production environments, readable and maintainable code is critical for long-term ownership, debugging, " +
      "and collaboration with other engineers.",
  },

  complexity_analysis: {
    title: "Complexity Analysis",
    description:
      "Analyze the time and space complexity of your solution and explain how it scales with input size.",
    explanation:
      "Complexity analysis demonstrates your awareness of performance constraints and tradeoffs. " +
      "Interviewers want to see that you understand how your solution behaves beyond small examples. " +
      "In real systems, this mindset helps engineers make informed decisions that balance efficiency, readability, " +
      "and scalability as requirements grow.",
  },
};
