import type { MistakeCategory } from "@/types/mistake";

export type LocalTrapEvaluation = {
  isValidTrap: boolean;
  plausibilityScore: number;
  temptationScore: number;
  categoryMatchScore: number;
  explanationQualityScore: number;
  originalityScore: number;
  overallTrapScore: number;
  feedback: string;
  howToImprove: string;
  source: "local";
};

type LocalTrapInput = {
  trap: string;
  correctAnswer: string;
  existingChoices: string[];
  explanation: string;
  category: MistakeCategory;
  expectedTrap?: string;
  requiredReasoningTerms?: string[];
};

function normalize(value: string) {
  const trimmed = value.trim().replaceAll("−", "-");
  if (!trimmed) return "";
  const numericValue = Number(trimmed);
  return Number.isFinite(numericValue) ? String(numericValue) : trimmed.toLowerCase().replaceAll(/\s+/g, " ");
}

export function evaluateLocalTrap(input: LocalTrapInput): LocalTrapEvaluation {
  const trap = normalize(input.trap);
  const explanation = normalize(input.explanation);
  const isDistinct = Boolean(trap) && trap !== normalize(input.correctAnswer) && !input.existingChoices.some((choice) => trap === normalize(choice));
  const matchesExpectedTrap = !input.expectedTrap || trap === normalize(input.expectedTrap);
  const hasSpecificReasoning = (input.requiredReasoningTerms ?? []).every((term) => explanation.includes(normalize(term)));
  const hasUsefulExplanation = explanation.length >= 24 && hasSpecificReasoning;

  const plausibilityScore = !isDistinct ? 10 : matchesExpectedTrap ? 100 : 60;
  const temptationScore = !isDistinct ? 10 : matchesExpectedTrap && hasSpecificReasoning ? 95 : hasSpecificReasoning ? 70 : 30;
  const categoryMatchScore = input.category === "unknown" ? 25 : hasSpecificReasoning ? 100 : 45;
  const explanationQualityScore = Math.min(100, Math.round(explanation.length * 3.2) + (hasSpecificReasoning ? 15 : 0));
  const originalityScore = isDistinct ? 85 : 0;
  const overallTrapScore = Math.round((plausibilityScore + temptationScore + categoryMatchScore + explanationQualityScore + originalityScore) / 5);
  const isValidTrap = isDistinct && matchesExpectedTrap && hasUsefulExplanation && input.category !== "unknown";

  let feedback = "This needs one more revision before it becomes a valid distractor.";
  let howToImprove = "Write the exact incorrect step a student would take, then recheck it against the prompt.";

  if (!trap) {
    feedback = "Add a proposed answer choice before checking your distractor.";
    howToImprove = "Use the intermediate value a student might mistakenly submit as the final answer.";
  } else if (!isDistinct) {
    feedback = "A distractor must be different from the correct answer and the choices already shown.";
    howToImprove = "Choose a new wrong value that could come from a believable intermediate step.";
  } else if (!matchesExpectedTrap) {
    feedback = "That value is wrong, but it does not come from the specific mistake in this scenario.";
    howToImprove = "The student stopped at x = 2 even though the prompt asks for y.";
  } else if (!hasUsefulExplanation) {
    feedback = "Your value matches the intended trap, but the explanation needs the faulty step.";
    howToImprove = "Explain that the student used x = 2 as a final answer instead of substituting it to find y.";
  } else {
    feedback = "This is a distinct, plausible distractor tied to the requested-value mistake.";
    howToImprove = "You identified both the tempting value and the reasoning error that creates it.";
  }

  return {
    isValidTrap,
    plausibilityScore,
    temptationScore,
    categoryMatchScore,
    explanationQualityScore,
    originalityScore,
    overallTrapScore,
    feedback,
    howToImprove,
    source: "local",
  };
}
