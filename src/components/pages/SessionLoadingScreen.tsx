"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { SECTION_ORDER } from "@/constants/practice";

const ROTATING_MESSAGES = [
  "Preparing your practice session",
  "Analyzing problem structure",
  "Generating tailored guidance",
  "Setting up your workspace",
  "Almost ready",
];

const MESSAGE_INTERVAL_MS = 2500;

export function SessionLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col px-3.5">
      {/* Breadcrumb skeleton */}
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-6 w-28 rounded-md" />
          <Skeleton className="h-4 w-2" />
          {SECTION_ORDER.map((key, i) => (
            <div key={key} className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-20 rounded-md" />
              {i < SECTION_ORDER.length - 1 && (
                <Skeleton className="h-4 w-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section content skeleton */}
      <div className="mx-auto mt-6 flex w-full max-w-5xl flex-1 flex-col gap-8">
        {/* Section header skeleton */}
        <div className="flex flex-col items-center justify-center gap-3 py-4">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          <p
            key={messageIndex}
            className="text-muted-foreground animate-in fade-in-0 text-sm duration-500"
          >
            {ROTATING_MESSAGES[messageIndex]}...
          </p>
        </div>

        {/* Two-column layout skeleton */}
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-6">
          {/* Left: field skeletons */}
          <div className="flex flex-col gap-4">
            <Skeleton className="flex-1 rounded-md" />
            <Skeleton className="flex-1 rounded-md" />
            <Skeleton className="flex-1 rounded-md" />
            <Skeleton className="flex-1 rounded-md" />
          </div>
          {/* Right: chat skeleton */}
          <Skeleton className="rounded-md" />
        </div>
      </div>
    </div>
  );
}
