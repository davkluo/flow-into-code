import { expect } from "@playwright/test";
import { test as authTest } from "./fixtures";

authTest(
  "history renders mocked sessions and navigates to feedback on row click",
  async ({ signedInPage: page, mockSessionDocs }) => {
    const docs = mockSessionDocs();
    const session = docs[0];

    await page.goto("/history");

    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByText("1 session")).toBeVisible();
    await expect(page.getByRole("cell", { name: /Two Sum/ })).toBeVisible();
    await expect(page.getByText(session.session.feedback.summary)).toBeVisible();

    await page.getByRole("row", { name: /Two Sum/ }).click();
    await expect(page).toHaveURL(`/feedback/${session.session.id}`);
    await expect(page.getByText("Session Summary")).toBeVisible();
    await expect(page.getByText(session.session.feedback.summary)).toBeVisible();
  },
);

authTest(
  "history shows empty state when mocked sessions are empty",
  async ({ signedInPage: page, mockSessionDocs }) => {
    mockSessionDocs([]);

    await page.goto("/history");

    await expect(page.getByText("No sessions yet.")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Start practicing" }),
    ).toBeVisible();
  },
);

