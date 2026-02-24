import { SessionMessage } from "./chat";
import { SectionKey } from "./practice";

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
  // TODO: Add field for field snapshots
}
