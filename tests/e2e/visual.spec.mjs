import { expect, test } from "@playwright/test";

for (const width of [320, 375, 430, 768]) {
  test(`the diagnostic visual question has a readable scale at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/diagnostic");
    for (let step = 0; step < 2; step += 1) {
      await page.getByTestId("answer-A").click();
      await page.getByTestId("submit-diagnostic-answer").click();
    }
    await expect(page.getByText("Scale:", { exact: false })).toBeVisible();
    await expect(page.locator("svg[role='img']")).toBeVisible();
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.width).toBeLessThanOrEqual(dimensions.viewport + 1);
  });
}
