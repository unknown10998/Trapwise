import { expect, test } from "@playwright/test";

test("route loading glint clears after navigation and is skipped with reduced motion", async ({ page }) => {
  await page.goto("/");
  await page.locator("header").getByRole("link", { name: "Diagnostic" }).click();
  await expect(page.getByRole("heading", { name: "Adaptive Diagnostic" })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toBeHidden();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("header").getByRole("link", { name: "Daily Practice" }).click();
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
});
