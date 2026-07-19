import { expect, test } from "@playwright/test";

const viewports = [[320, 568], [375, 667], [390, 844], [430, 932], [768, 1024]];
const routes = ["/", "/diagnostic", "/results", "/daily", "/trap-forge", "/progress", "/achievements", "/leaderboard", "/login", "/sign-up", "/settings"];

for (const [width, height] of viewports) {
  test(`mobile layout ${width}x${height}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator("main")).toBeVisible();
      const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
      expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
      await page.screenshot({ path: testInfo.outputPath(`${width}x${height}-${route === "/" ? "home" : route.slice(1)}.png`), fullPage: true });
    }
  });
}

test("diagnostic answers retain usable touch targets and separate choices", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/diagnostic");
  const choices = page.getByTestId(/answer-[ABCD]/);
  await expect(choices).toHaveCount(4);
  const dimensions = await choices.evaluateAll((elements) => elements.map((element) => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height }; }));
  for (const choice of dimensions) {
    expect(choice.width).toBeGreaterThan(200);
    expect(choice.height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByTestId("submit-diagnostic-answer")).toBeVisible();
});
