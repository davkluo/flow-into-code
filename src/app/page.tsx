"use client";

import { ArrowUp, ChevronDown, Heart } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SocialsRow } from "@/components/shared/SocialsRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StoryToken = {
  id: string;
  label: string;
  detail: string;
};

type FlowParticle = {
  left: string;
  top: string;
  size: number;
  duration: number;
  delay: number;
  className: string;
};

const STORY_TOKENS: StoryToken[] = [
  {
    id: "problem-restatement",
    label: "problem restatement",
    detail: "Show you understand the problem by putting it in your own words.",
  },
  {
    id: "inputs-outputs",
    label: "inputs & outputs",
    detail: "Define the function signature and clarify data formats.",
  },
  {
    id: "constraints",
    label: "constraints",
    detail:
      "Identify limits and clarifying assumptions to guide your approach.",
  },
  {
    id: "edge-cases",
    label: "edge cases",
    detail: "Catch off-by-one, empty input, and boundary traps early.",
  },
  {
    id: "clarifying-questions",
    label: "clarifying questions",
    detail: "Clarify ambiguous or unclear aspects of the problem.",
  },
  {
    id: "approach",
    label: "approach",
    detail: "Define a clear plan for solving the problem.",
  },
  {
    id: "reasoning",
    label: "reasoning",
    detail:
      "Justify the correctness of your approach and the tradeoffs involved.",
  },
  {
    id: "pseudocode",
    label: "pseudocode",
    detail: "Shape the algorithm before syntax decisions take over.",
  },
];

const HERO_FLOW_PARTICLES: FlowParticle[] = [
  {
    left: "6%",
    top: "18%",
    size: 8,
    duration: 7.5,
    delay: 0,
    className: "bg-brand-primary/40",
  },
  {
    left: "14%",
    top: "34%",
    size: 10,
    duration: 9.5,
    delay: 0.8,
    className: "bg-brand-secondary/35",
  },
  {
    left: "27%",
    top: "52%",
    size: 6,
    duration: 8.8,
    delay: 0.3,
    className: "bg-brand-primary/30",
  },
  {
    left: "43%",
    top: "22%",
    size: 9,
    duration: 10.5,
    delay: 1.1,
    className: "bg-cyan-400/30",
  },
  {
    left: "58%",
    top: "64%",
    size: 7,
    duration: 8.2,
    delay: 0.4,
    className: "bg-brand-secondary/35",
  },
  {
    left: "72%",
    top: "40%",
    size: 11,
    duration: 11.2,
    delay: 1.6,
    className: "bg-brand-primary/30",
  },
  {
    left: "84%",
    top: "76%",
    size: 8,
    duration: 9.1,
    delay: 0.9,
    className: "bg-teal-400/25",
  },
  {
    left: "92%",
    top: "28%",
    size: 6,
    duration: 7.9,
    delay: 0.2,
    className: "bg-brand-secondary/30",
  },
  {
    left: "35%",
    top: "82%",
    size: 7,
    duration: 9.7,
    delay: 1.4,
    className: "bg-cyan-400/25",
  },
  {
    left: "66%",
    top: "12%",
    size: 9,
    duration: 10.2,
    delay: 0.6,
    className: "bg-brand-primary/25",
  },
];

const CODE_SKELETON_WIDTHS = [88, 74, 67, 81, 59, 76, 64, 84, 71, 57, 79, 68];
const CODE_LINE_INDENTS = [0, 12, 12, 24, 12, 12, 24, 12, 12, 20, 12, 12];
const CODE_LINE_EXTRA_TOP_MARGIN = [0, 0, 0, 6, 0, 0, 8, 0, 0, 6, 0, 0];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tokenProgress(
  globalProgress: number,
  index: number,
  total: number,
): number {
  const start = index / total;
  const end = (index + 1) / total;
  return clamp((globalProgress - start) / (end - start), 0, 1);
}

