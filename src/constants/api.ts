export const LC_PROBLEMS_API_PATH = "/api/problems";
export const PROBLEM_INDEX_META_API_PATH = "/api/meta/problem-index";

type ProblemDataRoute = "preview" | "practice" | "review";

export const getProblemDataApiPath = (
  slug: string,
  route: ProblemDataRoute,
) => {
  return `/api/problems/${slug}/${route}`;
};
