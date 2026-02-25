import { useCallback, useState } from "react";
import { CHAT_API_PATH } from "@/constants/api";
import { CHAT_COOLDOWN_MS } from "@/constants/chat";
import { authFetch } from "@/lib/authFetch";
import { buildProblemContext, buildSnapshotContext } from "@/lib/chat/context";
import { pruneSnapshots } from "@/lib/snapshots";
import { GLOBAL_PROMPT, SECTION_PROMPTS } from "@/services/llm/prompts/chat";
import { Message, SessionMessage } from "@/types/chat";
import { SectionKey, SectionSnapshotData } from "@/types/practice";
import { Problem, ProblemDetails } from "@/types/problem";

// ---------------------------------------------------------------------------
// Snapshot types (typed per-section; tightened in Step 3)
// ---------------------------------------------------------------------------

export type Snapshot = {
  data: SectionSnapshotData;
  messageIndex: number;
  timestamp: number;
};

export type SectionState = {
  snapshots: Snapshot[];
};

// ---------------------------------------------------------------------------
// LLM state — single shared message list + per-section snapshot history
// ---------------------------------------------------------------------------

export type LLMState = {
  messages: SessionMessage[];
  sections: Partial<Record<SectionKey, SectionState>>;
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useLLM(
  problem: Problem | null,
  problemDetails: ProblemDetails | null,
) {
  const [llmState, setLlmState] = useState<LLMState>({
    messages: [],
    sections: {},
  });

  // Unix timestamp (ms) after which sending is allowed again; 0 = no cooldown.
  const [cooldownUntil, setCooldownUntil] = useState(0);

  /** Messages for a specific section, for display in that section's ChatBox. */
  const getMessages = (section: SectionKey): SessionMessage[] =>
    llmState.messages.filter((m) => m.section === section);

  /**
   * Send a user message for a given section.
   *
   * @param section     The current section key.
   * @param userMessage The user's chat input.
   * @param snapshot    Current snapshot of this section's work fields (optional).
   *                    Stored for later analysis; injected into context in Step 3.
   */
  const sendMessage = async (
    section: SectionKey,
    userMessage: string,
    snapshot?: SectionSnapshotData,
  ): Promise<void> => {
    if (!problem || !problemDetails) return;
    if (Date.now() < cooldownUntil) return;

    setCooldownUntil(Date.now() + CHAT_COOLDOWN_MS);

    const userMsg: SessionMessage = {
      role: "user",
      content: userMessage,
      section,
      timestamp: Date.now(),
    };

    // Capture current state before setState (avoids stale closure in async)
    const currentMessages = [...llmState.messages, userMsg];

    // Persist user message + optional snapshot
    setLlmState((prev) => {
      const prevSnapshots = prev.sections[section]?.snapshots ?? [];
      const incoming = snapshot
        ? { data: snapshot, messageIndex: currentMessages.length - 1, timestamp: Date.now() }
        : null;
      return {
        ...prev,
        messages: [...prev.messages, userMsg],
        sections: {
          ...prev.sections,
          [section]: {
            snapshots: incoming ? pruneSnapshots(prevSnapshots, incoming) : prevSnapshots,
          },
        },
      };
    });

    // Build payload — system messages + full session history
    const fullHistory = currentMessages.map(
      (m): Message => ({ role: m.role, content: m.content }),
    );

    const snapshotContext = buildSnapshotContext(llmState.sections);

    const payload: Message[] = [
      { role: "system", content: GLOBAL_PROMPT.trim() },
      { role: "system", content: buildProblemContext(problem, problemDetails) },
      { role: "system", content: SECTION_PROMPTS[section].trim() },
      ...(snapshotContext
        ? [{ role: "system" as const, content: snapshotContext }]
        : []),
      ...fullHistory,
    ];

    const res = await authFetch(CHAT_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
    });

    if (!res.ok || !res.body) return;

    // Add empty assistant placeholder — ChatBox shows loading state until content arrives
    setLlmState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        { role: "assistant", content: "", section, timestamp: Date.now() },
      ],
    }));

    // Stream content into the last assistant message
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    outer: while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") break outer;

        try {
          const chunk = JSON.parse(data);
          const delta: string = chunk.delta ?? "";
          if (!delta) continue;

          setLlmState((prev) => {
            const msgs = [...prev.messages];
            // Update the last assistant message in-place
            for (let i = msgs.length - 1; i >= 0; i--) {
              if (msgs[i].role === "assistant") {
                msgs[i] = { ...msgs[i], content: msgs[i].content + delta };
                break;
              }
            }
            return { ...prev, messages: msgs };
          });
        } catch {
          // Ignore malformed SSE chunks
        }
      }
    }
  };

  /**
   * Returns a copy of llmState with current field values merged in as a final
   * snapshot for each section. Use this before submitting for feedback to capture
   * any edits made after the last sendMessage call. Pruning is applied so
   * unchanged fields don't add redundant snapshots.
   */
  const getFinalState = (
    currentFields: Partial<Record<SectionKey, SectionSnapshotData>>,
  ): LLMState => {
    const finalSections = { ...llmState.sections };
    for (const [key, data] of Object.entries(currentFields) as [
      SectionKey,
      SectionSnapshotData,
    ][]) {
      const existing = finalSections[key]?.snapshots ?? [];
      const incoming: Snapshot = {
        data,
        messageIndex: llmState.messages.length,
        timestamp: Date.now(),
      };
      finalSections[key] = { snapshots: pruneSnapshots(existing, incoming) };
    }
    return { ...llmState, sections: finalSections };
  };

  const reset = useCallback(() => {
    setLlmState({ messages: [], sections: {} });
    setCooldownUntil(0);
  }, []);

  return {
    sendMessage,
    getMessages,
    getFinalState,
    cooldownUntil,
    reset,
  };
}
