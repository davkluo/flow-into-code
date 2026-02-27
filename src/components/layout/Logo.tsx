"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const LETTERS = [
  { char: "f", amber: false },
  { char: "l", amber: false },
  { char: "o", amber: false },
  { char: "w", amber: false },
  { char: "i", amber: true },
  { char: "n", amber: true },
  { char: "t", amber: true },
  { char: "o", amber: true },
  { char: "c", amber: false },
  { char: "o", amber: false },
  { char: "d", amber: false },
  { char: "e", amber: false },
];

// Last letter delay + animation duration — hold animating state this long
const ANIMATION_TOTAL_MS = (LETTERS.length - 1) * 40 + 600;

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMouseEnter() {
    if (isAnimating) return;
    setIsAnimating(true);
    timerRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, ANIMATION_TOTAL_MS);
  }

  return (
    <div
      className={cn("inline-flex items-center", className)}
      onMouseEnter={handleMouseEnter}
    >
      <span className="font-logo inline-block origin-center scale-y-[1.1] text-xl font-bold tracking-tight">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className={cn(
              "inline-block",
              isAnimating && "animate-letter-bounce",
              letter.amber ? "text-teal-500" : "text-foreground",
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {letter.char}
          </span>
        ))}
      </span>
    </div>
  );
}
