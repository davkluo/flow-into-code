import { SectionKey } from "./practice";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type SessionMessage = {
  role: "user" | "assistant";
  content: string;
  section: SectionKey;
  timestamp: number;
};
