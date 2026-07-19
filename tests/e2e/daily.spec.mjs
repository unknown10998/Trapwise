import { expect, test } from "@playwright/test";

test("Daily Practice recovers from invalid local storage with a bounded local session", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("trapwise:daily-session-v1", "{invalid"));
  await page.goto("/daily");
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
  await expect(page.getByText("Preparing today’s practice…")).toBeHidden();
  const progress = page.getByRole("progressbar");
  await expect(progress).toHaveCount(1);
  const total = Number(await progress.getAttribute("aria-valuemax"));
  expect(total).toBeGreaterThanOrEqual(3);
  expect(total).toBeLessThanOrEqual(5);
  await page.screenshot({ path: testInfo.outputPath("daily-local-fallback.png"), fullPage: true });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
});
