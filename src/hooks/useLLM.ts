import { useState } from "react";
import { SECTION_PROMPTS, GLOBAL_PROMPT } from "@/lib/prompts";
import { getArtifactsContext, getDistilledSummariesContext, getProblemContext } from "@/lib/buildContext";
import { PracticeProblem, SectionKey } from "@/types/practice";
import { Message } from "@/types/chat";
import { LanguageKey } from "@/lib/codeMirror";

type ArtifactKind = "code" | "pseudocode";
export type SectionArtifact = {
  kind: ArtifactKind;
  content: string;
  language?: LanguageKey;
};

type SectionChat = {
  messages: Message[];
  distilledSummary?: string;
  artifact?: SectionArtifact;
};

export type LLMState = {
  [section in SectionKey]?: SectionChat;
};

export function useLLM(problem: PracticeProblem | null) {
  const [llmState, setLlmState] = useState<LLMState>({});

  if (!problem) {
    return {
      sendMessage: async () => { },
      getMessages: () => [],
      getDistilledSummary: () => undefined,
      setDistilledSummary: () => { },
      generateDistilledSummary: async () => undefined,
      hasDistilledSummaries: () => false,
      getAllDistilledSummaries: () => ({} as Record<SectionKey, string>),
      getArtifact: () => undefined,
      setArtifact: () => { },
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

  const generateDistilledSummary = async (
    section: SectionKey
  ): Promise<string | undefined> => {
    const messages = llmState[section]?.messages ?? [];
    const artifact = llmState[section]?.artifact;
    if (!messages.length && section !== "selection") return undefined;

    const res = await fetch("/api/summarize-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionKey: section, messages, problem, artifact }),
    });

    if (!res.ok) {
      console.error("Distill failed:", await res.text());
      return undefined;
    }

    const data = await res.json();
    console.log(data);
    if (data.summary) {
      setDistilledSummary(section, data.summary);
      return data.summary;
    }
  };

  const hasDistilledSummaries = (): boolean => {
    return Object.values(llmState).some(
      (section) => section?.distilledSummary && section.distilledSummary.trim() !== ""
    );
  };

  const getAllDistilledSummaries = (): Record<SectionKey, string> => {
    return Object.entries(llmState).reduce((acc, [sectionKey, section]) => {
      if (section?.distilledSummary) {
        acc[sectionKey as SectionKey] = section.distilledSummary;
      }
      return acc;
    }, {} as Record<SectionKey, string>);
  };

  const getArtifact = (section: SectionKey): SectionArtifact | undefined => {
    return llmState[section]?.artifact;
  };

  const setArtifact = (section: SectionKey, artifact: SectionArtifact) => {
    setLlmState(prev => ({
      ...prev,
      [section]: {
        messages: prev[section]?.messages ?? [],
        distilledSummary: prev[section]?.distilledSummary,
        artifact,
      },
    }));
  };

  const sendMessage = async (
    section: SectionKey,
    userMessage: string
  ): Promise<void> => {
    const messages = llmState[section]?.messages ?? [];
    messages.push({ role: "user", content: userMessage });
    updateSection(section, [...messages]);

    const sharedContext = getDistilledSummariesContext(llmState);
    const artifactsContext = getArtifactsContext(llmState);

    const payload: Message[] = [
      { role: "system", content: GLOBAL_PROMPT.trim() },
      { role: "system", content: getProblemContext(problem) },
      { role: "system", content: SECTION_PROMPTS[section] },
    ];
    if (sharedContext) {
      payload.push({ role: "system", content: sharedContext });
    }
    if (artifactsContext) {
      payload.push({ role: "system", content: artifactsContext });
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
    generateDistilledSummary,
    hasDistilledSummaries,
    getAllDistilledSummaries,
    getArtifact,
    setArtifact,
    llmState,
  };
}