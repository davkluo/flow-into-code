import { LLMState } from "@/hooks/useLLM";
import { capitalize } from "@/lib/formatting";
import { PRACTICE_SECTIONS } from "@/constants/practice";
import { PracticeProblem } from "@/types/practice";

export const getProblemContext = (problem: PracticeProblem): string => {
  return `Problem: ${problem.title} (LeetCode #${problem.id})\n${problem.content}`;
};

export const getDistilledSummariesContext = (llmState: LLMState): string => {
  const summaries = PRACTICE_SECTIONS.map((section) => {
    const summary = llmState[section]?.distilledSummary;
    return summary ? `• ${capitalize(section)}: ${summary}` : null;
  }).filter(Boolean);

  return summaries.length > 0
    ? `Summary of conversations thus far:\n\n${summaries.join("\n\n")}`
    : "";
};

export const getArtifactsContext = (llmState: LLMState): string => {
  const pseudocode = llmState.pseudocode?.artifact
    ? `Pseudocode:\n${llmState.pseudocode.artifact.content}`
    : null;

  const code = llmState.implementation?.artifact
    ? `Code:\nLanguage: ${llmState.implementation.artifact.language}\n${llmState.implementation.artifact.content}`
    : null;

  const artifacts = [pseudocode, code].filter(Boolean);

  return artifacts.length > 0 ? `Artifacts:\n\n${artifacts.join("\n\n")}` : "";
};
