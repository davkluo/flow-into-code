import { cn } from "@/lib/utils";
import { SessionMessage } from "@/types/chat";

interface ChatLogProps {
  messages: SessionMessage[];
  emptyStateMessage?: string;
  className?: string;
}

export function ChatLog({
  messages,
  emptyStateMessage = "No messages.",
  className,
}: ChatLogProps) {
  const visibleMessages = messages.filter((m) => m.content !== "");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {visibleMessages.length === 0 ? (
        <div className="text-muted-foreground flex w-full justify-center py-4 text-xs opacity-70">
          {emptyStateMessage}
        </div>
      ) : (
        visibleMessages.map((msg) => (
          <div
            key={msg.timestamp}
            className={cn(
              "max-w-prose rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
              msg.role === "user" && "bg-primary text-primary-foreground ml-auto",
              msg.role === "assistant" && "bg-muted-foreground/10 mr-auto",
            )}
          >
            {msg.content}
          </div>
        ))
      )}
    </div>
  );
}
