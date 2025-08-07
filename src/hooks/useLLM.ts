import { useState } from "react";
import { SECTION_PROMPTS, GLOBAL_PROMPT } from "@/lib/prompts";
import { getProblemContext } from "@/lib/buildContext";
import { PracticeProblem } from "@/types/practice";
import { Message } from "@/types/chat";
import { capitalize } from "@/lib/formatting";

export type SectionKey = keyof typeof SECTION_PROMPTS;

type SectionChat = {
  messages: Message[];
  distilledSummary?: string;
};

type LLMState = {
  [section in SectionKey]?: SectionChat;
};

const SECTION_ORDER: SectionKey[] = [
  "clarification",
  "thought_process",
  "pseudocode",
  "implementation",
  "complexity_analysis",
];

export function useLLM(problem: PracticeProblem | null) {
  const [llmState, setLlmState] = useState<LLMState>({});

  if (!problem) {
    return {
      sendMessage: async () => { },
      getMessages: () => [],
      getDistilledSummary: () => undefined,
      setDistilledSummary: () => { },
      getAllDistilledSummaries: () => "",
      llmState
    };
  }

  const updateSection = (
    section: SectionKey,
    newMessages: Message[],
    distilledSummary?: string
  ) => {
    setLlmState((prev) => ({
      ...prev,
      [section]: {
        messages: newMessages,
        distilledSummary: distilledSummary ?? prev[section]?.distilledSummary,
      },
    }));
  };

  const getMessages = (section: SectionKey): Message[] => {
    return llmState[section]?.messages ?? [];
  };

  const getDistilledSummary = (section: SectionKey): string | undefined => {
    return llmState[section]?.distilledSummary;
  };

  const setDistilledSummary = (section: SectionKey, summary: string) => {
    setLlmState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        messages: prev[section]?.messages ?? [],
        distilledSummary: summary,
      },
    }));
  };

  const getAllDistilledSummaries = (): string => {
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

  const sendMessage = async (
    section: SectionKey,
    userMessage: string
  ): Promise<void> => {
    const messages = llmState[section]?.messages ?? [];
    messages.push({ role: "user", content: userMessage });
    updateSection(section, [...messages]);

    const sharedContext = getAllDistilledSummaries();

    const payload: Message[] = [
      { role: "system", content: GLOBAL_PROMPT.trim() },
      { role: "system", content: getProblemContext(problem) },
      { role: "system", content: SECTION_PROMPTS[section] },
      { role: "system", content: sharedContext }
    ];
    if (sharedContext) {
      payload.push({ role: "system", content: sharedContext });
    }
    payload.push(...messages);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
    });

    const data = await res.json();
    const aiMsg: Message = {
      role: "assistant",
      content: data.message,
    };

    messages.push(aiMsg);
    updateSection(section, [...messages]);
  };

  return {
    sendMessage,
    getMessages,
    getDistilledSummary,
    setDistilledSummary,
    llmState,
  };
}