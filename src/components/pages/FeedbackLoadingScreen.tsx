"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const ROTATING_MESSAGES = [
  "Reviewing your responses",
  "Analyzing your approach",
  "Grading your implementation",
  "Evaluating your complexity analysis",
  "Preparing your feedback report",
];

const MESSAGE_INTERVAL_MS = 4000;

export function FeedbackLoadingScreen() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, MESSAGE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-background duration-500">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        <p
          key={messageIndex}
          className="text-muted-foreground animate-in fade-in-0 text-sm duration-500"
        >
          {ROTATING_MESSAGES[messageIndex]}...
        </p>
      </div>
    </div>
  );
}
