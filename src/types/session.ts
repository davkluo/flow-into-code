import { SessionMessage } from "./chat";
import { SectionKey, SectionSnapshots } from "./practice";

export interface CategoryFeedback {
  score: number | null; // null = section not submitted; UI should render "Not completed" rather than a score
  comments: string; // Justification of score, or explanation of why it could not be graded
  compliments: string; // Things done well; empty string if nothing genuine to say
  advice: string; // Suggestions for improvement; empty string if section was not submitted
}

export interface SessionFeedback {
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
