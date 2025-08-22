import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { languageOptions } from "@/lib/codeMirror";
import { getProblemByIdAdmin, getSessionDocAdmin } from "@/lib/firestore/admin";
import { denormalizeTagName } from "@/lib/firestore/tags";
import { ProblemDoc, SessionDoc } from "@/types/firestore";
import { PracticeProblemSource } from "@/types/practice";

interface FeedbackPageProps {
  params: {
    session_id: string;
  };
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { session_id } = await params;

  let sessionDoc: SessionDoc | undefined;
  let refProblem: ProblemDoc | undefined;

  try {
    sessionDoc = await getSessionDocAdmin(session_id);
    if (sessionDoc.practiceProblemSource !== PracticeProblemSource.Custom) {
      refProblem = await getProblemByIdAdmin(sessionDoc.problemRefId);
    }
  } catch (error) {
    console.error(`Error fetching session ${session_id}:`, error);
    return (
      <div className="px-12 py-8 pb-16">
        <h1 className="mb-4 text-2xl font-bold">Feedback Unavailable</h1>
        <p className="text-muted-foreground text-sm">
          Feedback for this session could not be retrieved. Please verify the
          session ID or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-12 py-8 pb-16">
      <h1 className="mb-4 w-full text-2xl font-bold">
        Review Practice Session
      </h1>

      <div className="flex flex-col gap-6">
        {/* PROBLEM CARD */}
        <Card>
          <CardHeader>
            <CardTitle>
              Problem:{" "}
              {(() => {
                switch (sessionDoc.practiceProblemSource) {
                  case PracticeProblemSource.Custom:
                    return "Custom Problem";

                  case PracticeProblemSource.LeetCode:
                    if (
                      refProblem &&
                      refProblem.source === PracticeProblemSource.LeetCode
                    ) {
                      return `LeetCode - ${refProblem.leetcodeId}. ${refProblem.title}`;
                    }

                  case PracticeProblemSource.AiGenerated:
                    if (
                      refProblem &&
                      refProblem.source === PracticeProblemSource.AiGenerated
                    ) {
                      return `AI Generated Problem - ${refProblem.title}`;
                    }

                  default:
                    return "Unknown Problem Source";
                }
              })()}
            </CardTitle>
            <div className="text-muted-foreground text-xs font-normal italic">
              Session completed on{" "}
              {new Date(sessionDoc.createdAt).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <div className="flex flex-col gap-4 text-sm">
              {(() => {
                switch (sessionDoc.practiceProblemSource) {
                  case PracticeProblemSource.Custom:
                    return <p>{sessionDoc.problemInline.description}</p>;

                  case PracticeProblemSource.LeetCode:
                    if (
                      refProblem &&
                      refProblem.source === PracticeProblemSource.LeetCode
                    ) {
                      return (
                        <div className="flex flex-col gap-2">
                          <div className="font-semibold">
                            Description:{" "}
                            <a
                              href={`https://leetcode.com/problems/${refProblem.titleSlug}/description/`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <span className="text-muted-foreground flex items-center text-xs font-normal hover:underline">
                                View problem description on LeetCode
                                <ExternalLink className="ml-1.5 inline h-4 w-4" />
                              </span>
                            </a>
                          </div>
                          <div className="font-semibold">
                            Difficulty:{" "}
                            <DifficultyBadge
                              difficulty={refProblem.difficulty}
                            />
                          </div>
                          {refProblem.tags.length > 0 && (
                            <div className="flex gap-1 font-semibold">
                              Tags:{" "}
                              {refProblem.tags.map((tag) => (
                                <TagBadge
                                  key={tag}
                                  tagName={denormalizeTagName(tag)}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                  case PracticeProblemSource.AiGenerated:
                    if (
                      !refProblem ||
                      refProblem.source !== PracticeProblemSource.AiGenerated ||
                      !refProblem.title ||
                      !refProblem.description
                    ) {
                      return (
                        <div>Error: AI-generated problem data is missing.</div>
                      );
                    }
                    return (
                      <div>
                        <div>AI Generated Problem - {refProblem.title}</div>
                        <p>{refProblem.description}</p>
                      </div>
                    );

                  default:
                    return (
                      <div>Error occurred while displaying the problem.</div>
                    );
                }
              })()}
            </div>
          </CardContent>
        </Card>

        {/* FEEDBACK CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <div className="text-muted-foreground text-xs font-normal italic">
              This section contains AI-generated feedback based on your practice
              session. Your strengths and areas for improvement are highlighted
              to help you enhance your interviewing skills.
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <ScoreSection
              title="Understanding and Communication"
              score={
                sessionDoc.feedback.scores.understandingAndCommunication.score
              }
              reason={
                sessionDoc.feedback.scores.understandingAndCommunication.reason
              }
            />
            <Separator className="my-6" />

            <ScoreSection
              title="Problem Solving and Reasoning"
              score={
                sessionDoc.feedback.scores.problemSolvingAndReasoning.score
              }
              reason={
                sessionDoc.feedback.scores.problemSolvingAndReasoning.reason
              }
            />
            <Separator className="my-6" />

            <ScoreSection
              title="Code Implementation"
              score={sessionDoc.feedback.scores.codeImplementation.score}
              reason={sessionDoc.feedback.scores.codeImplementation.reason}
            />
            <Separator className="my-6" />

            <ScoreSection
              title="Complexity Analysis"
              score={sessionDoc.feedback.scores.complexityAnalysis.score}
              reason={sessionDoc.feedback.scores.complexityAnalysis.reason}
            />
            <Separator className="my-6" />

            <StrengthsSection strengths={sessionDoc.feedback.strengths} />
            <Separator className="my-6" />

            <SuggestionsSection suggestions={sessionDoc.feedback.suggestions} />
          </CardContent>
        </Card>

        {/* RECAP CARD */}
        <Card>
          <CardHeader>
            <CardTitle>Session Recap</CardTitle>
            <div className="text-muted-foreground text-xs font-normal italic">
              This section summarizes your conversations, pseudocode, and
              implementation during the session.
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Total Time Spent</span>
              {Math.floor(sessionDoc.totalTimeSec / 60)} minutes
              {sessionDoc.totalTimeSec % 60 > 0 && (
                <> and {sessionDoc.totalTimeSec % 60} seconds</>
              )}
            </div>
            <Separator className="my-6" />

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Clarifications</span>
              <p>{sessionDoc.distilledSummaries.clarification}</p>
            </div>
            <Separator className="my-6" />

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Thought Process</span>
              <p>{sessionDoc.distilledSummaries.thought_process}</p>
            </div>
            <Separator className="my-6" />

            {sessionDoc.pseudocode && (
              <>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold">Pseudocode</span>
                  <pre className="bg-muted rounded p-6 text-xs break-words whitespace-pre-wrap">
                    {sessionDoc.pseudocode}
                  </pre>
                  <p>{sessionDoc.distilledSummaries.clarification}</p>
                </div>
                <Separator className="my-6" />
              </>
            )}
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Implementation</span>
              <pre className="bg-muted rounded p-6 text-xs break-words whitespace-pre-wrap">
                <div className="text-muted-foreground mb-1 text-xs italic">
                  Language: {languageOptions[sessionDoc.implementationLanguage]}
                </div>
                {sessionDoc.implementation}
              </pre>
              <p>{sessionDoc.distilledSummaries.implementation}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Link href="/practice">
          <Button variant="secondary">Practice Another Problem</Button>
        </Link>
      </div>
    </div>
  );
}

function ScoreSection({
  title,
  score,
  reason,
}: {
  title: string;
  score: number;
  reason: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{title}</span>
        <span className="font-bold">{score}/5</span>
      </div>
      <Progress
        value={(score * 100) / 5}
        className="group [&>div]:bg-green-500/60"
      />
      <div className="text-sm">{reason}</div>
    </div>
  );
}

function StrengthsSection({ strengths }: { strengths: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">Strengths</span>
      <ul className="list-disc pl-5 text-sm">
        {strengths.map((strength, index) => (
          <li key={index}>{strength}</li>
        ))}
      </ul>
    </div>
  );
}

function SuggestionsSection({ suggestions }: { suggestions: string[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">Suggestions for Improvement</span>
      <ul className="list-disc pl-5 text-sm">
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
}
