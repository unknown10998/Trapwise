import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the four themes persist and settings remain usable in the dark theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Choose a Trapwise theme" }).click();
  await expect(page.getByRole("dialog", { name: "Theme settings" })).toBeVisible();
  await page.getByRole("button", { name: /Midnight Circuit/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await expect(page.locator("html")).not.toHaveClass(/theme-transitioning/);
  await expect.poll(() => page.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, canvas: getComputedStyle(document.querySelector(".theme-page-canvas")).backgroundColor }))).toEqual({ body: "rgb(13, 23, 38)", canvas: "rgb(13, 23, 38)" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await page.getByRole("button", { name: "Choose a Trapwise theme" }).click();
  const dialog = page.getByRole("dialog", { name: "Theme settings" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("slider", { name: "Celebration volume" }).fill("0");
  await expect(dialog.getByText("0%", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Choose a Trapwise theme" })).toBeFocused();
  await page.getByRole("button", { name: "Choose a Trapwise theme" }).click();
  for (const name of ["Signal Garden", "Midnight Circuit", "Paper Pop", "Tilt Lab"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", name === "Signal Garden" ? "signal" : name === "Midnight Circuit" ? "midnight" : name === "Paper Pop" ? "paper" : "tilt");
    if (name !== "Tilt Lab") await page.getByRole("button", { name: "Choose a Trapwise theme" }).click();
  }
  await expect(page.locator("html")).not.toHaveClass(/theme-transitioning/);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("offline mode gives a clear local fallback without blocking the loaded practice route", async ({ page, context }) => {
  await page.goto("/diagnostic");
  await context.setOffline(true);
  await expect(page.getByRole("status")).toContainText("Working locally");
  await expect(page.getByRole("heading", { name: "Adaptive Diagnostic", exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Invalid supabaseUrl");
  await context.setOffline(false);
  await expect(page.getByRole("status")).toHaveCount(0);
});

test("a completed diagnostic returns to results instead of starting question one again", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("trapwise:adaptive-diagnostic", JSON.stringify({
      records: [{
        questionId: "systems-nonlinear-001",
        selectedChoice: "B",
        correctChoice: "B",
        isCorrect: true,
        mistakeCategory: null,
        difficultyLevel: 1,
        primarySkill: "Solving linear equations",
        confidence: "certain",
        responseOrder: 1,
        wasAdaptive: false,
        masteryBefore: 50,
        masteryAfter: 55,
      }],
      stopReason: "maximum_questions",
    }));
  });

  await page.goto("/diagnostic");
  await page.waitForURL("**/results");
  await expect(page.getByRole("heading", { name: "Your systems profile" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Submit Answer" })).toHaveCount(0);
});

test("theme changes propagate to a second tab", async ({ page, context }) => {
  const secondTab = await context.newPage();
  await page.goto("/");
  await secondTab.goto("/");
  await page.getByRole("button", { name: "Choose a Trapwise theme" }).click();
  await page.getByRole("button", { name: /Paper Pop/ }).click();
  await expect(secondTab.locator("html")).toHaveAttribute("data-theme", "paper");
  await secondTab.close();
});

test("progress state propagates across tabs without duplicating a demo session", async ({ page, context }) => {
  const secondTab = await context.newPage();
  await page.goto("/");
  await secondTab.goto("/progress");
  await page.getByTestId("start-judge-demo").click();
  await page.waitForURL("**/diagnostic?judgeDemo=1");
  await page.goto("/");
  await expect(secondTab.getByText("Fictional demo profile:")).toBeVisible();
  await page.getByTestId("reset-demo-data").click();
  await secondTab.reload();
  await expect(secondTab).toHaveURL(/\/progress$/);
  await expect(secondTab.getByText("Fictional demo profile:")).toHaveCount(0);
  await expect(secondTab.getByRole("heading", { name: /Your learning momentum|Your progress story/ })).toBeVisible();
  await secondTab.close();
});
