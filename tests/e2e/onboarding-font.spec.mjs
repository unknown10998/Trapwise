import { expect, test } from "@playwright/test";

test("guest visitors do not see the account guided tour and the site uses the clean font stack", async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem("guest-session-v1"));
  await page.goto("/");
  await expect(page.getByRole("region", { name: "Getting started" })).toHaveCount(0);
  await expect.poll(() => page.locator("body").evaluate((element) => getComputedStyle(element).fontFamily)).toContain("Avenir Next");
});
