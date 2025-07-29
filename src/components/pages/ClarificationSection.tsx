"use client";

import { useState } from "react";
import { ChatBox } from "@/components/pages/ChatBox";
import { Message } from "@/types/chat";

export function ClarificationSection() {
  const [messages, setMessages] = useState<Message[]>([]);

  // TODO: Implement actual AI response logic
  // Create context to send to AI
  // Update context with response from AI
  const handleSend = (content: string) => {
    const newMessage: Message = { role: "user", content };
    setMessages((prev) => [...prev, newMessage]);

    // Mock AI response
    const aiResponse: Message = {
      role: "ai",
      content: "And how does that make you feel?",
    };
    // Simulate AI response after a short delay
    setTimeout(() => {
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  return <ChatBox messages={messages} onSend={handleSend} />;
}
