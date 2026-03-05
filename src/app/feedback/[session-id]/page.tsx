"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { CommunicationSection } from "@/components/pages/CommunicationSection";
import { SectionFeedbackCard } from "@/components/pages/SectionFeedbackCard";
import { SolutionsTabs } from "@/components/pages/SolutionsTabs";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import {
  AdaptiveTooltip,
  AdaptiveTooltipContent,
  AdaptiveTooltipTrigger,
} from "@/components/ui/adaptive-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionApiPath } from "@/constants/api";
import { CRITERION_MAX_SCORE } from "@/constants/grading";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { authFetch } from "@/lib/firebase/authFetch";
import { Problem, ProblemSolution } from "@/types/problem";
import { Session } from "@/types/session";

type FeedbackPageData = {
  session: Session & { id: string; createdAt: string };
  problem: Problem | null;
  solutions: ProblemSolution[];
};

/** Returns a Tailwind text-color class for a numeric score, ranging from red (low) to green (high). */
function scoreClass(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

/** Returns a Tailwind background-color class for a numeric score, used for the progress bar fill. */
function scoreBg(score: number): string {
  if (score < 2) return "bg-red-400";
  if (score < 3) return "bg-amber-400";
  if (score < 5) return "bg-lime-400";
  return "bg-green-400";
}

/** Loading skeleton shown while the session feedback data is being fetched. */
function FeedbackSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      <div className="flex flex-col items-center space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2 px-3 py-2">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    </div>
  );
}

/**
 * Feedback page for a completed practice session (`/feedback/[session-id]`).
 *
 * Fetches session data on mount and renders:
 * - Problem title, difficulty, and tags
 * - A 3×2 score overview grid with progress bars, linking to section anchors
 * - An overall session summary paragraph
 * - Per-section feedback cards
 * - Interviewer communication feedback and chat log
 * - Sample solutions (if available from the problem's feedback layer)
 *
 * Shows a skeleton UI while loading and calls `notFound()` for 404/401 responses.
 */
export default function FeedbackPage() {
  const authStatus = useRequireAuth();

  const params = useParams<{ "session-id": string }>();
  const sessionId = params["session-id"];
  const [data, setData] = useState<FeedbackPageData | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    async function fetchSession() {
      const res = await authFetch(getSessionApiPath(sessionId));
      if (res.status === 404 || res.status === 401) {
        setIsNotFound(true);
        return;
      }
      const json = await res.json();
      setData(json);
    }
    fetchSession();
  }, [authStatus, sessionId]);

  if (isNotFound) notFound();
  if (!data) return <FeedbackSkeleton />;

  const { session, problem, solutions } = data;
  const { feedback } = session;
  const createdAt = new Date(session.createdAt);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8">
      {/* Header */}
      <div className="flex flex-col items-center space-y-2">
        <AdaptiveTooltip>
          <AdaptiveTooltipTrigger asChild>
            <h1 className="flex items-center gap-2 text-4xl font-semibold">
              {problem && (
                <a
                  href={`https://leetcode.com/problems/${problem.titleSlug}/description/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {problem.id && (
                    <span className="font-normal">{problem.id}. </span>
                  )}
                  {problem.title ?? session.problemTitleSlug}
                </a>
              )}
            </h1>
          </AdaptiveTooltipTrigger>
          <AdaptiveTooltipContent>View on LeetCode</AdaptiveTooltipContent>
        </AdaptiveTooltip>
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
              <a
                key={item.href}
                href={item.href}
                className="group hover:bg-card dark:hover:bg-card rounded-md px-3 py-2 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-foreground text-xs">
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
          <p className="border-muted-foreground/30 border-l-2 pl-4 text-base leading-relaxed font-medium tracking-wide">
            {feedback.summary}
          </p>
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
