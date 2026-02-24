import { SessionMessage } from "./chat";
import { SectionKey, SectionSnapshots } from "./practice";

interface CategoryFeedback {
  score: number;
  comments: string; // Justification of score
  compliments: string; // Things done well
  advice: string; // Suggestions for improvement
}

interface SessionFeedback {
  sections: Record<SectionKey, CategoryFeedback>;
  interviewerCommunication: CategoryFeedback;
  summary: string;
}

export interface Session {
  userId: string;
  createdAt: Date;
  problemTitleSlug: string;
  chatLog: SessionMessage[];
  feedback: SessionFeedback;
  fields: Partial<SectionSnapshots>; // User-entered fields for each section
}
