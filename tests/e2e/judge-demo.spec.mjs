import { expect, test } from "@playwright/test";

const answers = ["C", "A", "C", "B", "A"];
const isExpectedNavigationAbort = (request) => request.failure()?.errorText === "net::ERR_ABORTED" && (request.url().includes("?_rsc=") || request.url().includes("&_rsc=") || request.url().includes("/_next/static/"));

test("Judge Demo completes deterministically without duplicate reward after refresh", async ({ page }, testInfo) => {
  const consoleErrors = [];
  const networkFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => { if (!isExpectedNavigationAbort(request)) networkFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`); });

  const normalDiagnostic = JSON.stringify({ records: [{ questionId: "normal-in-progress", selectedChoice: "A", correctChoice: "A", isCorrect: true, mistakeCategory: null, difficultyLevel: 1, primarySkill: "Normal practice", confidence: "certain", responseOrder: 1, wasAdaptive: false, masteryBefore: 50, masteryAfter: 55 }], stopReason: null });
  await page.addInitScript((savedNormalDiagnostic) => {
    localStorage.setItem("trapwise:adaptive-diagnostic", savedNormalDiagnostic);
  }, normalDiagnostic);
  await page.goto("/");
  await expect(page.getByTestId("start-judge-demo")).toBeVisible();
  await page.getByTestId("start-judge-demo").click();
  await expect(page.getByRole("status")).toContainText("Fictional demo profile loaded");
  await page.waitForURL("**/diagnostic?judgeDemo=1");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("guest-session-v1"))).toBe("active");
  await expect(page.getByText("Judge Demo:")).toBeVisible();
  await expect(page.getByText("Judge Demo — Question 1 of 5")).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Judge demo progress" })).toContainText("Step 1 of 5");

  await page.getByTestId(`answer-${answers[0]}`).click();
  await page.getByTestId("submit-diagnostic-answer").click();
  await expect(page.getByText("Judge Demo — Question 2 of 5")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Judge Demo — Question 2 of 5")).toBeVisible();
  await expect.poll(() => page.evaluate(() => ({ demoRecords: JSON.parse(localStorage.getItem("trapwise:data:guest:judge-demo-diagnostic-v1") ?? "{}").records?.length ?? 0, normal: localStorage.getItem("trapwise:adaptive-diagnostic") }))).toEqual({ demoRecords: 1, normal: normalDiagnostic });
  await page.getByRole("button", { name: "Previous Question" }).click();
  await expect(page.getByTestId(`answer-${answers[0]}`)).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("submit-diagnostic-answer").click();

  for (const choice of answers.slice(1)) {
    await page.getByTestId(`answer-${choice}`).click();
    await page.getByTestId("submit-diagnostic-answer").click();
  }

  await page.waitForURL(/\/results\?judgeDemo=1$/);
  await expect(page).toHaveURL(/\/results\?judgeDemo=1$/);
  await expect(page.getByText("Mistake Twin revealed")).toBeVisible();
  await expect(page.getByRole("heading", { name: "solved wrong value", exact: false })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("trapwise:data:guest:judge-demo-diagnostic-v1") ?? "{}").records?.map((record) => record.questionId))).toEqual(["systems-nonlinear-001", "systems-nonlinear-002", "visual-026", "systems-nonlinear-003", "systems-nonlinear-004"]);
  await page.screenshot({ path: testInfo.outputPath("mistake-twin-reveal.png"), fullPage: true });

  await page.getByRole("link", { name: "Try Personalized Follow-Up" }).click();
  await page.getByTestId("answer-C").click();
  await page.getByRole("button", { name: "Check follow-up" }).click();
  await expect(page.getByText("Pattern weakened by", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("pattern-weakened.png"), fullPage: true });

  await page.getByRole("link", { name: "Continue to Trap Forge" }).click();
  await page.locator("#distractor").fill("2");
  await page.locator("#forge-explanation").fill("The student found x = 2 and stopped before finding y.");
  await page.getByRole("button", { name: "Check my distractor" }).click();
  await expect(page.getByText("Distractor forged", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("trap-forge-evaluation.png"), fullPage: true });

  await page.reload();
  await expect(page.getByText("Distractor forged", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "See before-and-after impact" }).click();
  await expect(page.getByText("Pattern weakened", { exact: false })).toBeVisible();
  await page.getByRole("link", { name: "View progress" }).click();
  await expect(page.getByText("Fictional demo profile:")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("progress.png"), fullPage: true });

  await page.goBack();
  await page.goForward();
  await expect(page.getByText("Fictional demo profile:")).toBeVisible();
  await page.goto("/");
  await page.getByTestId("reset-demo-data").click();
  await expect.poll(() => page.evaluate(() => ({ profile: localStorage.getItem("trapwise:data:guest:demo-profile-v1"), demoDiagnostic: localStorage.getItem("trapwise:data:guest:judge-demo-diagnostic-v1"), normal: localStorage.getItem("trapwise:adaptive-diagnostic") }))).toEqual({ profile: null, demoDiagnostic: null, normal: normalDiagnostic });
  await page.getByTestId("start-judge-demo").click();
  await page.waitForURL("**/diagnostic?judgeDemo=1");

  expect(consoleErrors).toEqual([]);
  expect(networkFailures).toEqual([]);
});

test("normal diagnostic remains adaptive and can reach question fifteen", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("guest-session-v1", "active");
    const levels = [1, 3, 2, 4, 3, 5, 1, 4, 2, 5, 3, 4, 1, 5];
    const mistakes = ["calculation_error", "wrong_operation", "misread_question"];
    localStorage.setItem("trapwise:adaptive-diagnostic", JSON.stringify({
      records: Array.from({ length: 14 }, (_, index) => ({
        questionId: `systems-nonlinear-${String(index + 1).padStart(3, "0")}`,
        selectedChoice: "A",
        correctChoice: "A",
        isCorrect: index % 2 === 0,
        mistakeCategory: index % 2 === 0 ? null : mistakes[index % mistakes.length],
        difficultyLevel: levels[index],
        primarySkill: "Adaptive practice",
        confidence: "unsure",
        responseOrder: index + 1,
        wasAdaptive: index >= 5,
        masteryBefore: 50,
        masteryAfter: 50,
      })),
      stopReason: null,
    }));
  });
  await page.goto("/diagnostic");
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("trapwise:adaptive-diagnostic") ?? "{}").records?.length ?? 0)).toBe(14);
  await expect(page.getByText("Question 15 • Adaptive Practice")).toBeVisible();
  await expect(page.getByText(/Question 15 of 5/)).toHaveCount(0);
  await page.getByTestId("answer-A").click();
  await page.getByTestId("submit-diagnostic-answer").click();
  await expect(page).toHaveURL(/\/results$/);
});
