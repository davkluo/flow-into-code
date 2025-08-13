"use client";

import { Loader2Icon, MoveRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { ProblemSelectSection } from "@/components/pages/ProblemSelectSection";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useTimer } from "@/context/TimerContext";
import { useLLM } from "@/hooks/useLLM";
import { LanguageKey } from "@/lib/codeMirror";
import {
  PRACTICE_SECTIONS,
  SECTIONS_TO_NAME,
  sectionToIndex,
} from "@/lib/practice";
import { LCProblem } from "@/types/leetcode";
import { PracticeProblem, SectionKey } from "@/types/practice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { AISummaryDialog } from "./AISummaryDialog";
import { ClarificationSection } from "./ClarificationSection";
import { ComplexityAnalysisSection } from "./ComplexityAnalysisSection";
import { ImplementationSection } from "./ImplementationSection";
import { PseudocodeSection } from "./PseudocodeSection";
import { SectionLabel } from "./SectionLabel";
import { ThoughtProcessSection } from "./ThoughtProcessSection";

interface PracticeAccordionSectionsProps {
  problems: LCProblem[];
}

export function PracticeAccordionSections({
  problems,
}: PracticeAccordionSectionsProps) {
  const [openSections, setOpenSections] = useState<SectionKey[]>([
    PRACTICE_SECTIONS[0],
  ]);
  const [problem, setProblem] = useState<PracticeProblem | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  const llm = useLLM(problem);
  const { setpoint, start: startTimer } = useTimer();

  const proceedNextSection = () => {
    if (currentSectionIndex >= PRACTICE_SECTIONS.length - 1) return;

    llm.generateDistilledSummary(PRACTICE_SECTIONS[currentSectionIndex]);

    setOpenSections((prev) => {
      const newOpenSections = [
        ...prev.filter(
          (section) => sectionToIndex(section) !== currentSectionIndex,
        ),
      ];

      if (currentSectionIndex < PRACTICE_SECTIONS.length - 1) {
        const next = PRACTICE_SECTIONS[currentSectionIndex + 1];
        newOpenSections.push(next);
      }

      return newOpenSections;
    });

    setCurrentSectionIndex((prev) => prev + 1);
  };

  return (
    <div className="relative w-full">
      <Accordion
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
            problems={problems}
            onProblemSelect={setProblem}
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
      </Accordion>

      {currentSectionIndex === 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="lg"
              disabled={!problem}
              className="fixed right-8 bottom-20 rounded-full backdrop-blur-sm"
            >
              Begin Problem
              <MoveRight className="h-4 w-4 pt-0.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you ready to begin?</AlertDialogTitle>
              <AlertDialogDescription>
                You have selected{" "}
                {problem && "title" in problem?.problem
                  ? `the LeetCode problem: ${problem?.problem.title}`
                  : "a custom problem"}
                <br />
                <br />
                The timer is currently set to {setpoint / 60} minutes. You will
                receive a notification when the time is up. You can adjust the
                timer in the settings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  startTimer();
                  proceedNextSection();
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
        <Button
          variant="default"
          size="lg"
          className="fixed right-8 bottom-20 rounded-full backdrop-blur-sm"
          onClick={() => {
            // TODO: Save results to database, generate feedback report, make loading button, pause timer, etc.
            llm.generateDistilledSummary("complexity_analysis");
            alert("Practice session completed!");
          }}
        >
          Finish Practice
          <MoveRight className="h-4 w-4 pt-0.5" />
        </Button>
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
      )}
    </div>
  );
}
