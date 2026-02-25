import { notFound } from "next/navigation";
import { CalendarIcon } from "lucide-react";
import { Timestamp } from "firebase-admin/firestore";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import { SECTION_ORDER, SECTION_KEY_TO_DETAILS } from "@/constants/practice";
import { CRITERION_MAX_SCORE } from "@/constants/grading";
import { CategoryFeedback } from "@/types/session";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


interface FeedbackPageProps {
  params: Promise<{ session_id: string }>;
}

function scoreClass(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <Badge variant="secondary">Not completed</Badge>;
  }
  return (
    <span className={`text-base font-semibold tabular-nums ${scoreClass(score)}`}>
      {score}/{CRITERION_MAX_SCORE}
    </span>
  );
}

function FeedbackCard({
  title,
  feedback,
}: {
  title: string;
  feedback: CategoryFeedback;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction>
          <ScoreBadge score={feedback.score} />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.comments && (
          <p className="text-muted-foreground text-sm">{feedback.comments}</p>
        )}
        {feedback.compliments && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-lime-400">What went well</p>
            <p className="text-muted-foreground text-sm">{feedback.compliments}</p>
          </div>
        )}
        {feedback.advice && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-amber-400">To improve</p>
            <p className="text-muted-foreground text-sm">{feedback.advice}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function difficultyClass(difficulty: string): string {
  if (difficulty === "Easy") return "text-lime-400 border-lime-400/30";
  if (difficulty === "Hard") return "text-red-400 border-red-400/30";
  return "text-amber-400 border-amber-400/30";
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { session_id } = await params;

  const session = await sessionRepo.getById(session_id);
  if (!session) notFound();

  const problem = await problemRepo.getBySlug(session.problemTitleSlug);

  const { feedback } = session;

  // Firestore returns Timestamps, not JS Dates
  const rawCreatedAt = session.createdAt as Date | Timestamp;
  const createdAt =
    rawCreatedAt instanceof Timestamp
      ? rawCreatedAt.toDate()
      : rawCreatedAt;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {problem?.title ?? session.problemTitleSlug}
        </h1>
        <div className="flex items-center gap-3">
          {problem && (
            <Badge
              variant="outline"
              className={`text-xs ${difficultyClass(problem.difficulty)}`}
            >
              {problem.difficulty}
            </Badge>
          )}
          <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <CalendarIcon className="size-3.5" />
            {createdAt.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-5 gap-2">
        {SECTION_ORDER.map((key) => {
          const { title } = SECTION_KEY_TO_DETAILS[key];
          return (
            <div
              key={key}
              className="flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center"
            >
              <span className="text-muted-foreground text-xs leading-tight">
                {title}
              </span>
              <ScoreBadge score={feedback.sections[key].score} />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {feedback.summary && (
        <Card>
          <CardHeader>
            <CardTitle>Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{feedback.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Section feedback */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Section Feedback
        </p>
        <div className="space-y-4">
          {SECTION_ORDER.map((key) => (
            <FeedbackCard
              key={key}
              title={SECTION_KEY_TO_DETAILS[key].title}
              feedback={feedback.sections[key]}
            />
          ))}
        </div>
      </div>

      {/* Communication */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Communication
        </p>
        <FeedbackCard
          title="Interviewer Communication"
          feedback={feedback.interviewerCommunication}
        />
      </div>
    </div>
  );
}
