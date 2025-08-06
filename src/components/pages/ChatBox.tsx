"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";

interface ChatBoxProps {
  location:
    | "clarification"
    | "thought_process"
    | "pseudocode"
    | "implementation"
    | "complexity_analysis";
  messages: Message[];
  onSend: (message: string) => void;
  layoutMode?: "grow" | "fixed";
  placeholder?: string;
  inputDescription?: string;
  emptyStateMessage?: string;
}

export function ChatBox({
  messages,
  onSend,
  layoutMode = "grow",
  placeholder = "Type your message. Press ⌘+Enter to send.",
  inputDescription = "",
  emptyStateMessage = "Your conversation with the mock interview assistant will appear here.",
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (input.trim() !== "") {
          onSend(input.trim());
          setInput("");
        }
      }
    },
    [input, onSend],
  );

  useEffect(() => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const messagesLength = messages.filter((msg) => msg.role !== "system").length;

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-md",
        layoutMode === "fixed" && "h-full",
      )}
    >
      <ScrollArea
        className={cn(
          "overflow-auto",
          layoutMode === "fixed" ? "flex-grow" : "max-h-[40vh]",
        )}
      >
        <div className="mt-4 flex flex-col gap-2">
          {messagesLength === 0 ? (
            <div className="text-muted-foreground mb-4 flex w-full justify-center text-xs opacity-70">
              {emptyStateMessage}
            </div>
          ) : (
            messages.map(
              (msg, i) =>
                msg.role !== "system" && (
                  <div
                    key={`${location}-${i}`}
                    className={cn(
                      "max-w-prose rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                      msg.role === "user" &&
                        "bg-primary text-primary-foreground ml-auto",
                      msg.role === "assistant" &&
                        "bg-muted-foreground/10 text-muted-foreground mr-auto",
                    )}
                  >
                    {msg.content}
                  </div>
                ),
            )
          )}
        </div>

        <div ref={scrollAreaRef} />
      </ScrollArea>

      <div className="group focus-within:border-ring border-input relative flex flex-col rounded-md border focus-within:border">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none rounded-b-none border-0 shadow-none focus-within:border-0 focus-visible:ring-0"
        />

        <div
          className="dark:bg-input/30 flex h-fit cursor-text items-end justify-between rounded-md rounded-t-none bg-transparent p-2"
          onClick={() => textareaRef.current?.focus()}
        >
          <div className="text-muted-foreground text-xs opacity-70">
            {inputDescription}
          </div>

          <Button
            disabled={!input.trim()}
            size="sm"
            onClick={() => {
              if (input.trim()) {
                onSend(input.trim());
                setInput("");
              }
            }}
            className="cursor-auto justify-self-end"
          >
            Send
            <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:inline-flex">
              <kbd className="bg-muted aspect-square w-4 rounded border font-mono text-xs">
                ⌘
              </kbd>
              <kbd className="bg-muted aspect-square w-4 rounded border font-mono text-xs">
                ↵
              </kbd>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
