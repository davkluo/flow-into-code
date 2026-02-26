"use client";

import { InfoIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChatLog } from "@/components/pages/ChatLog";
import { SessionMessage } from "@/types/chat";

interface ChatBoxProps {
  messages: SessionMessage[];
  onSend: (message: string) => Promise<void>;
  cooldownUntil?: number;
  layoutMode?: "grow" | "fixed";
  title?: string;
  titleTooltip?: React.ReactNode;
  placeholder?: string;
  inputDescription?: string;
  emptyStateMessage?: string;
}

export function ChatBox({
  messages,
  onSend,
  cooldownUntil = 0,
  layoutMode = "grow",
  title,
  titleTooltip,
  placeholder = "Type your message.",
  inputDescription = "",
  emptyStateMessage = "Your conversation with the mock interview assistant will appear here.",
}: ChatBoxProps) {
  const [input, setInput] = useState("");
  const [isMac, setIsMac] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (input.trim() !== "" && secondsLeft === 0) {
          onSend(input.trim());
          setInput("");
        }
      }
    },
    [input, onSend, secondsLeft],
  );

  const handleSend = async () => {
    if (!input.trim()) return;
    const message = input.trim();
    setInput("");
    await onSend(message);
  };

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const remaining = Math.ceil((cooldownUntil - Date.now()) / 1000);
    if (remaining <= 0) {
      setSecondsLeft(0);
      return;
    }
    setSecondsLeft(remaining);
    const id = setInterval(() => {
      const r = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (r <= 0) {
        setSecondsLeft(0);
        clearInterval(id);
      } else {
        setSecondsLeft(r);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector<HTMLElement>(
      "[data-radix-scroll-area-viewport]",
    );
    if (viewport) viewport.scrollTop = viewport.scrollHeight;
  }, [messages]);

  const messagesLength = messages.length;
  const lastMessage = messages[messagesLength - 1];
  const showLoadingBubble =
    messagesLength > 0 &&
    (lastMessage.role === "user" ||
      (lastMessage.role === "assistant" && lastMessage.content === ""));

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
          layoutMode === "fixed" ? "flex min-h-0 flex-grow flex-col" : "",
        )}
      >
        {title && (
          <div className="border-input flex items-center gap-2 border-b px-3 py-2.5">
            <span className="text-sm font-medium">{title}</span>
            {titleTooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <InfoIcon className="text-muted-foreground size-3.5" />
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="w-[22rem] [text-wrap:wrap]"
                >
                  {titleTooltip}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
        <ScrollArea
          ref={scrollAreaRef}
          className={cn(
            "overflow-auto",
            layoutMode === "fixed" ? "min-h-0 flex-1" : "max-h-[40vh]",
          )}
        >
          <div className="mt-4 flex flex-col gap-2 px-3 pb-4">
            <ChatLog
              messages={messages}
              emptyStateMessage={emptyStateMessage}
            />
            {showLoadingBubble && (
              <div className="bg-muted-foreground/10 w-fit rounded-xl px-3 py-2 text-sm font-bold">
                <span className="animate-pulse">...</span>
              </div>
            )}
          </div>
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
            disabled={!input.trim() || secondsLeft > 0}
            size="sm"
            onClick={handleSend}
            className="cursor-auto justify-self-end rounded-full"
          >
            {secondsLeft > 0 ? (
              <>Wait {secondsLeft}s</>
            ) : (
              <>
                Send
                <span className="text-muted-foreground hidden items-center gap-1 text-xs sm:inline-flex">
                  <kbd className="bg-muted aspect-square w-4 rounded border font-mono text-xs">
                    {isMac ? "⌘" : "⌃"}
                  </kbd>
                  <kbd className="bg-muted aspect-square w-4 rounded border px-1 font-mono text-xs">
                    ↵
                  </kbd>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
