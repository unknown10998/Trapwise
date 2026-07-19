import type { SATQuestion } from "@/types/question";

export type VisualValidationResult = { valid: boolean; errors: string[] };

export function validateQuestionBank(questions: SATQuestion[]) {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const question of questions) {
    if (ids.has(question.id)) errors.push(`${question.id}: duplicate question id.`);
    ids.add(question.id);
    if (question.answerChoices.length !== 4) errors.push(`${question.id}: must have exactly four answer choices.`);
    if (new Set(question.answerChoices.map((choice) => choice.id)).size !== question.answerChoices.length) errors.push(`${question.id}: answer choice ids must be unique.`);
    if (new Set(question.answerChoices.map((choice) => choice.text.trim())).size !== question.answerChoices.length) errors.push(`${question.id}: answer choice text must be unique.`);
    if (!question.answerChoices.some((choice) => choice.id === question.correctAnswer)) errors.push(`${question.id}: correct answer must match a choice.`);
    for (const choice of question.answerChoices) {
      if (choice.id !== question.correctAnswer && (!question.distractorAnalysis[choice.id]?.trim() || !question.mistakeCategoryByChoice[choice.id])) errors.push(`${question.id}: wrong choice ${choice.id} needs an explanation and mistake category.`);
    }
    if (question.visual && question.status !== "approved") errors.push(`${question.id}: student-facing visuals must be approved.`);
    errors.push(...validateQuestionVisual(question).errors.map((error) => `${question.id}: ${error}`));
  }
  return errors;
}

export function validateQuestionVisual(question: SATQuestion): VisualValidationResult {
  const visual = question.visual;
  if (!visual) return { valid: true, errors: [] };
  const errors: string[] = [];
  if (!visual.alt.trim() || !visual.caption.trim()) errors.push("Visuals need non-empty alt text and a caption.");
  if (visual.kind === "image") { if (!visual.src.startsWith("/question-images/")) errors.push("Local image paths must begin with /question-images/."); if (visual.overlays?.some((overlay) => overlay.xPercent < 0 || overlay.xPercent > 100 || overlay.yPercent < 0 || overlay.yPercent > 100)) errors.push("Overlay positions must be between 0 and 100."); }
  if (visual.kind === "table" && (visual.columns.length === 0 || visual.rows.some((row) => row.length !== visual.columns.length))) errors.push("Every table row must match its column count.");
  if (visual.kind === "graph-data") { if (visual.xDomain[0] >= visual.xDomain[1] || visual.yDomain[0] >= visual.yDomain[1]) errors.push("Graph domains must increase."); if (visual.series.some((series) => series.points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y)))) errors.push("Graph points must be finite."); }
  return { valid: errors.length === 0, errors };
}