export default function LandingPage() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const OUTRO_START = 0.7;
  const OUTRO_OFFSET_SVH = 100;
  const TEXT_SETTLE_END = 0.14;
  const WINDOW_FADE_START = 0.14;
  const WINDOW_FADE_END = 0.22;
  const INGREDIENTS_START = WINDOW_FADE_END + 0.02;
  const ingredientsProgress = clamp(
    (progress - INGREDIENTS_START) / (OUTRO_START - INGREDIENTS_START),
    0,
    1,
  );
  const textSettle = clamp(progress / TEXT_SETTLE_END, 0, 1);
  const windowAppear = clamp(
    (progress - WINDOW_FADE_START) / (WINDOW_FADE_END - WINDOW_FADE_START),
    0,
    1,
  );
  const stackShiftProgress = clamp((progress - OUTRO_START) / 0.28, 0, 1);
  const firstStackLiftSvh = stackShiftProgress * 90;

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = rect.height - viewport;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const next = clamp(-rect.top / total, 0, 1);
      setProgress(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setHeroVisible(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const updateBackToTop = () => {
      setShowBackToTop(window.scrollY > window.innerHeight * 0.85);
    };

    updateBackToTop();
    window.addEventListener("scroll", updateBackToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateBackToTop);
  }, []);

  const codeFill = useMemo(() => {
    const total = STORY_TOKENS.length;
    const aggregate = STORY_TOKENS.reduce((sum, _, index) => {
      const local = tokenProgress(ingredientsProgress, index, total);
      const droppedIntoCode = clamp((local - 0.7) / 0.3, 0, 1);
      return sum + droppedIntoCode;
    }, 0);
    return (aggregate / total) * 100;
  }, [ingredientsProgress]);
  const secondaryLineIndices = useMemo(() => {
    const set = new Set<number>();
    let index = 2;
    let step = 3;
    while (index < STORY_TOKENS.length) {
      set.add(index);
      index += step;
      step = step === 3 ? 4 : 3;
    }
    return set;
  }, []);
  const heroRevealClass = () =>
    cn(
      "transition-[opacity,transform,filter] duration-700 ease-out",
      heroVisible
        ? "opacity-100 translate-y-0 blur-0"
        : "opacity-0 translate-y-6 blur-[3px]",
    );

  return (
    <div className="relative overflow-x-clip">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {HERO_FLOW_PARTICLES.map((particle, index) => (
          <span
            key={`${particle.left}-${particle.top}-${index}`}
            className={cn(
              "hero-flow-particle absolute rounded-full blur-[1px]",
              particle.className,
            )}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
            aria-hidden
          />
        ))}
      </div>

      <div className="relative z-10">
        <section className="relative mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-6xl flex-col justify-center gap-6 overflow-hidden px-8 py-10 sm:px-10 sm:py-12 lg:px-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="via-brand-primary/12 absolute inset-x-0 top-[18%] h-40 bg-gradient-to-r from-transparent to-transparent blur-3xl" />
          </div>

          <div className="relative z-10 flex -translate-y-6 flex-col gap-6 sm:-translate-y-8">
          <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl md:text-6xl">
            <span
              className={cn(heroRevealClass(), "block")}
              style={{ transitionDelay: "0ms" }}
            >
              Practice technical interviews
            </span>
            <span
              className={cn(heroRevealClass(), "block")}
              style={{ transitionDelay: "120ms" }}
            >
              like the real thing.
            </span>
          </h1>
          <p
            className={cn(
              heroRevealClass(),
              "text-muted-foreground max-w-2xl text-base sm:text-lg",
            )}
            style={{ transitionDelay: "280ms" }}
          >
            Flow Into Code helps you build a consistent, communication-first
            process: clarify requirements, identify edge cases, shape the plan,
            then implement with confidence under real interview pressure.
          </p>
          <div
            className={cn(heroRevealClass(), "flex flex-wrap gap-3 pt-2")}
            style={{ transitionDelay: "420ms" }}
          >
            <Button asChild size="lg" className="rounded-full px-7">
              <Link href="/practice">Start practicing</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full px-7"
            >
              <Link href="/about">See what this is</Link>
            </Button>
          </div>
        </div>

          <div className="pointer-events-none absolute right-0 bottom-4 left-0 flex items-center justify-center">
            <ChevronDown className="text-foreground/60 size-5 animate-bounce" />
          </div>
        </section>

        <section
          ref={scrollRef}
          className="relative mx-auto h-[550vh] max-w-6xl px-4 sm:px-6"
        >
          <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              transform: `translateY(${-firstStackLiftSvh}svh)`,
            }}
          >
            <div
              className="absolute top-[18%] right-0 left-0 mx-auto max-w-4xl px-6 text-center"
              style={{
                opacity: 1,
                transform: `translateY(${(1 - textSettle) * 4}svh)`,
              }}
            >
              <p className="text-foreground/90 text-2xl leading-tight font-semibold sm:text-3xl">
                The best way to start coding
              </p>
              <p className="text-foreground mt-1 text-2xl leading-tight font-semibold sm:text-3xl">
                is not by coding.
              </p>
            </div>

            {STORY_TOKENS.map((token, index) => {
              const local = tokenProgress(
                ingredientsProgress,
                index,
                STORY_TOKENS.length,
              );
              const fromLeft = index % 2 === 0;
              const enter = clamp((local - 0.1) / 0.25, 0, 1);
              const drop = clamp((local - 0.7) / 0.28, 0, 1);
              const absorb = clamp((local - 0.7) / 0.24, 0, 1);
              const startX = fromLeft ? -420 : 420;
              const travelX = (1 - enter) * startX;
              const travelY = (1 - enter) * -20 + drop * 212;
              const cardOpacity = enter * (1 - absorb);
              const isVisible = local > 0.03 && local < 0.99;
              const scale = 0.93 + enter * 0.07 - absorb * 0.24;
              const isSecondary = secondaryLineIndices.has(index);

              return (
                <div
                  key={`${token.id}-story-card`}
                  className="pointer-events-none absolute top-[32%] left-1/2 z-20 w-[min(420px,84vw)]"
                  style={{
                    opacity: isVisible ? cardOpacity : 0,
                    transform: `translate(calc(-50% + ${travelX}px), ${travelY}px) scale(${scale})`,
                  }}
                  aria-hidden
                >
                <div
                  className={cn(
                    "rounded-2xl border p-4 shadow-[0_14px_45px_-22px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-5",
                    isSecondary
                      ? "bg-brand-secondary/18 border-brand-secondary/46"
                      : "bg-brand-primary/18 border-brand-primary/46",
                  )}
                >
                    <p className="text-sm font-semibold capitalize sm:text-base">
                      {token.label}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-xs leading-5 sm:text-sm">
                      {token.detail}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="absolute right-4 bottom-5 left-4 sm:right-8 sm:left-8">
              <div className="mx-auto flex max-w-4xl items-end justify-center">
                <div
                  className="relative"
                  style={{
                    opacity: windowAppear,
                    transform: `translateY(${(1 - textSettle) * 7 - 18}svh)`,
                  }}
                >
                  <div className="border-border/70 bg-background/45 relative h-56 w-[min(760px,86vw)] overflow-hidden rounded-2xl border shadow-[0_30px_80px_-36px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:w-[min(560px,64vw)]">
                    <div className="border-border/60 bg-background/70 absolute inset-x-0 top-0 h-10 border-b backdrop-blur">
                      <div className="flex h-full items-center gap-2 px-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                        <span className="text-foreground/70 ml-2 text-[11px] tracking-[0.12em] uppercase">
                          solution code
                        </span>
                      </div>
                    </div>

                    <div className="absolute top-14 right-6 left-6 space-y-3">
                      {STORY_TOKENS.map((_, index) => {
                        const base =
                          CODE_SKELETON_WIDTHS[
                            index % CODE_SKELETON_WIDTHS.length
                          ];
                        const indent =
                          CODE_LINE_INDENTS[index % CODE_LINE_INDENTS.length];
                        const extraTopMargin =
                          CODE_LINE_EXTRA_TOP_MARGIN[
                            index % CODE_LINE_EXTRA_TOP_MARGIN.length
                          ];
                        const lineWidth =
                          index === 0
                            ? 34
                            : Math.max(
                                40,
                                Math.min(
                                  84,
                                  base - ((index * 3) % 8) - indent / 2,
                                ),
                              );
                        const filledLines = Math.floor(
                          (codeFill / 100) * STORY_TOKENS.length,
                        );
                        const isFilled = index < filledLines;
                        const isSecondary = secondaryLineIndices.has(index);
                        return (
                          <div
                            key={`skeleton-line-${index}`}
                            className="bg-foreground/22 relative h-2 overflow-hidden rounded-full"
                            style={{
                              width: `${lineWidth}%`,
                              marginLeft: `${indent}%`,
                              marginTop:
                                index === 0 ? 0 : `${extraTopMargin}px`,
                            }}
                          >
                            <div
                              className="absolute inset-0 transition-[opacity] duration-200"
                              style={{
                                opacity: isFilled ? 1 : 0,
                                backgroundImage: isSecondary
                                  ? "linear-gradient(90deg, oklch(66.56% 0.224 34.33 / 0.9) 0%, oklch(63% 0.2 34 / 0.78) 72%, oklch(63% 0.2 34 / 0.48) 100%)"
                                  : "linear-gradient(90deg, oklch(70.38% 0.123 182.5 / 0.95) 0%, oklch(67% 0.11 182 / 0.82) 72%, oklch(67% 0.11 182 / 0.5) 100%)",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.28),transparent_36%)]" />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="pointer-events-auto absolute inset-x-0 top-[30%] mx-auto max-w-4xl px-6 text-center"
              style={{
                transform: `translateY(${OUTRO_OFFSET_SVH}svh)`,
              }}
            >
              <p className="text-foreground/90 text-2xl leading-tight font-semibold sm:text-3xl">
                Start with understanding and planning
              </p>
              <p className="text-foreground/90 text-2xl leading-tight font-semibold sm:text-3xl">
                for cleaner and more intentional code.
              </p>

              <p className="text-foreground mt-10 text-xl leading-tight font-semibold sm:text-2xl">
                Refine your process now
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" className="rounded-full px-7">
                  <Link href="/practice">Go to practice</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-7"
                >
                  <Link href="/about">Learn more</Link>
                </Button>
              </div>
            </div>
          </div>
          </div>
        </section>
        <footer className="mx-auto mt-4 max-w-6xl px-6 pt-2 pb-2.5 sm:px-8">
          <div className="via-border mx-auto mb-1.5 h-px w-full max-w-3xl bg-gradient-to-r from-transparent to-transparent shadow-[0_1px_12px_-2px_rgba(0,0,0,0.22)]" />
          <p className="text-muted-foreground mb-1 flex items-center justify-center gap-1.5 text-[11px]">
            Made with <Heart className="size-3 fill-current text-red-500" /> by
            David Luo. &copy; 2026
          </p>
          <SocialsRow className="mt-1" />
        </footer>
      </div>
      <button
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "bg-background/85 border-border/70 text-foreground fixed right-5 bottom-5 z-40 flex size-9 items-center justify-center rounded-full border shadow-md backdrop-blur transition-all",
          showBackToTop
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="size-4" />
      </button>
      <style jsx>{`
        .hero-flow-particle {
          opacity: 0;
          animation-name: hero-flow;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes hero-flow {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 0) scale(0.8);
          }
          20% {
            opacity: 0.6;
          }
          100% {
            opacity: 0;
            transform: translate3d(120px, -82px, 0) scale(1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-flow-particle {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
