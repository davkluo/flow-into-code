export const lcProblemListQuery = `
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

export const lcProblemDetailQuery = `
  query getQuestionDetail($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      content
    }
  }
`;