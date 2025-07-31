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
          className="flex max-h-60 flex-col gap-2 overflow-y-auto"
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

      <div className="bg-background py-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          placeholder={placeholder}
          className=""
        />
        <div className="mt-3 text-right">
          <Button
            disabled={!input.trim()}
            size="sm"
            onClick={() => {
              if (input.trim() !== "") {
                onSend(input.trim());
                setInput("");
              }
            }}
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
