"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ROTATING_MESSAGES = [
  "Preparing your practice session",
  "Analyzing problem structure",
  "Generating tailored guidance",
  "Setting up your workspace",
  "Almost ready",
];

const MESSAGE_INTERVAL_MS = 5000;

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
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-4 w-2" />
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
      </div>

      {/* Section content skeleton */}
      <div className="mx-auto mt-6 flex w-full max-w-5xl flex-col gap-8">
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
        <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-2">
          {/* Left: accordion skeleton */}
          <Skeleton className="h-[26rem] rounded-md" />
          {/* Right: chat skeleton */}
          <Skeleton className="h-[26rem] rounded-md" />
        </div>
      </div>
    </div>
  );
}
