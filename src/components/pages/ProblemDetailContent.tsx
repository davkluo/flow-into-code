import { ExternalLink } from "lucide-react";
import { DifficultyBadge } from "@/components/shared/DifficultyBadge";
import { TagBadge } from "@/components/shared/TagBadge";
import { Item, ItemContent } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Problem, ProblemDetails } from "@/types/problem";

interface ProblemDetailContentProps {
  problem: Problem;
  problemDetails: ProblemDetails | null;
  isLoading: boolean;
  onGeneratePreview?: () => void;
  showGenerateButton?: boolean;
}

export function ProblemDetailContent({
  problem,
  problemDetails,
  isLoading,
  onGeneratePreview,
  showGenerateButton = false,
}: ProblemDetailContentProps) {
  return (
    <>
      <div className="mt-2">
        <h3 className="text-lg font-semibold">
          {problem.id}. {problem.title}
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={`https://leetcode.com/problems/${problem.titleSlug}/description/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground ml-1.5 inline-flex translate-y-[-1px] align-middle"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent>View original on LeetCode</TooltipContent>
          </Tooltip>
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <DifficultyBadge
            difficulty={problem.difficulty}
            className="-mt-0.5"
          />
          {problem.topicTags.map((tag) => (
            <TagBadge key={tag.id} tagName={tag.name} />
          ))}
        </div>
        <p className="text-muted-foreground mt-3 text-[11px] leading-relaxed">
          LeetCode owns the original problem content. Reframed text here is
          independently generated for learning purposes only. No affiliation
          with or endorsement by LeetCode. Support the original source at
          leetcode.com.
        </p>
      </div>

      {showGenerateButton && !problemDetails && !isLoading && (
        <div className="text-muted-foreground rounded-md border border-dashed px-3 py-2.5 text-xs">
          <p>
            It looks like you are the first to attempt this problem! This
            problem hasn&apos;t been prepared yet, but you can generate its
            details below if you are interested in practicing this problem — it
            may take a short moment.
          </p>
          <div className="flex w-full justify-center">
            <button
              onClick={onGeneratePreview}
              className="mt-2 cursor-pointer text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
            >
              Generate details
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-4">
          {/* Framing skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20" />
            <div className="bg-brand-inset rounded-md p-4">
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="mt-2 h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/6" />
              </div>
            </div>
          </div>
          {/* Examples skeleton */}
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <div className="bg-brand-inset rounded-md p-4">
              <div className="flex flex-col gap-2.5">
                <Skeleton className="h-3.5 w-2/3" />
                <Skeleton className="h-3.5 w-1/2" />
              </div>
            </div>
          </div>
        </div>
      )}

      {problemDetails?.derived?.framing && (
        <Tabs defaultValue="general">
          <TabsList variant="line">
            <TabsTrigger value="general" className="text-xs">
              General
            </TabsTrigger>
            {problemDetails.derived.framing.backend && (
              <TabsTrigger value="backend" className="text-xs">
                Backend
              </TabsTrigger>
            )}
            {problemDetails.derived.framing.systems && (
              <TabsTrigger value="systems" className="text-xs">
                Systems
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="general">
            <Item
              variant="default"
              size="sm"
              className="bg-brand-inset rounded-md"
            >
              <ItemContent>
                <p className="text-sm leading-loose whitespace-pre-line">
                  {problemDetails.derived.framing.canonical}
                </p>
              </ItemContent>
            </Item>
          </TabsContent>
          {problemDetails.derived.framing.backend && (
            <TabsContent value="backend">
              <Item
                variant="default"
                size="sm"
                className="bg-brand-inset rounded-md"
              >
                <ItemContent>
                  <p className="text-sm leading-loose whitespace-pre-line">
                    {problemDetails.derived.framing.backend}
                  </p>
                </ItemContent>
              </Item>
            </TabsContent>
          )}
          {problemDetails.derived.framing.systems && (
            <TabsContent value="systems">
              <Item
                variant="default"
                size="sm"
                className="bg-brand-inset rounded-md"
              >
                <ItemContent>
                  <p className="text-sm leading-loose whitespace-pre-line">
                    {problemDetails.derived.framing.systems}
                  </p>
                </ItemContent>
              </Item>
            </TabsContent>
          )}
        </Tabs>
      )}

      {problemDetails?.source?.examples &&
        problemDetails.source.examples.length > 0 && (
          <Tabs defaultValue="example-0">
            <TabsList variant="line">
              {problemDetails.source.examples.map((_, index) => (
                <TabsTrigger
                  key={index}
                  value={`example-${index}`}
                  className="text-xs"
                >
                  Example {index + 1}
                </TabsTrigger>
              ))}
            </TabsList>
            {problemDetails.source.examples.map((example, index) => (
              <TabsContent key={index} value={`example-${index}`}>
                <Item
                  variant="default"
                  size="sm"
                  className="bg-brand-inset rounded-md"
                >
                  <ItemContent className="gap-2">
                    <p className="font-mono text-sm">
                      <span className="text-muted-foreground">Input: </span>
                      {example.input}
                    </p>
                    <p className="font-mono text-sm">
                      <span className="text-muted-foreground">Output: </span>
                      {example.output}
                    </p>
                    {example.explanation && (
                      <p className="mt-1 text-sm leading-relaxed">
                        {example.explanation}
                      </p>
                    )}
                  </ItemContent>
                </Item>
              </TabsContent>
            ))}
          </Tabs>
        )}
    </>
  );
}
