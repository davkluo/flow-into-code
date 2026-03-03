import { expect, Page } from "@playwright/test";
import { test as authTest } from "./fixtures";

// Chat API returns SSE: `data: {"delta":"..."}\n\n` … `data: [DONE]\n\n`
// Intercept every chat request to avoid real LLM calls during tests.
const CHAT_MOCK_BODY =
  'data: {"delta":"Looks good, keep going."}\n\ndata: [DONE]\n\n';

const breadcrumb = (page: Page) =>
  page.getByRole("navigation", { name: "breadcrumb" });

authTest(
  "user can navigate through all 5 sections of a Two Sum session",
  async ({ signedInPage: page }) => {
    await page.route("**/api/chat", (route) =>
      route.fulfill({
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: CHAT_MOCK_BODY,
      }),
    );

    await page.goto("/practice");

    // ─── Problem selection ────────────────────────────────────────────────────

    // Two Sum (#1) is guaranteed to have pre-generated preview + practice data.
    // Test search, select the problem, then click through the preview → session entry flow.
    await page.getByPlaceholder("Search problems...").fill("Two Sum");
    await expect(
      page.getByRole("button", { name: /^1\. Two Sum$/ }),
    ).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /^1\. Two Sum$/ }).click();

    // Preview data loads → "Begin Practice" becomes visible
    await expect(
      page.getByRole("button", { name: "Begin Practice" }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Begin Practice" }).click();

    // ─── Session active ───────────────────────────────────────────────────────

    // Practice data loads → breadcrumb appears
    await expect(breadcrumb(page)).toBeVisible({ timeout: 15_000 });

    // ─── Section 1: Problem Understanding ────────────────────────────────────

    await expect(breadcrumb(page).getByText("1. Understanding")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Next: Approach/ }),
    ).toBeVisible();

    await expect(
      breadcrumb(page).getByRole("button", { name: "Two Sum" }),
    ).toBeVisible();
    await breadcrumb(page).getByRole("button", { name: "Two Sum" }).click();

    await expect(
      page.getByRole("menuitem", { name: "View reference" }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "End session" }),
    ).toBeVisible();

    // Problem reference sheet
    await page.getByRole("menuitem", { name: "View reference" }).click();
    await expect(
      page.getByRole("heading", { name: "Description" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hints" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Common Pitfalls" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sample Test Cases" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sample Edge Cases" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");

    // AI interviewer chat (mocked SSE response)
    const understandingChat = page.getByTestId("understanding-chat-box");
    const chatPrompt = "Can I assume there is exactly one valid answer?";
    await page.getByTestId("understanding-chat-input").fill(chatPrompt);
    await page.getByTestId("understanding-chat-send").click();
    await expect(understandingChat).toContainText(chatPrompt);
    await expect(understandingChat).toContainText("Looks good, keep going.");

    // Fill out understanding fields
    const restatement = "Restatement";
    const inputsOutputs =
      "Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]";
    const constraints =
      "1 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.";
    const edgeCases =
      "What if the input array is empty?\nWhat if there are negative numbers?";

    await page.getByTestId("understanding-restatement-field").fill(restatement);
    await page
      .getByTestId("understanding-inputsOutputs-field")
      .fill(inputsOutputs);
    await page.getByTestId("understanding-constraints-field").fill(constraints);
    await page.getByTestId("understanding-edgeCases-field").fill(edgeCases);

    await page.getByRole("button", { name: /^Next: Approach/ }).click();

    // ─── Section 2: Approach & Reasoning ─────────────────────────────────────

    await expect(
      breadcrumb(page).getByText("2. Approach & Reasoning"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^← Back: Understanding/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Next: Algorithm/ }),
    ).toBeVisible();

    // Section 1 is now a breadcrumb dropdown — open its summary sheet
    await breadcrumb(page)
      .getByRole("button", { name: /1\. Understanding/ })
      .click();
    await page.getByRole("menuitem", { name: "View summary" }).click();

    const understandingSummarySheet = page
      .getByRole("dialog")
      .filter({ has: page.getByRole("heading", { name: "Understanding" }) });

    await expect(
      understandingSummarySheet.getByRole("heading", { name: "Understanding" }),
    ).toBeVisible();
    await expect(
      understandingSummarySheet.getByText("Problem Restatement", { exact: true }),
    ).toBeVisible();
    await expect(understandingSummarySheet).toContainText(restatement);
    await expect(
      understandingSummarySheet.getByText("Inputs & Outputs", { exact: true }),
    ).toBeVisible();
    await expect(understandingSummarySheet).toContainText(inputsOutputs);
    await expect(
      understandingSummarySheet.getByText("Constraints", { exact: true }),
    ).toBeVisible();
    await expect(understandingSummarySheet).toContainText(constraints);
    await expect(
      understandingSummarySheet.getByText("Edge Cases", { exact: true }),
    ).toBeVisible();
    await expect(understandingSummarySheet).toContainText(edgeCases);

    await page.keyboard.press("Escape");

    // Fill out approach & reasoning fields
    await page.getByTestId("approach-approach-field").fill("Approach");
    await page.getByTestId("approach-reasoning-field").fill("Reasoning");

    await page.getByRole("button", { name: /^Next: Algorithm/ }).click();

    // ─── Section 3: Algorithm Design ─────────────────────────────────────────

    await expect(
      breadcrumb(page).getByText("3. Algorithm Design"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Next: Implementation/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^← Back: Approach/ }),
    ).toBeVisible();

    // Fill out algorithm design fields
    // NOTE: Pseudocode is a CodeMirror editor; click and type directly
    await page.getByTestId("pseudocode-editor").click();
    await page.keyboard.type("Pseudocode");

    await page.getByRole("button", { name: /^Next: Implementation/ }).click();

    // ─── Section 4: Implementation ────────────────────────────────────────────

    await expect(breadcrumb(page).getByText("4. Implementation")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^← Back: Algorithm/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Next: Complexity/ }),
    ).toBeVisible();

    // Fill out implementation fields
    await page.getByTestId("code-editor").click();
    await page.keyboard.type("Code");

    await page.getByRole("button", { name: /^Next: Complexity/ }).click();

    // ─── Section 5: Complexity Analysis ──────────────────────────────────────

    await expect(
      breadcrumb(page).getByText("5. Complexity Analysis"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^← Back: Implementation/ }),
    ).toBeVisible();

    // "Finish: Get Feedback →" replaces Next on the last section.
    await expect(
      page.getByRole("button", { name: /Finish: Get Feedback/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /^Finish: Get Feedback/ }),
    ).toBeEnabled();

    // Fill out complexity analysis fields
    await page
      .getByTestId("complexity-timeComplexity-field")
      .fill("Time Complexity");
    await page
      .getByTestId("complexity-spaceComplexity-field")
      .fill("Space Complexity");
  },
);
