"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import { SectionKey } from "@/types/practice";

interface ChatBoxProps {
  location: SectionKey;
  messages: Message[];
  onSend: (message: string) => Promise<void>;
  layoutMode?: "grow" | "fixed";
  title?: string;
  placeholder?: string;
  inputDescription?: string;
  emptyStateMessage?: string;
}

export function ChatBox({
  location,
  messages,
  onSend,
  layoutMode = "grow",
  title,
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

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  useEffect(() => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const messagesLength = messages.filter((msg) => msg.role !== "system").length;
  const showLoadingBubble =
    messagesLength > 0 && messages[messagesLength - 1].role === "user";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-md",
        layoutMode === "fixed" && "h-full",
      )}
    >
      <div
        className={cn(
          "border-input overflow-hidden rounded-md border",
          layoutMode === "fixed" ? "min-h-0 flex-grow" : "",
        )}
      >
        {title && (
          <div className="border-input border-b px-3 py-2">
            <span className="text-sm font-medium">{title}</span>
          </div>
        )}
        <ScrollArea
          className={cn(
            "overflow-auto",
            layoutMode === "fixed" ? "h-full" : "max-h-[40vh]",
          )}
        >
          <div className="mt-4 flex flex-col gap-2 px-3">
          {messagesLength === 0 ? (
            <div className="text-muted-foreground mb-4 flex w-full justify-center text-xs opacity-70">
              {emptyStateMessage}
            </div>
          ) : (
            <>
              {messages.map(
                (msg, i) =>
                  msg.role !== "system" && (
                    <div
                      key={`${location}-${i}`}
                      className={cn(
                        "max-w-prose rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                        msg.role === "user" &&
                          "bg-primary text-primary-foreground ml-auto",
                        msg.role === "assistant" &&
                          "bg-muted-foreground/10 mr-auto",
                      )}
                    >
                      {msg.content}
                    </div>
                  ),
              )}
              {showLoadingBubble && (
                <div className="bg-muted-foreground/10 w-fit rounded-xl px-3 py-2 text-sm font-bold">
                  <span className="animate-pulse">...</span>
                </div>
              )}
            </>
          )}
        </div>

          <div ref={scrollAreaRef} />
        </ScrollArea>
      </div>

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
            onClick={handleSend}
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
