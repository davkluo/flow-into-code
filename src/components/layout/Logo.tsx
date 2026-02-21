"use client";

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

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("group inline-flex flex-col leading-none", className)}>
      <span className="font-logo inline-block origin-center scale-y-[1.1] text-xl font-bold tracking-tight">
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            className={cn(
              "group-hover:animate-letter-bounce inline-block",
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
