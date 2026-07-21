import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the four themes persist and settings remain usable in the dark theme", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("guest-session-v1", "active"));
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Account and privacy" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Study atmosphere" })).toBeVisible();
  await page.getByRole("button", { name: /Midnight Circuit/ }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await expect(page.locator("html")).not.toHaveClass(/theme-transitioning/);
  await expect.poll(() => page.evaluate(() => ({ body: getComputedStyle(document.body).backgroundColor, canvas: getComputedStyle(document.querySelector(".theme-page-canvas")).backgroundColor }))).toEqual({ body: "rgb(13, 23, 38)", canvas: "rgb(13, 23, 38)" });
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "midnight");
  await page.getByRole("slider", { name: "Celebration volume" }).fill("0");
  await expect(page.getByText("0%", { exact: true })).toBeVisible();
  for (const name of ["Signal Garden", "Midnight Circuit", "Paper Pop", "Tilt Lab"]) {
    await page.getByRole("button", { name: new RegExp(name) }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", name === "Signal Garden" ? "signal" : name === "Midnight Circuit" ? "midnight" : name === "Paper Pop" ? "paper" : "tilt");
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
  await context.addInitScript(() => window.localStorage.setItem("guest-session-v1", "active"));
  const secondTab = await context.newPage();
  await page.goto("/settings");
  await secondTab.goto("/settings");
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

test("guest views ignore a separate signed-in account data namespace", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guest-session-v1", "active");
    localStorage.setItem("trapwise:data:user:account-a:progress-history-v1", JSON.stringify({
      version: 1,
      sessions: [{ sessionId: "account-only", sessionType: "daily", date: "2026-07-20", questionsAnswered: 99, correctAnswers: 99, accuracy: 100, masteryBefore: 90, masteryAfter: 99, masteryChange: 9, strongestSkill: "Account-only skill", weakestSkill: "Account-only skill", dominantMistake: "none", difficultyPerformance: {}, confidencePerformance: {}, correctedMistakes: 99, questionIds: [] }],
    }));
  });
  await page.goto("/progress");
  await expect(page.getByRole("heading", { name: "Your progress story starts with one practice set." })).toBeVisible();
  await expect(page.getByText("Account-only skill")).toHaveCount(0);
});

test("guest account reset clears guest data without touching account data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guest-session-v1", "active");
    localStorage.setItem("trapwise:data:guest:progress-history-v1", JSON.stringify({ version: 1, sessions: [] }));
    localStorage.setItem("trapwise:data:user:account-a:progress-history-v1", JSON.stringify({ version: 1, sessions: [] }));
    localStorage.setItem("trapwise:theme", "midnight");
  });
  page.once("dialog", (dialog) => void dialog.accept());
  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset guest account" }).click();
  await expect.poll(() => page.evaluate(() => ({ guest: localStorage.getItem("guest-session-v1"), guestData: localStorage.getItem("trapwise:data:guest:progress-history-v1"), accountData: localStorage.getItem("trapwise:data:user:account-a:progress-history-v1"), theme: localStorage.getItem("trapwise:theme") }))).toEqual({ guest: null, guestData: null, accountData: JSON.stringify({ version: 1, sessions: [] }), theme: "midnight" });
});
