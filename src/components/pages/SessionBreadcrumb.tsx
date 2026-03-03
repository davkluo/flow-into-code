"use client";

import { Check, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import { cn } from "@/lib/utils";
import { SectionKey } from "@/types/practice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
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
  completedSections: Set<SectionKey>;
  onViewProblem: () => void;
  onEndSession: () => void;
  onSectionNavigate: (sectionKey: SectionKey) => void;
  onSectionSummaryClick?: (sectionKey: SectionKey) => void;
}

const linkTrigger =
  "inline-flex shrink-0 cursor-pointer items-center px-0.5 pb-[8px] text-sm font-medium tracking-wide outline-none hover:text-foreground";

const activeBase = "text-foreground font-semibold";
const activeAccent =
  "relative after:absolute after:bottom-[1px] after:left-[8px] after:right-[8px] after:h-[3px] after:rounded-full after:bg-brand-secondary";

const menuItemHover =
  "focus:bg-transparent focus:underline focus:underline-offset-4";

/**
 * Breadcrumb item for the active problem.
 *
 * Renders the problem title as a dropdown trigger with "View reference" and
 * "End session" options. End session is guarded by a confirmation AlertDialog.
 *
 * @param problemTitle  Display title for the current problem.
 * @param onViewProblem Opens the problem reference sheet.
 * @param onEndSession  Resets session state after the user confirms.
 */
function ProblemDropdownItem({
  problemTitle,
  onViewProblem,
  onEndSession,
}: {
  problemTitle: string;
  onViewProblem: () => void;
  onEndSession: () => void;
}) {
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className={cn(linkTrigger, activeBase)}>
          <span className="border-input hover:bg-card hover:text-card-foreground rounded-md border px-2.5 py-1 transition-colors">
            {problemTitle}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem className={menuItemHover} onClick={onViewProblem}>
            View reference
          </DropdownMenuItem>
          <DropdownMenuItem
            className={cn(
              menuItemHover,
              "text-destructive focus:text-destructive",
            )}
            onClick={() => setAlertOpen(true)}
          >
            End session
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End this session?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={onEndSession} variant="destructive">
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Breadcrumb item for a visited section.
 *
 * Renders the section title as a dropdown with "View summary" and "Go to section" options.
 * Shows a checkmark when the section is complete.
 *
 * @param sectionKey            The section this item represents.
 * @param index                 Zero-based position in SECTION_ORDER (used for display numbering).
 * @param isComplete            Whether all required fields for this section are filled.
 * @param onSectionNavigate     Navigates to this section.
 * @param onSectionSummaryClick Opens the section summary sheet (optional).
 */
function SectionDropdownItem({
  sectionKey,
  index,
  isComplete,
  onSectionNavigate,
  onSectionSummaryClick,
}: {
  sectionKey: SectionKey;
  index: number;
  isComplete: boolean;
  onSectionNavigate: (sectionKey: SectionKey) => void;
  onSectionSummaryClick?: (sectionKey: SectionKey) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(linkTrigger)}>
        {index + 1}. {SECTION_KEY_TO_DETAILS[sectionKey].title}
        {isComplete && <Check className="ml-1 inline-block size-3" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {onSectionSummaryClick && (
          <DropdownMenuItem
            className={menuItemHover}
            onClick={() => onSectionSummaryClick(sectionKey)}
          >
            View summary
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={menuItemHover}
          onClick={() => onSectionNavigate(sectionKey)}
        >
          Go to section
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Horizontally scrollable breadcrumb bar shown at the top of the practice session.
 *
 * Displays the problem title (with a dropdown for reference/end session) followed
 * by each visited section as a dropdown item. Sections animate in when first
 * visited and the bar auto-scrolls to keep the active section centred. Left/right
 * fade shadows appear when there is overflow to scroll.
 *
 * @param problemTitle          Title of the active problem.
 * @param currentSectionIndex   Index of the currently displayed section.
 * @param highestVisitedIndex   Index of the furthest section the user has reached.
 * @param completedSections     Set of section keys where all required fields are filled.
 * @param onViewProblem         Opens the problem reference sheet.
 * @param onEndSession          Resets the session back to problem selection.
 * @param onSectionNavigate     Jumps to the given section.
 * @param onSectionSummaryClick Opens the summary sheet for the given section.
 */
export function SessionBreadcrumb({
  problemTitle,
  currentSectionIndex,
  highestVisitedIndex,
  completedSections,
  onViewProblem,
  onEndSession,
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

  /** Recalculates whether left/right overflow shadows should be visible. */
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

  /**
   * Provides edge-proximity auto-scrolling: moves the breadcrumb list left or
   * right via requestAnimationFrame when the cursor is within 64px of either edge.
   */
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

  /** Cancels the pending requestAnimationFrame auto-scroll loop when the cursor leaves the breadcrumb area. */
  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <nav
      aria-label="breadcrumb"
      className="text-muted-foreground mx-auto flex w-full max-w-5xl items-center justify-center gap-1.5 pt-2 sm:pt-4 text-sm sm:px-10"
    >
      {/* Always-visible: problem title trigger */}
      <ProblemDropdownItem
        problemTitle={problemTitle}
        onViewProblem={onViewProblem}
        onEndSession={onEndSession}
      />

      {/* Scrollable section list */}
      <div className="relative ml-2 min-w-0 shrink">
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
              const isComplete = completedSections.has(sectionKey);
              const button =
                index === currentSectionIndex ? (
                  <span
                    className={cn(
                      linkTrigger,
                      activeBase,
                      activeAccent,
                      "pointer-events-none",
                    )}
                  >
                    {index + 1}. {SECTION_KEY_TO_DETAILS[sectionKey].title}
                    {isComplete && (
                      <Check className="ml-1 inline-block size-3" />
                    )}
                  </span>
                ) : (
                  <SectionDropdownItem
                    sectionKey={sectionKey}
                    index={index}
                    isComplete={isComplete}
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
                    className="group inline-flex shrink-0 items-center"
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
                    "group inline-flex shrink-0 items-center gap-1.5",
                    index === newlyAddedIndex && "animate-expand-crumb",
                  )}
                >
                  <span
                    role="presentation"
                    aria-hidden="true"
                    className="shrink-0 pb-[5px]"
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
