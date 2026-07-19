import { expect, test } from "@playwright/test";

const answers = ["C", "A", "B", "A", "C"];

test("Judge Demo completes deterministically without duplicate reward after refresh", async ({ page }, testInfo) => {
  const consoleErrors = [];
  const networkFailures = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("requestfailed", (request) => networkFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? "failed"}`));

  await page.goto("/");
  await expect(page.getByTestId("start-judge-demo")).toBeVisible();
  await page.getByTestId("start-judge-demo").click();
  await expect(page.getByRole("status")).toContainText("Fictional demo profile loaded");
  await page.waitForURL("**/diagnostic?judgeDemo=1");
  await expect(page.getByText("Judge Demo:")).toBeVisible();

  for (const choice of answers) {
    await page.getByTestId(`answer-${choice}`).click();
    await page.getByTestId("submit-diagnostic-answer").click();
  }

  await page.waitForURL("**/results");
  await expect(page.getByText("Mistake Twin revealed")).toBeVisible();
  await expect(page.getByText("solved wrong value", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mistake-twin-reveal.png"), fullPage: true });

  await page.getByRole("link", { name: "Practice the targeted follow-up" }).click();
  await page.getByTestId("answer-C").click();
  await page.getByRole("button", { name: "Check follow-up" }).click();
  await expect(page.getByText("Pattern weakened by", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("pattern-weakened.png"), fullPage: true });

  await page.getByRole("link", { name: "Continue to Trap Forge" }).click();
  await page.getByRole("radio", { name: "Solved for x instead of the requested y-value" }).check();
  await page.getByRole("button", { name: "Evaluate trap" }).click();
  await expect(page.getByText("Trap recognition improved", { exact: false })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("trap-forge-evaluation.png"), fullPage: true });

  await page.reload();
  await expect(page.getByText("Trap recognition improved", { exact: false })).toBeVisible();
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
  await page.getByTestId("start-judge-demo").click();
  await page.waitForURL("**/diagnostic?judgeDemo=1");

  expect(consoleErrors).toEqual([]);
  expect(networkFailures).toEqual([]);
});
