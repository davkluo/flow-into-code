import { expect } from "@playwright/test";
import { test as authTest } from "./fixtures";

authTest(
  "feedback page renders mocked session details",
  async ({ signedInPage: page, mockSessionDocs }) => {
    const docs = mockSessionDocs();
    const session = docs[0];

    await page.goto(`/feedback/${session.session.id}`);

    await expect(page.getByRole("link", { name: /Two Sum/ })).toBeVisible();
    await expect(page.getByText("Session Summary")).toBeVisible();
    await expect(page.getByText(session.session.feedback.summary)).toBeVisible();
    await expect(page.locator("#section-problem_understanding")).toBeVisible();
    await expect(page.locator("#section-approach_and_reasoning")).toBeVisible();
    await expect(page.locator("#section-algorithm_design")).toBeVisible();
    await expect(page.locator("#section-implementation")).toBeVisible();
    await expect(page.locator("#section-complexity_analysis")).toBeVisible();
    await expect(page.locator("#section-communication")).toBeVisible();
    await expect(page.getByText("Solution 1: Hash map")).toBeVisible();

    const understandingCard = page.locator("#section-problem_understanding");
    await understandingCard.getByRole("button", { name: /Understanding/ }).click();
    await understandingCard.getByRole("tab", { name: "Your Inputs" }).click();
    await expect(
      understandingCard.getByText("Problem Restatement"),
    ).toBeVisible();
    await expect(
      understandingCard.getByText("Find two indices whose values sum to target."),
    ).toBeVisible();

    const communicationCard = page.locator("#section-communication");
    await communicationCard
      .getByRole("button", { name: /Interviewer Communication/ })
      .click();
    await communicationCard
      .getByRole("tab", { name: "Approach & Reasoning" })
      .click();
    await expect(
      communicationCard.getByText("Can I use a hash map?"),
    ).toBeVisible();
    await expect(
      communicationCard.getByText(
        "Yes, explain the time-space tradeoff clearly.",
      ),
    ).toBeVisible();
  },
);
