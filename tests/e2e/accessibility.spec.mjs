import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/diagnostic", "/results", "/trap-forge", "/progress", "/achievements", "/leaderboard", "/login", "/sign-up", "/settings"];

for (const route of routes) {
  test(`axe scan ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("keyboard can reveal the skip link and open settings from the gear link", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("guest-session-v1", "active"));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.getByRole("link", { name: "Open settings" }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole("heading", { name: "Study atmosphere" })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Celebration volume" })).toBeVisible();
});
