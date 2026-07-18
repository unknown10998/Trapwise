import type { SATQuestion } from "@/types/question";

export type VisualValidationResult = { valid: boolean; errors: string[] };

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
