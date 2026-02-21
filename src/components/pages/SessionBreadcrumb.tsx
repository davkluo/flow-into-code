"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { cn } from "@/lib/utils";
import { SectionKey } from "@/types/practice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface SessionBreadcrumbProps {
  problemTitle: string;
  currentSectionIndex: number;
  highestVisitedIndex: number;
  onProblemClick: () => void;
  onSectionNavigate: (sectionKey: SectionKey) => void;
  onSectionSummaryClick?: (sectionKey: SectionKey) => void;
}

const glassyTrigger =
  "inline-flex h-7 shrink-0 cursor-pointer items-center rounded-md border border-black/10 bg-gradient-to-t from-transparent via-transparent via-[75%] to-white/15 px-2.5 text-xs font-medium uppercase tracking-wide backdrop-blur-2xl transition-all hover:to-white/25 dark:border-white/15 dark:from-white/[0.03] dark:to-white/[0.12] dark:hover:to-white/[0.20]";

function SectionDropdownItem({
  sectionKey,
  index,
  onSectionNavigate,
  onSectionSummaryClick,
}: {
  sectionKey: SectionKey;
  index: number;
  onSectionNavigate: (sectionKey: SectionKey) => void;
  onSectionSummaryClick?: (sectionKey: SectionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const isHoveringRef = useRef(false);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    setOpen(true);
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setTimeout(() => {
      if (!isHoveringRef.current) setOpen(false);
    }, 150);
  };

  const label = `${index + 1}. ${SECTION_KEY_TO_DETAILS[sectionKey].title}`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(glassyTrigger, "hover:text-foreground")}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {onSectionSummaryClick && (
          <DropdownMenuItem onClick={() => onSectionSummaryClick(sectionKey)}>
            View summary
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onSectionNavigate(sectionKey)}>
          Go to section
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SessionBreadcrumb({
  problemTitle,
  currentSectionIndex,
  highestVisitedIndex,
  onProblemClick,
  onSectionNavigate,
  onSectionSummaryClick,
}: SessionBreadcrumbProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const isExpandingRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const prevHighestRef = useRef(highestVisitedIndex);
  const [newlyAddedIndex, setNewlyAddedIndex] = useState<number | null>(null);

  // Detect when a new section is appended and animate it in
  useEffect(() => {
    const prev = prevHighestRef.current;
    prevHighestRef.current = highestVisitedIndex;
    if (highestVisitedIndex <= prev) return;
    setNewlyAddedIndex(highestVisitedIndex);
    isExpandingRef.current = true;
    const t = setTimeout(() => {
      setNewlyAddedIndex(null);
      isExpandingRef.current = false;
    }, 600);
    return () => clearTimeout(t);
  }, [highestVisitedIndex]);

  const updateShadows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 1);
  }, []);

  // Center active section when currentSectionIndex changes.
  // When a new section is expanding, delay the scroll so the layout has
  // settled at full width before we calculate the scroll position.
  useEffect(() => {
    const doScroll = () => {
      const container = scrollRef.current;
      const item = itemRefs.current[currentSectionIndex];
      if (!container || !item) return;
      const scrollLeft =
        item.offsetLeft - (container.offsetWidth - item.offsetWidth) / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    };

    if (isExpandingRef.current) {
      const t = setTimeout(doScroll, 510);
      return () => clearTimeout(t);
    }
    doScroll();
  }, [currentSectionIndex]);

  // Initial shadow check + ResizeObserver
  useEffect(() => {
    updateShadows();
    const ro = new ResizeObserver(updateShadows);
    if (scrollRef.current) ro.observe(scrollRef.current);
    return () => ro.disconnect();
  }, [updateShadows]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    const EDGE = 64;
    const MAX_SPEED = 6;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const scroll = () => {
      if (!scrollRef.current) return;
      if (x < EDGE) {
        const t = 1 - x / EDGE;
        scrollRef.current.scrollLeft -= t * MAX_SPEED;
      } else if (x > rect.width - EDGE) {
        const t = 1 - (rect.width - x) / EDGE;
        scrollRef.current.scrollLeft += t * MAX_SPEED;
      } else {
        return;
      }
      rafRef.current = requestAnimationFrame(scroll);
    };
    rafRef.current = requestAnimationFrame(scroll);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <nav
      aria-label="breadcrumb"
      className="text-muted-foreground mx-auto flex w-full max-w-5xl items-center justify-center gap-1.5 pt-4 text-sm sm:px-10"
    >
      {/* Always-visible: problem title trigger */}
      <button
        onClick={onProblemClick}
        className={cn(glassyTrigger, "hover:text-foreground")}
      >
        {problemTitle}
      </button>

      <span role="presentation" aria-hidden="true" className="shrink-0">
        :
      </span>

      {/* Scrollable section list */}
      <div className="relative min-w-0 shrink">
        {/* Left fade shadow */}
        <div
          className={`from-background pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r to-transparent transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollRef}
          className="no-scrollbar flex items-center gap-1.5 overflow-x-auto"
          onScroll={updateShadows}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {SECTION_ORDER.slice(0, highestVisitedIndex + 1).map(
            (sectionKey, index) => {
              const button =
                index === currentSectionIndex ? (
                  <span
                    className={cn(
                      glassyTrigger,
                      "border-lime-400/30 font-semibold text-lime-400 dark:border-lime-400/30",
                      "pointer-events-none",
                    )}
                  >
                    {index + 1}. {SECTION_KEY_TO_DETAILS[sectionKey].title}
                  </span>
                ) : (
                  <SectionDropdownItem
                    sectionKey={sectionKey}
                    index={index}
                    onSectionNavigate={onSectionNavigate}
                    onSectionSummaryClick={onSectionSummaryClick}
                  />
                );

              // First item: no chevron, no expand animation
              if (index === 0) {
                return (
                  <span
                    key={sectionKey}
                    ref={(el) => {
                      itemRefs.current[0] = el;
                    }}
                    className="inline-flex shrink-0 items-center"
                  >
                    {button}
                  </span>
                );
              }

              // Subsequent items: group chevron + button so they expand together,
              // smoothly pushing existing items to the left.
              return (
                <span
                  key={sectionKey}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5",
                    index === newlyAddedIndex && "animate-expand-crumb",
                  )}
                >
                  <span
                    role="presentation"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <ChevronRight className="size-3.5" />
                  </span>
                  {button}
                </span>
              );
            },
          )}
        </div>

        {/* Right fade shadow */}
        <div
          className={`from-background pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </nav>
  );
}
