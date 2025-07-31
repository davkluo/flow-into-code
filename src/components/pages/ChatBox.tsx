"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatBox({
  messages,
  onSend,
  placeholder = "Type your message. Press ⌘+Enter to send.",
}: {
  messages: { role: "user" | "ai"; content: string }[];
  onSend: (message: string) => void;
  placeholder?: string;
}) {
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
    const el = scrollAreaRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex h-full w-full flex-col rounded-md">
      <ScrollArea>
        <div
          ref={scrollAreaRef}
          className="flex max-h-60 min-h-20 flex-col gap-2 overflow-y-auto"
        >
          {messages.map((msg, i) => (
            <div
              key={`${i}-${msg.content.slice(0, 10)}`}
              className={cn(
                "max-w-prose rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground ml-auto"
                  : "bg-muted-foreground/10 text-muted-foreground mr-auto",
              )}
            >
              {msg.content}
            </div>
          ))}
        </div>
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
            Description or hint
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

      {/* <div className="group flex flex-col">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none rounded-b-none border-b-0 focus-visible:border-b-0 focus-visible:ring-0"
        />
        <div className="border-input bg-input pointer-events-none right-2 bottom-2 flex items-center rounded-md rounded-t-none border">
          <Button
            disabled={!input.trim()}
            size="sm"
            onClick={() => {
              if (input.trim() !== "") {
                onSend(input.trim());
                setInput("");
              }
            }}
            className="pointer-events-auto"
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
      </div> */}
    </div>
  );
}
