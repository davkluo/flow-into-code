"use client";

import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  getProblemDataApiPath,
  SESSION_FEEDBACK_API_PATH,
} from "@/constants/api";
import { DEFAULT_LANGUAGE } from "@/constants/languages";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { useTimerActions } from "@/context/TimerContext";
import { useAuth } from "@/hooks/useAuth";
import { useLLM } from "@/hooks/useLLM";
import { authFetch } from "@/lib/authFetch";
import { processCodeSnippet } from "@/lib/codeSnippet";
import {
  AlgorithmSnapshot,
  ApproachSnapshot,
  ComplexitySnapshot,
  ImplementationSnapshot,
  SectionKey,
  SectionSnapshotData,
  UnderstandingSnapshot,
} from "@/types/practice";
import { Problem, ProblemDetails } from "@/types/problem";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AlgorithmDesignSection } from "./AlgorithmDesignSection";
import { ApproachAndReasoningSection } from "./ApproachAndReasoningSection";
import { ComplexityAnalysisSection } from "./ComplexityAnalysisSection";
import { FeedbackLoadingScreen } from "./FeedbackLoadingScreen";
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

  // Section field state — single source of truth for all section inputs
  const [understandingFields, setUnderstandingFields] =
    useState<UnderstandingSnapshot>({
      restatement: "",
      inputsOutputs: "",
      constraints: "",
      edgeCases: "",
    });
  const [approachFields, setApproachFields] = useState<ApproachSnapshot>({
    approach: "",
    reasoning: "",
  });
  const [algorithmFields, setAlgorithmFields] = useState<AlgorithmSnapshot>({
    pseudocode: "",
  });
  const [implFields, setImplFields] = useState<ImplementationSnapshot>({
    code: "",
    language: DEFAULT_LANGUAGE,
    output: "",
  });
  const [complexityFields, setComplexityFields] = useState<ComplexitySnapshot>({
    timeComplexity: "",
    spaceComplexity: "",
  });

  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
  const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

  const { start: startTimer, reset: resetTimer } = useTimerActions();
  const { status } = useAuth();
  const {
    sendMessage: llmSendMessage,
    getMessages: llmGetMessages,
    getFinalState: llmGetFinalState,
    cooldownUntil: llmCooldownUntil,
    reset: llmReset,
  } = useLLM(problem, problemDetails);
  const router = useRouter();
  const pollAbortRef = useRef<AbortController | null>(null);
  const feedbackPollRef = useRef<AbortController | null>(null);

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

        const [res] = await Promise.all([
          authFetch(getProblemDataApiPath(slug, "practice")),
          new Promise((r) => setTimeout(r, 500)), // Minimum loading time for better UX
        ]);
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

        // Reset all section fields for the new session
        setUnderstandingFields({
          restatement: "",
          inputsOutputs: "",
          constraints: "",
          edgeCases: "",
        });
        setApproachFields({ approach: "", reasoning: "" });
        setAlgorithmFields({ pseudocode: "" });
        setImplFields({
          code: processCodeSnippet(
            data?.source.codeSnippets[DEFAULT_LANGUAGE] ?? "",
            DEFAULT_LANGUAGE,
          ),
          language: DEFAULT_LANGUAGE,
          output: "",
        });
        setComplexityFields({ timeComplexity: "", spaceComplexity: "" });

        setIsPracticeStarted(true);
        setCurrentSectionIndex(0);
        setHighestVisitedIndex(0);
        resetTimer();
        startTimer();
        toast.success("Session started", {
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

  const summarySnapshot = useMemo((): SectionSnapshotData => {
    switch (summarySectionKey) {
      case "problem_understanding":
        return understandingFields;
      case "approach_and_reasoning":
        return approachFields;
      case "algorithm_design":
        return algorithmFields;
      case "implementation":
        return implFields;
      case "complexity_analysis":
        return complexityFields;
    }
  }, [
    summarySectionKey,
    understandingFields,
    approachFields,
    algorithmFields,
    implFields,
    complexityFields,
  ]);

  const handleSend = useCallback(
    async (section: SectionKey, content: string): Promise<void> => {
      const snapshots: Record<SectionKey, SectionSnapshotData> = {
        problem_understanding: understandingFields,
        approach_and_reasoning: approachFields,
        algorithm_design: algorithmFields,
        implementation: implFields,
        complexity_analysis: complexityFields,
      };
      await llmSendMessage(section, content, snapshots[section]);
    },
    [
      llmSendMessage,
      understandingFields,
      approachFields,
      algorithmFields,
      implFields,
      complexityFields,
    ],
  );

  const handleEndSession = useCallback(() => {
    llmReset();
    resetTimer();
    setProblem(null);
    setProblemDetails(null);
    setIsPracticeStarted(false);
    setIsPreparingSession(false);
    setCurrentSectionIndex(0);
    setHighestVisitedIndex(0);
    setIsProblemSheetOpen(false);
    setIsSummarySheetOpen(false);
    setSummarySectionKey(SECTION_ORDER[0]);
    setUnderstandingFields({
      restatement: "",
      inputsOutputs: "",
      constraints: "",
      edgeCases: "",
    });
    setApproachFields({ approach: "", reasoning: "" });
    setAlgorithmFields({ pseudocode: "" });
    setImplFields({ code: "", language: DEFAULT_LANGUAGE, output: "" });
    setComplexityFields({ timeComplexity: "", spaceComplexity: "" });
  }, [llmReset, resetTimer]);

  const pollForFeedback = useCallback(async (slug: string): Promise<void> => {
    feedbackPollRef.current?.abort();
    const controller = new AbortController();
    feedbackPollRef.current = controller;

    const delays = [2000, 4000, 8000, 8000, 8000, 8000];
    for (const delay of delays) {
      if (controller.signal.aborted) return;
      await new Promise((r) => setTimeout(r, delay));
      if (controller.signal.aborted) return;

      try {
        const res = await authFetch(getProblemDataApiPath(slug, "feedback"), {
          signal: controller.signal,
        });
        if (res.ok) return;
        if (res.status !== 202) return;
      } catch {
        if (controller.signal.aborted) return;
      }
    }
  }, []);

  const handleGetFeedback = useCallback(async () => {
    if (!problem) return;
    setIsFetchingFeedback(true);

    try {
      const slug = problem.titleSlug;

      // Step 1: Trigger generation of feedback layer for problem details
      const res = await authFetch(getProblemDataApiPath(slug, "feedback"), {
        method: "POST",
      });
      if (res.status === 202) {
        await pollForFeedback(slug);
      }

      // Step 2: POST session context (messages + snapshots) for session feedback generation.
      // Capture final field values now — picks up any edits made after the last sendMessage.
      const finalLlmState = llmGetFinalState({
        problem_understanding: understandingFields,
        approach_and_reasoning: approachFields,
        algorithm_design: algorithmFields,
        implementation: implFields,
        complexity_analysis: complexityFields,
      });
      const feedbackRes = await authFetch(SESSION_FEEDBACK_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemSlug: slug, llmState: finalLlmState }),
      });

      // Step 3: Redirect to /feedback/[sessionId]
      const { sessionId } = await feedbackRes.json();
      router.push(`/feedback/${sessionId}`);
    } catch (err) {
      console.error("Failed to generate feedback:", err);
      toast.error("Failed to generate feedback. Please try again.");
      setIsFetchingFeedback(false);
    }
  }, [
    problem,
    router,
    pollForFeedback,
    llmGetFinalState,
    understandingFields,
    approachFields,
    algorithmFields,
    implFields,
    complexityFields,
  ]);

  const isFeedbackBlocked = useMemo(() => {
    if (!implFields.code.trim()) return true;
    const boilerplate = processCodeSnippet(
      problemDetails?.source.codeSnippets[implFields.language] ?? "",
      implFields.language,
    );
    return implFields.code.trim() === boilerplate.trim();
  }, [implFields, problemDetails]);

  const warningSections = useMemo((): {
    key: SectionKey;
    emptyFields: string[];
  }[] => {
    const result: { key: SectionKey; emptyFields: string[] }[] = [];

    const understandingEmpty = (
      [
        [understandingFields.restatement, "Restate Problem"],
        [understandingFields.inputsOutputs, "Inputs & Outputs"],
        [understandingFields.constraints, "Constraints"],
        [understandingFields.edgeCases, "Edge cases"],
      ] as [string, string][]
    )
      .filter(([v]) => !v.trim())
      .map(([, label]) => label);
    if (understandingEmpty.length)
      result.push({
        key: "problem_understanding",
        emptyFields: understandingEmpty,
      });

    const approachEmpty = (
      [
        [approachFields.approach, "Approach"],
        [approachFields.reasoning, "Reasoning"],
      ] as [string, string][]
    )
      .filter(([v]) => !v.trim())
      .map(([, label]) => label);
    if (approachEmpty.length)
      result.push({
        key: "approach_and_reasoning",
        emptyFields: approachEmpty,
      });

    if (!algorithmFields.pseudocode.trim())
      result.push({ key: "algorithm_design", emptyFields: ["Pseudocode"] });

    const complexityEmpty = (
      [
        [complexityFields.timeComplexity, "Time Complexity"],
        [complexityFields.spaceComplexity, "Space Complexity"],
      ] as [string, string][]
    )
      .filter(([v]) => !v.trim())
      .map(([, label]) => label);
    if (complexityEmpty.length)
      result.push({ key: "complexity_analysis", emptyFields: complexityEmpty });

    return result;
  }, [understandingFields, approachFields, algorithmFields, complexityFields]);

  const completedSections = useMemo((): Set<SectionKey> => {
    const warnedKeys = new Set(warningSections.map((w) => w.key));
    const result = new Set<SectionKey>();
    for (const key of [
      "problem_understanding",
      "approach_and_reasoning",
      "algorithm_design",
      "complexity_analysis",
    ] as const) {
      if (!warnedKeys.has(key)) result.add(key);
    }
    if (!isFeedbackBlocked) result.add("implementation");
    return result;
  }, [warningSections, isFeedbackBlocked]);

  const isLastSection = currentSectionIndex >= SECTION_ORDER.length - 1;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

  return (
    <div className="relative w-full">
      {!isPracticeStarted && !isPreparingSession && (
        <ProblemSelectSection
          onProblemSelect={handleStartSession}
          isEditable={true}
        />
      )}

      {isPreparingSession && <SessionLoadingScreen />}
      {isFetchingFeedback && <FeedbackLoadingScreen />}

      {isPracticeStarted && problem && problemDetails && (
        <div className="animate-in fade-in flex flex-col duration-500">
          <SessionBreadcrumb
            problemTitle={problem.title}
            currentSectionIndex={currentSectionIndex}
            highestVisitedIndex={highestVisitedIndex}
            completedSections={completedSections}
            onViewProblem={() => setIsProblemSheetOpen(true)}
            onEndSession={handleEndSession}
            onSectionNavigate={(sectionKey) =>
              setCurrentSectionIndex(SECTION_ORDER.indexOf(sectionKey))
            }
            onSectionSummaryClick={(sectionKey) => {
              setSummarySectionKey(sectionKey);
              setIsSummarySheetOpen(true);
            }}
          />

          <div className="mx-auto mt-6 w-full max-w-5xl overflow-hidden pb-28">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${currentSectionIndex * 100}%)`,
              }}
            >
              <div
                className="w-full shrink-0 px-3.5"
                inert={currentSectionIndex !== 0}
              >
                <UnderstandingSection
                  fields={understandingFields}
                  onFieldChange={(key, value) =>
                    setUnderstandingFields((prev) => ({
                      ...prev,
                      [key]: value,
                    }))
                  }
                  messages={llmGetMessages("problem_understanding")}
                  onSend={(content) =>
                    handleSend("problem_understanding", content)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div
                className="w-full shrink-0 px-3.5"
                inert={currentSectionIndex !== 1}
              >
                <ApproachAndReasoningSection
                  fields={approachFields}
                  onFieldChange={(key, value) =>
                    setApproachFields((prev) => ({ ...prev, [key]: value }))
                  }
                  messages={llmGetMessages("approach_and_reasoning")}
                  onSend={(content) =>
                    handleSend("approach_and_reasoning", content)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div
                className="w-full shrink-0 px-3.5"
                inert={currentSectionIndex !== 2}
              >
                <AlgorithmDesignSection
                  fields={algorithmFields}
                  onFieldChange={(key, value) =>
                    setAlgorithmFields((prev) => ({ ...prev, [key]: value }))
                  }
                  messages={llmGetMessages("algorithm_design")}
                  onSend={(content) => handleSend("algorithm_design", content)}
                  cooldownUntil={llmCooldownUntil}
                />
              </div>

              <div
                className="w-full shrink-0 px-3.5"
                inert={currentSectionIndex !== 3}
              >
                <ImplementationSection
                  code={implFields.code}
                  onCodeChange={(code) =>
                    setImplFields((prev) => ({ ...prev, code }))
                  }
                  language={implFields.language}
                  onLanguageChange={(language) =>
                    setImplFields((prev) => ({ ...prev, language }))
                  }
                  messages={llmGetMessages("implementation")}
                  onSend={(content) => handleSend("implementation", content)}
                  cooldownUntil={llmCooldownUntil}
                  codeSnippets={problemDetails.source.codeSnippets}
                  titleSlug={problemDetails.titleSlug}
                  output={implFields.output}
                  onOutputChange={(output) =>
                    setImplFields((prev) => ({ ...prev, output }))
                  }
                />
              </div>

              <div
                className="w-full shrink-0 px-3.5"
                inert={currentSectionIndex !== 4}
              >
                <ComplexityAnalysisSection
                  fields={complexityFields}
                  onFieldChange={(key, value) =>
                    setComplexityFields((prev) => ({ ...prev, [key]: value }))
                  }
                  messages={llmGetMessages("complexity_analysis")}
                  onSend={(content) =>
                    handleSend("complexity_analysis", content)
                  }
                  cooldownUntil={llmCooldownUntil}
                />
              </div>
            </div>
          </div>

          {/* Fixed bottom bar: back | timer | next */}
          <div className="fixed bottom-8 left-0 z-40 flex w-full items-end gap-5 px-6">
            <div className="mb-1 flex min-w-0 flex-1 justify-end pr-2">
              {currentSectionIndex > 0 && (
                <Button
                  variant="link"
                  onClick={goBackSection}
                  className="text-muted-foreground hover:text-foreground bg-background/80 mb-1 h-fit w-fit cursor-pointer rounded-md px-1.5 py-0.5 text-sm whitespace-normal underline underline-offset-2 shadow-[0_0_20px_16px_var(--background)]"
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

            <div className="mb-1 flex min-w-0 flex-1 justify-start pl-2">
              {isLastSection ? (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>
                        <Button
                          variant="link"
                          onClick={() => {
                            if (warningSections.length > 0) {
                              setIsWarningDialogOpen(true);
                            } else {
                              handleGetFeedback();
                            }
                          }}
                          disabled={isFeedbackBlocked || isFetchingFeedback}
                          className="group text-white hover:text-brand-primary bg-background/80 mb-1 h-fit w-fit cursor-pointer rounded-md px-1.5 py-0.5 text-sm whitespace-normal underline underline-offset-2 shadow-[0_0_20px_16px_var(--background)] transition-colors"
                        >
                          <span className="text-fill-ltr">
                            {isFetchingFeedback
                              ? "Generating feedback..."
                              : "Finish: Get Feedback →"}
                          </span>
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {isFeedbackBlocked && (
                      <TooltipContent>
                        Add your implementation code to get feedback
                      </TooltipContent>
                    )}
                  </Tooltip>

                  <Dialog
                    open={isWarningDialogOpen}
                    onOpenChange={setIsWarningDialogOpen}
                  >
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Some sections look empty</DialogTitle>
                        <DialogDescription>
                          Feedback may be limited for the following sections.
                          Continue anyway?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        {warningSections.map(({ key, emptyFields }) => (
                          <div key={key}>
                            <p className="text-sm font-medium">
                              {SECTION_KEY_TO_DETAILS[key].title}
                            </p>
                            <ul className="text-muted-foreground mt-1 list-disc pl-4 text-sm">
                              {emptyFields.map((field) => (
                                <li key={field}>{field}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsWarningDialogOpen(false)}
                        >
                          Go back
                        </Button>
                        <Button
                          onClick={() => {
                            setIsWarningDialogOpen(false);
                            handleGetFeedback();
                          }}
                        >
                          Get feedback anyway
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Button
                  variant="link"
                  onClick={proceedNextSection}
                  className="text-muted-foreground hover:text-foreground bg-background/80 mb-1 h-fit w-fit cursor-pointer rounded-md px-1.5 py-0.5 text-sm whitespace-normal underline underline-offset-2 shadow-[0_0_20px_16px_var(--background)]"
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
            snapshot={summarySnapshot}
            open={isSummarySheetOpen}
            onOpenChange={setIsSummarySheetOpen}
          />
        </div>
      )}
    </div>
  );
}
