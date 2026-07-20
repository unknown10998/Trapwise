import { expect, test } from "@playwright/test";

const viewports = [[320, 568], [375, 667], [390, 844], [430, 932], [768, 1024]];
const routes = ["/", "/diagnostic", "/results", "/daily", "/trap-forge", "/progress", "/achievements", "/leaderboard", "/profile", "/login", "/sign-up", "/settings"];

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

test("mobile navigation traps focus, closes predictably, and reaches each local route", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => localStorage.setItem("guest-session-v1", "active"));
  await page.goto("/diagnostic");
  const menuButton = page.getByRole("button", { name: "Open navigation menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  const drawer = page.getByRole("dialog", { name: "Navigation menu" });
  await expect(drawer).toBeVisible();
  await expect(page.getByRole("button", { name: "Close navigation menu" }).last()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Exit Guest Mode" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(menuButton).toBeFocused();

  await page.getByRole("banner").getByRole("link", { name: "Trapwise home" }).click();
  await page.waitForURL("**/");
  for (const [label, route] of [["Diagnostic", "/diagnostic"], ["Daily Practice", "/daily"], ["Trap Forge", "/trap-forge"], ["Progress", "/progress"], ["Achievements", "/achievements"], ["Leaderboard", "/leaderboard"], ["Profile", "/profile"]]) {
    await menuButton.click();
    await drawer.getByRole("link", { name: label }).click();
    await page.waitForURL(`**${route}`);
    await expect(drawer).toBeHidden();
    await menuButton.click();
    await expect(drawer.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    await page.keyboard.press("Escape");
  }
  const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewportWidth: window.innerWidth }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.viewportWidth);
});
