"use client";

import { MoveLeft, MoveRight } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import { useAuth } from "@/hooks/useAuth";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/lib/practice";
import { cn } from "@/lib/utils";
import { SectionKey } from "@/types/practice";
import { Problem, ProblemDetails } from "@/types/problem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";
import { ProblemReferenceSheet } from "./ProblemReferenceSheet";
import { SectionHeader } from "./SectionHeader";
import { SectionSummarySheet } from "./SectionSummarySheet";
import { UnderstandingSection } from "./UnderstandingSection";

export function PracticeAccordionSections() {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [problemDetails, setProblemDetails] = useState<ProblemDetails | null>(
    null,
  );

  const [isPracticeStarted, setIsPracticeStarted] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [highestVisitedIndex, setHighestVisitedIndex] = useState(0);
  const [isProblemSheetOpen, setIsProblemSheetOpen] = useState(false);
  const [isSummarySheetOpen, setIsSummarySheetOpen] = useState(false);
  const [summarySectionKey, setSummarySectionKey] = useState<SectionKey>(
    SECTION_ORDER[0],
  );

  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [router, status]);

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
      {!isPracticeStarted && (
        <ProblemSelectSection
          onProblemSelect={(selectedProblem, selectedProblemDetails) => {
            setProblem(selectedProblem);
            setProblemDetails(selectedProblemDetails);
            setIsPracticeStarted(true);
            setCurrentSectionIndex(0);
            setHighestVisitedIndex(0);
          }}
          isEditable={true}
        />
      )}

      {isPracticeStarted && problem && problemDetails && (
        <>
          <div className="flex justify-center px-3.5 pt-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setIsProblemSheetOpen(true)}
                  >
                    {problem.title}
                  </Button>
                </BreadcrumbItem>
                <BreadcrumbSeparator>:</BreadcrumbSeparator>
                {SECTION_ORDER.slice(0, highestVisitedIndex + 1).map(
                  (sectionKey, index) => (
                    <Fragment key={sectionKey}>
                      <BreadcrumbItem>
                        {index === currentSectionIndex ? (
                          <BreadcrumbPage>
                            {SECTION_KEY_TO_DETAILS[sectionKey].title}
                          </BreadcrumbPage>
                        ) : (
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={() => {
                              setSummarySectionKey(sectionKey);
                              setIsSummarySheetOpen(true);
                            }}
                          >
                            {SECTION_KEY_TO_DETAILS[sectionKey].title}
                          </Button>
                        )}
                      </BreadcrumbItem>
                      {index < highestVisitedIndex && <BreadcrumbSeparator />}
                    </Fragment>
                  ),
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mx-auto mt-6 max-w-5xl px-3.5">
            <div className={cn(currentSectionIndex !== 0 && "hidden")}>
              <UnderstandingSection
                messages={[]}
                onSend={async (content) => {
                  console.log("Understanding message:", content);
                }}
              />
            </div>

            {SECTION_ORDER.slice(1).map((sectionKey, i) => (
              <div
                key={sectionKey}
                className={cn(currentSectionIndex !== i + 1 && "hidden")}
              >
                <div className="flex h-[calc(100vh-12rem)] flex-col gap-8">
                  <SectionHeader sectionKey={sectionKey} />
                  <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
                    Section content coming soon.
                  </div>
                </div>
              </div>
            ))}
          </div>

          {currentSectionIndex > 0 && (
            <Button
              variant="outline"
              size="lg"
              className="fixed bottom-24 left-8 rounded-full"
              onClick={goBackSection}
            >
              <MoveLeft className="h-4 w-4" />
              Back:{" "}
              {
                SECTION_KEY_TO_DETAILS[
                  SECTION_ORDER[currentSectionIndex - 1]
                ].title
              }
            </Button>
          )}

          {!isLastSection && (
            <Button
              variant="default"
              size="lg"
              className="fixed right-8 bottom-24 rounded-full"
              onClick={proceedNextSection}
            >
              Next:{" "}
              {
                SECTION_KEY_TO_DETAILS[
                  SECTION_ORDER[currentSectionIndex + 1]
                ].title
              }
              <MoveRight className="h-4 w-4" />
            </Button>
          )}

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

      {/* <Accordion
        type="multiple"
        className="w-full"
        value={openSections}
        onValueChange={(value) => setOpenSections(value as SectionKey[])}
      >
        <AccordionItem value={PRACTICE_SECTIONS[0]}>
          <AccordionTrigger>
            <SectionLabel
              label="Select Problem"
              isCurrentStep={currentSectionIndex === 0}
            />
          </AccordionTrigger>
          <ProblemSelectSection
            onProblemSelect={(problem, problemDetails) => {
              console.log("Problem selected, but handler not implemented yet");
              console.log("Problem:", problem);
              console.log("Problem Details:", problemDetails);
            }}
            isEditable={currentSectionIndex === 0}
          />
        </AccordionItem>
        {problem && (
          <>
            {currentSectionIndex >= 1 && (
              <AccordionItem value={PRACTICE_SECTIONS[1]}>
                <AccordionTrigger disabled={currentSectionIndex < 1}>
                  <SectionLabel
                    label="Clarify Problem"
                    isCurrentStep={currentSectionIndex === 1}
                  />
                </AccordionTrigger>
                <ClarificationSection
                  messages={llm.getMessages("clarification")}
                  onSend={(content) => {
                    if (currentSectionIndex > 1) {
                      llm.generateDistilledSummary("clarification");
                    }
                    return llm.sendMessage("clarification", content);
                  }}
                />
              </AccordionItem>
            )}
            {currentSectionIndex >= 2 && (
              <AccordionItem value={PRACTICE_SECTIONS[2]}>
                <AccordionTrigger disabled={currentSectionIndex < 2}>
                  <SectionLabel
                    label="Explain Thought Process"
                    isCurrentStep={currentSectionIndex === 2}
                  />
                </AccordionTrigger>
                <ThoughtProcessSection
                  messages={llm.getMessages("thought_process")}
                  onSend={(content) => {
                    if (currentSectionIndex > 2) {
                      llm.generateDistilledSummary("thought_process");
                    }
                    return llm.sendMessage("thought_process", content);
                  }}
                />
              </AccordionItem>
            )}
            {currentSectionIndex >= 3 && (
              <AccordionItem value={PRACTICE_SECTIONS[3]}>
                <AccordionTrigger disabled={currentSectionIndex < 3}>
                  <SectionLabel
                    label="Develop Pseudocode"
                    isCurrentStep={currentSectionIndex === 3}
                  />
                </AccordionTrigger>
                <PseudocodeSection
                  messages={llm.getMessages("pseudocode")}
                  onSend={(content) => {
                    if (currentSectionIndex > 3) {
                      llm.generateDistilledSummary("pseudocode");
                    }
                    return llm.sendMessage("pseudocode", content);
                  }}
                  onPseudocodeArtifactChange={(content) =>
                    llm.setArtifact("pseudocode", {
                      kind: "pseudocode",
                      content,
                    })
                  }
                />
              </AccordionItem>
            )}
            {currentSectionIndex >= 4 && (
              <AccordionItem value={PRACTICE_SECTIONS[4]}>
                <AccordionTrigger disabled={currentSectionIndex < 4}>
                  <SectionLabel
                    label="Implement Code"
                    isCurrentStep={currentSectionIndex === 4}
                  />
                </AccordionTrigger>
                <ImplementationSection
                  messages={llm.getMessages("implementation")}
                  onSend={(content) => {
                    if (currentSectionIndex > 4) {
                      llm.generateDistilledSummary("implementation");
                    }
                    return llm.sendMessage("implementation", content);
                  }}
                  onCodeArtifactChange={(content, language: LanguageKey) =>
                    llm.setArtifact("implementation", {
                      kind: "code",
                      content,
                      language,
                    })
                  }
                />
              </AccordionItem>
            )}
            {currentSectionIndex >= 5 && (
              <AccordionItem value={PRACTICE_SECTIONS[5]}>
                <AccordionTrigger disabled={currentSectionIndex < 5}>
                  <SectionLabel
                    label="Analyze Complexity"
                    isCurrentStep={currentSectionIndex === 5}
                  />
                </AccordionTrigger>
                <ComplexityAnalysisSection
                  messages={llm.getMessages("complexity_analysis")}
                  onSend={(content) =>
                    llm.sendMessage("complexity_analysis", content)
                  }
                />
              </AccordionItem>
            )}
          </>
        )}
      </Accordion> */}

      {/* {currentSectionIndex === 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="lg"
              disabled={!problem || isLoadingProblem}
              className="fixed right-8 bottom-20 rounded-full backdrop-blur-sm"
            >
              {isLoadingProblem ? (
                <>
                  Generating Metadata
                  <Loader2Icon className="animate-spin" />
                </>
              ) : (
                <>
                  Begin Problem
                  <MoveRight className="h-4 w-4 pt-0.5" />
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you ready to begin?</AlertDialogTitle>
              <AlertDialogDescription>
                You have selected{" "} */}
      {/* {problem && "title" in problem?.problem
                  ? `the LeetCode problem: ${problem?.problem.title}`
                  : "a custom problem"}
                <br />
                <br />
                The timer is currently set to {setpoint / 60} minutes. You will
                receive a notification when the time is up. You can adjust the
                timer in the settings. */}
      {/* </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await handleProblemStart();
                  proceedNextSection();
                  startTimer();
                }}
                autoFocus
              >
                Begin
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {currentSectionIndex > 0 &&
        currentSectionIndex < PRACTICE_SECTIONS.length - 1 && (
          <Button
            variant="default"
            size="lg"
            className="fixed right-8 bottom-20 rounded-full backdrop-blur-sm"
            onClick={proceedNextSection}
          >
            Next: {SECTIONS_TO_NAME[PRACTICE_SECTIONS[currentSectionIndex + 1]]}
            <MoveRight className="h-4 w-4 pt-0.5" />
          </Button>
        )}

      {currentSectionIndex === PRACTICE_SECTIONS.length - 1 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="lg"
              className="fixed right-8 bottom-20 rounded-full backdrop-blur-sm"
              disabled={isGeneratingFeedback}
            >
              {isGeneratingFeedback ? (
                <>
                  Generating Feedback
                  <Loader2Icon className="animate-spin" />
                </>
              ) : (
                <>
                  Finish Practice
                  <MoveRight className="h-4 w-4 pt-0.5" />
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>All finished?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be redirected to a new page where you will receive
                personalized feedback based on your practice session. Note that
                you will no longer be able to edit your session code and chats.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  pauseTimer();
                  await llm.generateDistilledSummary("complexity_analysis");
                  await handleSessionFinish();
                }}
                autoFocus
              >
                Get Feedback
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {currentSectionIndex > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-20 left-8 rounded-full backdrop-blur-sm"
              disabled={!llm.hasDistilledSummaries()}
            >
              {llm.hasDistilledSummaries() ? (
                <>
                  <span className="sr-only">View AI Summary</span>
                  <Sparkles className="h-4 w-4" />
                </>
              ) : (
                <Loader2Icon className="animate-spin" />
              )}
            </Button>
          </DialogTrigger>

          <AISummaryDialog summaries={llm.getAllDistilledSummaries()} />
        </Dialog>
      )} */}
    </div>
  );
}
