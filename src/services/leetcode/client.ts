import { LCProblem } from "@/types/leetcode";

const ENDPOINT = "https://leetcode.com/graphql";
const PAGE_SIZE = 100;

const PROBLEM_LIST_QUERY = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        difficulty
        id: questionFrontendId
        isPaidOnly
        title
        titleSlug
        topicTags {
          name
          id
          slug
        }
      }
    }
  }
`;

const PROBLEM_DETAIL_QUERY = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      content
    }
  }
`;

/**
 * Fetch a single page of LeetCode problems.
 * Returns total count of all problems and the current page of problems.
 */
async function fetchPage(skip: number): Promise<{
  total: number;
  questions: LCProblem[];
}> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PROBLEM_LIST_QUERY,
      variables: {
        categorySlug: "",
        skip,
        limit: PAGE_SIZE,
        filters: {},
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode GraphQL failed: ${res.status}`);
  }

  const json = await res.json();
  const problemList = json?.data?.problemsetQuestionList;

  if (!problemList || !Array.isArray(problemList.questions)) {
    throw new Error("Unexpected LeetCode response shape");
  }

  return {
    total: problemList.total,
    questions: problemList.questions,
  };
}

/**
 * Fetch the complete LeetCode problem list.
 * Call this only from server-side ingestion/services.
 */
export async function fetchLCProblems(): Promise<LCProblem[]> {
  const allProblems: LCProblem[] = [];

  const first = await fetchPage(0);
  allProblems.push(...first.questions);

  let skip = first.questions.length;
  const total = first.total;

  while (skip < total) {
    const page = await fetchPage(skip);
    allProblems.push(...page.questions);
    skip += page.questions.length;
  }

  return allProblems;
}

/**
 * Fetch raw LeetCode problem description (HTML/markdown).
 */
export async function fetchLCProblemContent(slug: string): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: PROBLEM_DETAIL_QUERY,
      variables: { titleSlug: slug },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode detail fetch failed: ${res.status}`);
  }

  const json = await res.json();
  const content = json?.data?.question?.content;

  if (typeof content !== "string") {
    throw new Error("LeetCode returned invalid problem content");
  }

  return content;
}
