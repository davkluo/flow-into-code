"use client";

import { ChevronDownIcon } from "lucide-react";
import { ChatLog } from "@/components/pages/ChatLog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTION_KEY_TO_DETAILS, SECTION_ORDER } from "@/constants/practice";
import type { SessionMessage } from "@/types/chat";

export function ChatLogsTabs({ messages }: { messages: SessionMessage[] }) {
  return (
    <div className="border-input overflow-hidden rounded-md border">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="hover:bg-muted/50 flex w-full items-center justify-between px-4 py-3 text-left transition-colors [&[data-state=open]>svg]:rotate-180">
          <span className="text-sm font-medium">Chat Logs</span>
          <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t">
          <div className="px-4 py-4">
            <Tabs defaultValue={SECTION_ORDER[0]}>
              <TabsList variant="line">
                {SECTION_ORDER.map((key) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {SECTION_KEY_TO_DETAILS[key].title}
                  </TabsTrigger>
                ))}
              </TabsList>
              {SECTION_ORDER.map((key) => (
                <TabsContent key={key} value={key} className="mt-4">
                  <div className="max-h-80 overflow-y-auto pr-2">
                    <ChatLog
                      messages={messages.filter((m) => m.section === key)}
                      emptyStateMessage="No chat messages in this section."
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
