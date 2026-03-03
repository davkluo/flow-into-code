import { test as baseTest, expect } from "@playwright/test";
import { test as authTest } from "./fixtures";

// ─── Unauthenticated ────────────────────────────────────────────────────────

baseTest(
  "redirects unauthenticated user from /practice to /signin",
  async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/\/signin/);
  },
);

// ─── Authenticated ──────────────────────────────────────────────────────────

authTest(
  "authenticated user sees the problems table on /practice",
  async ({ signedInPage: page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL("/practice");
    // Problems table renders once data loads from Firestore
    await expect(
      page.getByRole("table").or(page.getByText("No problems found")),
    ).toBeVisible({ timeout: 10_000 });
  },
);

authTest("sign out returns user to sign-in", async ({ signedInPage: page }) => {
  await page.goto("/practice");
  await page.getByTestId("nav-user-avatar").click({ timeout: 10_000 });
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 });
});
