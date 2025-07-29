export type LCProblem = {
  difficulty: "Easy" | "Medium" | "Hard";
  id: string;
  isPaidOnly: boolean;
  title: string;
  titleSlug: string;
  topicTags: LCTag[];
};

export type LCProblemDetails = {
  content: string;
};

export type LCProblemWithDetails = LCProblem & {
  details: LCProblemDetails;
};

export type LCTag = {
  name: string;
  id: string;
  slug: string;
};