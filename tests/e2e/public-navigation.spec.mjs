import { expect, test } from "@playwright/test";

const routes = ["/", "/diagnostic", "/results", "/daily", "/trap-forge", "/progress", "/achievements", "/leaderboard", "/profile", "/login", "/sign-up", "/settings"];
const expectedAbort = (request) => request.failure()?.errorText === "net::ERR_ABORTED" && (request.url().includes("?_rsc=") || request.url().includes("&_rsc=") || request.url().includes("/_next/static/") || request.url().includes("/__nextjs_font/"));

test("every release route loads directly and survives refresh/back/forward", async ({ page }) => {
  const failures = [];
  const consoleErrors = [];
  page.on("requestfailed", (request) => { if (!expectedAbort(request)) failures.push(`${request.url()} ${request.failure()?.errorText ?? "failed"}`); });
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status() ?? 0, `${route} should return a response`).toBeLessThan(500);
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Invalid supabaseUrl");
    await page.reload({ waitUntil: "domcontentloaded" });
  }

  await page.goto("/");
  await page.goto("/progress");
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/progress$/);
  expect(consoleErrors).toEqual([]);
  expect(failures).toEqual([]);
});
