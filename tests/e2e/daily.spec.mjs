import { expect, test } from "@playwright/test";

test("Daily Practice recovers from invalid local storage with a bounded local session", async ({ page }, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("trapwise:daily-session-v1", "{invalid"));
  await page.goto("/daily");
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
  await expect(page.getByText("Preparing today’s practice…")).toBeHidden();
  const progress = page.getByRole("progressbar", { name: "Daily practice progress" });
  await expect(progress).toHaveCount(1);
  await expect(progress).toHaveAttribute("aria-valuetext", /1 of [3-5] questions/);
  await page.screenshot({ path: testInfo.outputPath("daily-local-fallback.png"), fullPage: true });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
});

test("Daily Practice saves written reasoning as Mistake Twin evidence", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("guest-session-v1", "active"));
  await page.goto("/daily");
  await expect(page.getByRole("heading", { name: "Daily Practice" })).toBeVisible();
  await page.getByLabel("Your reasoning for this question").fill("I compared the two values first, then checked the exact quantity the question asked for.");
  await page.getByTestId(/answer-[ABCD]/).first().click();
  await page.getByRole("button", { name: "Check Answer" }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("trapwise:data:guest:daily-session-v1") ?? "{}").answers?.[0]?.reasoning)).toBe("I compared the two values first, then checked the exact quantity the question asked for.");
});
