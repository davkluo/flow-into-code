import { LLMState } from "@/hooks/useLLM";
import { PracticeProblem } from "@/types/practice";
import { SECTION_ORDER } from "@/lib/practice";
import { capitalize } from "@/lib/formatting";

export const getProblemContext = (problem: PracticeProblem): string => {
  if ("title" in problem.problem) {
    return `Problem: ${problem.problem.title} (LeetCode #${problem.problem.id})\n${problem.problem.details.content}`;
  } else {
    return `Custom Problem:\n${problem.problem.description}`;
  }
};

export const getDistilledSummariesContext = (llmState: LLMState): string => {
  const summaries = SECTION_ORDER
    .map((section) => {
      const summary = llmState[section]?.distilledSummary;
      return summary ? `• ${capitalize(section)}: ${summary}` : null;
    })
    .filter(Boolean);

  return summaries.length > 0
    ? `Summary of conversations thus far:\n\n${summaries.join("\n\n")}`
    : "";
};

export const getArtifactsContext = (llmState: LLMState): string => {
  const pseudocode = llmState.pseudocode?.artifact
    ? `Pseudocode:\n${llmState.pseudocode.artifact}`
    : null;

  const code = llmState.implementation?.artifact
    ? `Code:\n${llmState.implementation.artifact}`
    : null;

  const artifacts = [pseudocode, code].filter(Boolean);

  return artifacts.length > 0
    ? `Artifacts:\n\n${artifacts.join("\n\n")}`
    : "";
};