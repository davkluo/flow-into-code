import { Fragment } from "react";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/lib/practice";
import { SectionKey } from "@/types/practice";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Button } from "../ui/button";

interface SessionBreadcrumbProps {
  problemTitle: string;
  currentSectionIndex: number;
  highestVisitedIndex: number;
  onProblemClick: () => void;
  onSectionClick: (sectionKey: SectionKey) => void;
}

export function SessionBreadcrumb({
  problemTitle,
  currentSectionIndex,
  highestVisitedIndex,
  onProblemClick,
  onSectionClick,
}: SessionBreadcrumbProps) {
  return (
    <div className="flex justify-center px-3.5 pt-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Button
              variant="outline"
              size="sm"
              onClick={onProblemClick}
              className="uppercase"
            >
              {problemTitle}
            </Button>
          </BreadcrumbItem>
          <BreadcrumbSeparator>:</BreadcrumbSeparator>
          {SECTION_ORDER.slice(0, highestVisitedIndex + 1).map(
            (sectionKey, index) => (
              <Fragment key={sectionKey}>
                <BreadcrumbItem>
                  {index === currentSectionIndex ? (
                    <BreadcrumbPage className="text-base font-semibold tracking-wide text-lime-400 uppercase">
                      {index + 1}. {SECTION_KEY_TO_DETAILS[sectionKey].title}
                    </BreadcrumbPage>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSectionClick(sectionKey)}
                      className="uppercase"
                    >
                      {index + 1}. {SECTION_KEY_TO_DETAILS[sectionKey].title}
                    </Button>
                  )}
                </BreadcrumbItem>
                {index < highestVisitedIndex && <BreadcrumbSeparator />}
              </Fragment>
            ),
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
