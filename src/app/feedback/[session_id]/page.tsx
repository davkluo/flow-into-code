import { Timestamp } from "firebase-admin/firestore";
import { notFound } from "next/navigation";
import { CommunicationSection } from "@/components/pages/CommunicationSection";
import { SectionFeedbackCard } from "@/components/pages/SectionFeedbackCard";
import { SolutionsTabs } from "@/components/pages/SolutionsTabs";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CRITERION_MAX_SCORE } from "@/constants/grading";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import * as problemDetailsRepo from "@/repositories/firestore/problemDetailsRepo";
import * as problemRepo from "@/repositories/firestore/problemRepo";
import * as sessionRepo from "@/repositories/firestore/sessionRepo";

interface FeedbackPageProps {
  params: Promise<{ session_id: string }>;
}

function scoreClass(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

function scoreBg(score: number): string {
  if (score < 2) return "bg-red-400";
  if (score < 3) return "bg-amber-400";
  if (score < 5) return "bg-lime-400";
  return "bg-green-400";
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const { session_id } = await params;

  const session = await sessionRepo.getById(session_id);
  if (!session) notFound();

  const [problem, problemDetails] = await Promise.all([
    problemRepo.getBySlug(session.problemTitleSlug),
    problemDetailsRepo.getBySlug(session.problemTitleSlug),
  ]);

  const { feedback } = session;

  // Firestore returns Timestamps, not JS Dates
  const rawCreatedAt = session.createdAt as Date | Timestamp;
  const createdAt =
    rawCreatedAt instanceof Timestamp ? rawCreatedAt.toDate() : rawCreatedAt;

  const solutions = problemDetails?.derived?.solutions ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <h1 className="flex items-center gap-2 text-4xl font-semibold">
              {problem && (
                <a
                  href={`https://leetcode.com/problems/${problem.titleSlug}/description/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {problem?.title ?? session.problemTitleSlug}
                </a>
              )}
            </h1>
          </TooltipTrigger>
          <TooltipContent>View on LeetCode</TooltipContent>
        </Tooltip>
        <div className="flex items-center gap-2">
          {problem && (
            <DifficultyBadge
              difficulty={problem.difficulty}
              className="-mt-0.5"
            />
          )}
          <div className="flex gap-1">
            {problem?.topicTags.map((tag) => (
              <TagBadge key={tag.id} tagName={tag.name} />
            ))}
          </div>
        </div>
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          Solved:{" "}
          {createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Score overview — 3×2 grid, all 6 categories */}
      {(() => {
        const items = [
          ...SECTION_ORDER.map((key) => ({
            href: `#section-${key}`,
            title: SECTION_KEY_TO_DETAILS[key].title,
            score: feedback.sections[key].score,
          })),
          {
            href: "#section-communication",
            title: "Communication",
            score: feedback.interviewerCommunication.score,
          },
        ];
        return (
          <div className="grid grid-cols-2">
            {items.map((item) => (
              <a key={item.href} href={item.href} className="group px-3 py-2">
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
                      {item.title}
                    </span>
                    {item.score !== null ? (
                      <span
                        className={`text-xs font-semibold tabular-nums transition-all group-hover:brightness-125 ${scoreClass(item.score)}`}
                      >
                        {item.score}/{CRITERION_MAX_SCORE}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 group-hover:text-muted-foreground text-xs font-medium transition-colors">
                        Ungraded
                      </span>
                    )}
                  </div>
                  <div className="bg-muted h-1.5 w-full rounded-full">
                    {item.score !== null && (
                      <div
                        className={`h-1.5 rounded-full transition-all group-hover:brightness-125 ${scoreBg(item.score)}`}
                        style={{
                          width: `${(item.score / CRITERION_MAX_SCORE) * 100}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        );
      })()}

      {/* Summary */}
      {feedback.summary && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Session Summary
          </p>
          <div className="border-input overflow-hidden rounded-md border px-4 py-3">
            <p className="text-sm">{feedback.summary}</p>
          </div>
        </div>
      )}

      {/* Section feedback — tabbed cards */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Section Feedback
        </p>
        <div className="space-y-4">
          {SECTION_ORDER.map((key) => (
            <SectionFeedbackCard
              key={key}
              sectionKey={key}
              title={SECTION_KEY_TO_DETAILS[key].title}
              feedback={feedback.sections[key]}
              fields={session.fields[key] as Record<string, string> | undefined}
            />
          ))}
        </div>
      </div>

      {/* Communication + Chat logs */}
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
          Communication
        </p>
        <CommunicationSection
          feedback={feedback.interviewerCommunication}
          messages={session.chatLog}
        />
      </div>

      {/* Sample solutions */}
      {solutions.length > 0 && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Sample Solutions
          </p>
          <SolutionsTabs solutions={solutions} />
        </div>
      )}
    </div>
  );
}
