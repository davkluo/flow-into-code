"use client";

import _ from "lodash";
import { useEffect, useMemo, useState } from "react";
import { AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { LanguageKey } from "@/lib/codeMirror";
import { Message } from "@/types/chat";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { ChatBox } from "./ChatBox";
import { CodeEditor } from "./CodeEditor";

interface implementationSectionProps {
  messages: Message[];
  onSend: (content: string) => Promise<void>;
  onCodeArtifactChange: (content: string, language: LanguageKey) => void;
  onNext: () => void;
  isCurrentStep: boolean;
}

export function ImplementationSection({
  messages,
  onSend,
  onCodeArtifactChange,
  onNext,
  isCurrentStep,
}: implementationSectionProps) {
  const [implementation, setImplementation] = useState("");
  const [language, setLanguage] = useState<LanguageKey>("python");

  const debouncedCodeChange = useMemo(
    () =>
      _.debounce((content: string, language: LanguageKey) => {
        onCodeArtifactChange(content, language);
      }, 300),
    [onCodeArtifactChange],
  );

  useEffect(() => {
    debouncedCodeChange(implementation, language);
  }, [implementation, language, debouncedCodeChange]);

  useEffect(() => {
    return () => debouncedCodeChange.cancel();
  }, [debouncedCodeChange]);

  return (
    <AccordionContent className="flex h-120 flex-col gap-4 px-3.5">
      <p className="text-muted-foreground col-span-full text-xs">
        Implement the solution to the problem using your preferred programming
        language. Focus on translating your pseudocode into actual code,
        ensuring that you handle edge cases and follow best practices. You may
        also want to walk through your implementation with sample inputs to
        verify its correctness.
      </p>

      <ResizablePanelGroup direction="horizontal" className="w-full">
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full w-full items-center justify-center">
            <div className="bg-background h-full w-full rounded-l-md border border-r-0 p-2 text-sm">
              <CodeEditor
                value={implementation}
                onChange={setImplementation}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full min-h-0 w-full items-center justify-center">
            <div className="bg-background h-full min-h-0 w-full rounded-r-md border border-l-0 p-2 text-sm">
              <ChatBox
                location="implementation"
                messages={messages}
                onSend={onSend}
                layoutMode="fixed"
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Button variant="default" disabled={!isCurrentStep} onClick={onNext}>
        Next
      </Button>
    </AccordionContent>
  );
}
