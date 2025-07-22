export type Problem = {
  difficulty: "Easy" | "Medium" | "Hard";
  id: string;
  isPaidOnly: boolean;
  title: string;
  titleSlug: string;
  topicTags: {
    name: string;
    id: string;
    slug: string;
  }[];
};
