import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
// import { languageOptions } from "@/lib/codeMirror";
import { getSessionDocAdmin } from "@/lib/firestore/admin";
import { SessionDoc } from "@/types/firestore";

interface FeedbackPageProps {
  params: Promise<{
    session_id: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { session_id } = await params;

  let sessionDoc: SessionDoc | undefined;

  try {
    sessionDoc = await getSessionDocAdmin(session_id);
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
            <CardTitle>Problem: </CardTitle>
            <div className="text-muted-foreground text-xs font-normal italic">
              Session completed on{" "}
              {new Date(sessionDoc.createdAt).toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent className="-mt-2">
            <div className="flex flex-col gap-4 text-sm">WIP</div>
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
              {/* <p>{sessionDoc.distilledSummaries.clarification}</p> */}
            </div>
            <Separator className="my-6" />

            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Thought Process</span>
              {/* <p>{sessionDoc.distilledSummaries.thought_process}</p> */}
            </div>
            <Separator className="my-6" />

            {sessionDoc.pseudocode && (
              <>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold">Pseudocode</span>
                  <pre className="bg-muted rounded p-6 text-xs break-words whitespace-pre-wrap">
                    {sessionDoc.pseudocode}
                  </pre>
                  {/* <p>{sessionDoc.distilledSummaries.clarification}</p> */}
                </div>
                <Separator className="my-6" />
              </>
            )}
            <div className="flex flex-col gap-2 text-sm">
              <span className="font-semibold">Implementation</span>
              <pre className="bg-muted rounded p-6 text-xs break-words whitespace-pre-wrap">
                <div className="text-muted-foreground mb-1 text-xs italic">
                  {/* Language: {languageOptions[sessionDoc.implementationLanguage]} */}
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
