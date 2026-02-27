"use client";

import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SESSIONS_API_PATH } from "@/constants/api";
import { CRITERION_MAX_SCORE } from "@/constants/grading";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { authFetch } from "@/lib/authFetch";
import { SectionKey } from "@/types/practice";

type SessionSummary = {
  id: string;
  problemTitleSlug: string;
  problemId: string | null;
  createdAt: string;
  feedback: {
    sections: Record<SectionKey, { score: number | null }>;
    interviewerCommunication: { score: number | null };
  };
};

type SortKey = "problemId" | "date";
type SortDir = "asc" | "desc";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function scoreColor(score: number): string {
  if (score < 2) return "text-red-400";
  if (score < 3) return "text-amber-400";
  if (score < 5) return "text-lime-400";
  return "text-green-400";
}

function sortSessions(
  sessions: SessionSummary[],
  key: SortKey,
  dir: SortDir,
): SessionSummary[] {
  return [...sessions].sort((a, b) => {
    let cmp: number;
    if (key === "problemId") {
      const aNum = a.problemId !== null ? Number(a.problemId) : Infinity;
      const bNum = b.problemId !== null ? Number(b.problemId) : Infinity;
      cmp = aNum - bNum;
    } else {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

function SortIcon({
  col,
  sortKey,
  sortDir,
}: {
  col: SortKey;
  sortKey: SortKey | null;
  sortDir: SortDir;
}) {
  if (sortKey !== col)
    return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />;
  return sortDir === "asc" ? (
    <ArrowUp className="ml-1 inline h-3 w-3" />
  ) : (
    <ArrowDown className="ml-1 inline h-3 w-3" />
  );
}

function ScoreChips({ session }: { session: SessionSummary }) {
  const entries = [
    ...SECTION_ORDER.map((key) => ({
      label: SECTION_KEY_TO_DETAILS[key].title,
      score: session.feedback.sections[key].score,
    })),
    {
      label: "Communication",
      score: session.feedback.interviewerCommunication.score,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {entries.map(({ label, score }) => (
        <span
          key={label}
          title={`${label}: ${score !== null ? `${score}/${CRITERION_MAX_SCORE}` : "Ungraded"}`}
          className={`text-xs font-medium tabular-nums ${
            score !== null ? scoreColor(score) : "text-muted-foreground/40"
          }`}
        >
          {score !== null ? score : "–"}
        </span>
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-3.5 py-8">
      <Skeleton className="h-7 w-24" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  useEffect(() => {
    authFetch(SESSIONS_API_PATH)
      .then((res) => res.json())
      .then((json) => setSessions(json.sessions));
  }, []);

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("asc");
    }
  }

  if (!sessions) return <HistorySkeleton />;

  const displayed =
    sortKey !== null ? sortSessions(sessions, sortKey, sortDir) : sessions;

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3.5 py-8">
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-semibold">History</h1>
        <span className="text-muted-foreground text-sm">
          {sessions.length} session{sessions.length !== 1 ? "s" : ""}
        </span>
      </div>

      {sessions.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No sessions yet.{" "}
          <Link
            href="/practice"
            className="hover:text-foreground underline underline-offset-2"
          >
            Start practicing
          </Link>{" "}
          to see your history here.
        </p>
      ) : (
        <Card className="overflow-hidden py-0">
          <div className="p-4">
            <Table className="table-fixed">
              <colgroup>
                <col />
                <col className="w-32" />
                <col className="w-40" />
                <col className="w-10" />
              </colgroup>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-12">
                    <button
                      onClick={() => handleSort("problemId")}
                      className="hover:text-foreground inline-flex items-center transition-colors"
                    >
                      Problem
                      <SortIcon
                        col="problemId"
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="h-12">
                    <button
                      onClick={() => handleSort("date")}
                      className="hover:text-foreground inline-flex items-center transition-colors"
                    >
                      Date
                      <SortIcon
                        col="date"
                        sortKey={sortKey}
                        sortDir={sortDir}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="h-12">Scores</TableHead>
                  <TableHead className="h-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((session) => (
                  <TableRow
                    key={session.id}
                    className="group hover:bg-transparent"
                  >
                    <TableCell className="py-3 font-medium">
                      <span className="group-hover:underline group-hover:underline-offset-2">
                        {session.problemId && (
                          <span className="font-normal">
                            {session.problemId}.{" "}
                          </span>
                        )}
                        {formatSlug(session.problemTitleSlug)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3">
                      {new Date(session.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="py-3">
                      <ScoreChips session={session} />
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-end">
                        <Link
                          href={`/feedback/${session.id}`}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
