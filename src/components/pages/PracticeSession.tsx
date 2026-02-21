"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import { getProblemDataApiPath } from "@/constants/api";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { useTimerActions } from "@/context/TimerContext";
import { useAuth } from "@/hooks/useAuth";
import { useLLM } from "@/hooks/useLLM";
import { authFetch } from "@/lib/authFetch";
import { SectionKey } from "@/types/practice";
import { Problem, ProblemDetails } from "@/types/problem";
import { Button } from "../ui/button";
import { AlgorithmDesignSection } from "./AlgorithmDesignSection";
import { ApproachAndReasoningSection } from "./ApproachAndReasoningSection";
import { ComplexityAnalysisSection } from "./ComplexityAnalysisSection";
import { ImplementationSection } from "./ImplementationSection";
import { ProblemReferenceSheet } from "./ProblemReferenceSheet";
import { SectionSummarySheet } from "./SectionSummarySheet";
import { SessionBreadcrumb } from "./SessionBreadcrumb";
import { SessionLoadingScreen } from "./SessionLoadingScreen";
import { Timer } from "./Timer";
import { UnderstandingSection } from "./UnderstandingSection";

export function PracticeSession() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(
    null,
  );

  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [highestVisitedIndex, setHighestVisitedIndex] = useState(0);
  const [isProblemSheetOpen, setIsProblemSheetOpen] = useState(false);
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);
  const [summarySectionKey, setSummarySectionKey] = useState<SectionKey>(
    SECTION_ORDER[0],
  );

  const { start: startTimer, reset: resetTimer } = useTimerActions();
  const { status } = useAuth();
  const {
    sendMessage: llmSendMessage,
    getMessages: llmGetMessages,
    cooldownUntil: llmCooldownUntil,
    reset: llmReset,
  } = useLLM(problem, problemDetails);
  const router = useRouter();
  const pollAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

  const pollForPractice = useCallback(
    async (slug: string): Promise<ProblemDetails | null> => {
      pollAbortRef.current?.abort();
      const controller = new AbortController();
      pollAbortRef.current = controller;

      const delays = [1000, 2000, 4000, 8000, 8000, 8000];
      for (const delay of delays) {
        if (controller.signal.aborted) return null;
        await new Promise((r) => setTimeout(r, delay));
        if (controller.signal.aborted) return null;

        try {
          const res = await authFetch(getProblemDataApiPath(slug, "practice"), {
            signal: controller.signal,
          });
          if (res.ok) return (await res.json()) as ProblemDetails;
          if (res.status !== 202) return null;
        } catch {
          if (controller.signal.aborted) return null;
        }
      }
      return null;
    },
    [],
  );

  const generatePractice = useCallback(
    async (slug: string): Promise<ProblemDetails | null> => {
      try {
        const res = await authFetch(getProblemDataApiPath(slug, "practice"), {
          method: "POST",
        });

        if (res.ok) return (await res.json()) as ProblemDetails;
        if (res.status === 202) return pollForPractice(slug);
        throw new Error("Failed to generate practice data");
      } catch (err) {
        console.error("Failed to generate practice data:", err);
        return null;
      }
    },
    [pollForPractice],
  );

  const handleStartSession = useCallback(
    async (
      selectedProblem: Problem,
      selectedProblemDetails: ProblemDetails,
    ) => {
      llmReset();
      setProblem(selectedProblem);
      setProblemDetails(selectedProblemDetails);
      setIsPreparingSession(true);

      try {
        const slug = selectedProblem.titleSlug;
        let data: ProblemDetails | null = null;

        const res = await authFetch(getProblemDataApiPath(slug, "practice"));
        if (res.status === 200) {
          data = (await res.json()) as ProblemDetails;
        } else if (res.status === 202) {
          data = await pollForPractice(slug);
        } else if (res.status === 404) {
          data = await generatePractice(slug);
        }

        if (data) {
          setProblemDetails(data);
        }

        setIsPracticeStarted(true);
        setCurrentSectionIndex(0);
        setHighestVisitedIndex(0);
        resetTimer();
        startTimer();
        toast("Session started", {
          description: "Good luck! The timer is now running.",
        });
      } catch (err) {
        console.error("Failed to start practice session:", err);
      } finally {
        setIsPreparingSession(false);
      }
    },
    [llmReset, pollForPractice, generatePractice, resetTimer, startTimer],
  );

  const isLastSection = currentSectionIndex >= SECTION_ORDER.length - 1;

  const proceedNextSection = () => {
    if (isLastSection) return;
    const nextIndex = currentSectionIndex + 1;
    setCurrentSectionIndex(nextIndex);
    setHighestVisitedIndex((prev) => Math.max(prev, nextIndex));
  };

  const goBackSection = () => {
    if (currentSectionIndex <= 0) return;
    setCurrentSectionIndex((prev) => prev - 1);
  };

  return (
    <div className="relative w-full">
      {!isPracticeStarted && !isPreparingSession && (
        <ProblemSelectSection
          onProblemSelect={handleStartSession}
          isEditable={true}
        />
      )}

      {isPreparingSession && <SessionLoadingScreen />}

      {isPracticeStarted && problem && problemDetails && (
        <>
          <SessionBreadcrumb
            problemTitle={problem.title}
            currentSectionIndex={currentSectionIndex}
            highestVisitedIndex={highestVisitedIndex}
            onProblemClick={() => setIsProblemSheetOpen(true)}
            onSectionNavigate={(sectionKey) =>
              setCurrentSectionIndex(SECTION_ORDER.indexOf(sectionKey))
            }
            onSectionSummaryClick={(sectionKey) => {
              setSummarySectionKey(sectionKey);
              setIsSummarySheetOpen(true);
            }}
          />

          <div className="mx-auto mt-6 max-w-5xl overflow-hidden pb-32">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSectionIndex * 100}%)` }}
            >
              <div className="w-full shrink-0 px-3.5" inert={currentSectionIndex !== 0}>
                <UnderstandingSection
                  messages={llmGetMessages("problem_understanding")}
                  onSend={(content, snapshot) =>
                    llmSendMessage("problem_understanding", content, snapshot)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div className="w-full shrink-0 px-3.5" inert={currentSectionIndex !== 1}>
                <ApproachAndReasoningSection
                  messages={llmGetMessages("approach_and_reasoning")}
                  onSend={(content, snapshot) =>
                    llmSendMessage("approach_and_reasoning", content, snapshot)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div className="w-full shrink-0 px-3.5" inert={currentSectionIndex !== 2}>
                <AlgorithmDesignSection
                  messages={llmGetMessages("algorithm_design")}
                  onSend={(content, snapshot) =>
                    llmSendMessage("algorithm_design", content, snapshot)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div className="w-full shrink-0 px-3.5" inert={currentSectionIndex !== 3}>
                <ImplementationSection
                  messages={llmGetMessages("implementation")}
                  onSend={(content, snapshot) =>
                    llmSendMessage("implementation", content, snapshot)
                  }
                  cooldownUntil={llmCooldownUntil}
                  codeSnippets={problemDetails.source.codeSnippets}
                />
              </div>

              <div className="w-full shrink-0 px-3.5" inert={currentSectionIndex !== 4}>
                <ComplexityAnalysisSection
                  messages={llmGetMessages("complexity_analysis")}
                  onSend={(content, snapshot) =>
                    llmSendMessage("complexity_analysis", content, snapshot)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>
            </div>
          </div>

          {/* Fixed bottom bar: back | timer | next */}
          <div className="fixed bottom-8 left-0 z-40 flex w-full items-end gap-5 px-6">
            <div className="mb-1 flex min-w-0 flex-1 justify-end">
              {currentSectionIndex > 0 && (
                <Button
                  variant="link"
                  onClick={goBackSection}
                  className="text-muted-foreground hover:text-foreground bg-background/90 mt-2 w-fit cursor-pointer rounded-xl px-2.5 py-1 text-sm whitespace-normal underline underline-offset-2 shadow-[0_0_20px_14px_var(--background)] backdrop-blur-sm"
                >
                  ← Back:{" "}
                  {
                    SECTION_KEY_TO_DETAILS[
                      SECTION_ORDER[currentSectionIndex - 1]
                    ].title
                  }
                </Button>
              )}
            </div>

            <Timer />

            <div className="mb-1 flex min-w-0 flex-1 justify-start">
              {!isLastSection && (
                <Button
                  variant="link"
                  onClick={proceedNextSection}
                  className="text-muted-foreground hover:text-foreground bg-background/90 mt-2 w-fit cursor-pointer rounded-xl px-2.5 py-1 text-sm whitespace-normal underline underline-offset-2 shadow-[0_0_20px_14px_var(--background)] backdrop-blur-sm"
                >
                  Next:{" "}
                  {
                    SECTION_KEY_TO_DETAILS[
                      SECTION_ORDER[currentSectionIndex + 1]
                    ].title
                  }{" "}
                  →
                </Button>
              )}
            </div>
          </div>

          <ProblemReferenceSheet
            problem={problem}
            problemDetails={problemDetails}
            open={isProblemSheetOpen}
            onOpenChange={setIsProblemSheetOpen}
          />

          <SectionSummarySheet
            sectionKey={summarySectionKey}
            open={isSummarySheetOpen}
            onOpenChange={setIsSummarySheetOpen}
          />
        </>
      )}
    </div>
  );
}
