export const LC_PROBLEMS_API_PATH = "/api/problems";
export const USER_INIT_API_PATH = "/api/users/init";
export const PROBLEM_INDEX_META_API_PATH = "/api/meta/problem-index";
export const CHAT_API_PATH = "/api/chat";
export const EXECUTE_API_PATH = "/api/execute";

type ProblemDataRoute = "preview" | "practice" | "review";

export const getProblemDataApiPath = (
  slug: string,
  route: ProblemDataRoute,
) => {
  return `/api/problems/${slug}/${route}`;
};
