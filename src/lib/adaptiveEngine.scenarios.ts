import { fixedDiagnosticQuestions, sampleQuestions } from "@/data/sampleQuestions";
import { estimateMastery, getAdaptiveDecision, getMistakeCounts, getSkillPerformance, selectAdaptiveQuestion } from "@/lib/adaptiveEngine";
import type { AnswerRecord, SATQuestion } from "@/types/question";

type ScenarioName =
  | "all_correct"
  | "all_incorrect"
  | "alternating"
  | "calculation_errors"
  | "tempting_distractors"
  | "improves_after_mistakes"
  | "easy_correct_hard_wrong"
  | "maximum_fifteen"
  | "early_stop"
  | "no_matching_question";

function record(question: SATQuestion, order: number, correct: boolean, forcedMistake?: AnswerRecord["mistakeCategory"]): AnswerRecord {
  const selectedChoice = correct ? question.correctAnswer : question.answerChoices.find((choice) => choice.id !== question.correctAnswer)?.id ?? "A";
  const history: AnswerRecord[] = [];
  return {
    questionId: question.id, selectedChoice, correctChoice: question.correctAnswer, isCorrect: correct,
    mistakeCategory: correct ? null : forcedMistake ?? question.mistakeCategoryByChoice[selectedChoice] ?? "unknown",
    difficultyLevel: question.difficultyLevel, primarySkill: question.primarySkill, confidence: correct ? "certain" : "unsure",
    responseOrder: order, wasAdaptive: order > 5, masteryBefore: estimateMastery(history), masteryAfter: estimateMastery(history),
  };
}

function createHistory(pattern: (index: number) => boolean, count: number, mistake?: AnswerRecord["mistakeCategory"]) {
  return Array.from({ length: count }, (_, index) => record(sampleQuestions[index], index + 1, pattern(index), mistake));
}

/**
 * Deterministic scenarios for manual or future runner use. They verify the core
 * safety rules without needing a testing dependency in this prototype.
 */
export function runAdaptiveEngineScenarios(): Record<ScenarioName, string> {
  const results = {} as Record<ScenarioName, string>;
  const allCorrect = createHistory(() => true, 8);
  const allIncorrect = createHistory(() => false, 10);
  const alternating = createHistory((index) => index % 2 === 0, 10);
  const calculationErrors = createHistory(() => false, 10, "calculation_error");
  const temptingDistractors = createHistory(() => false, 10, "tempting_distractor");
  const improving = createHistory((index) => index >= 4, 10);
  const easyThenHard = sampleQuestions.slice(0, 10).map((question, index) => record(question, index + 1, question.difficultyLevel <= 2));
  const maximum = createHistory((index) => index % 2 === 0, 15);
  const earlyStop = createHistory(() => true, 8);

  const cases: [ScenarioName, AnswerRecord[], boolean][] = [
    ["all_correct", allCorrect, true], ["all_incorrect", allIncorrect, false], ["alternating", alternating, false],
    ["calculation_errors", calculationErrors, false], ["tempting_distractors", temptingDistractors, false],
    ["improves_after_mistakes", improving, false], ["easy_correct_hard_wrong", easyThenHard, false], ["maximum_fifteen", maximum, false], ["early_stop", earlyStop, true],
  ];
  for (const [name, history, shouldEnd] of cases) {
    const decision = selectAdaptiveQuestion(sampleQuestions, history);
    if (history.length < 8 && decision.kind === "end") throw new Error(`${name} ended before eight questions.`);
    if (shouldEnd && decision.kind !== "end") throw new Error(`${name} should have reached an end condition.`);
    if (decision.kind === "next" && history.some((item) => item.questionId === decision.question.id)) throw new Error(`${name} repeated a question.`);
    results[name] = decision.kind;
  }
  const noMatch = getAdaptiveDecision({ allQuestions: fixedDiagnosticQuestions, questionsAlreadyAnswered: fixedDiagnosticQuestions.map((question) => question.id), answerHistory: allCorrect.slice(0, 5), currentMastery: 90, mistakeCategoryCounts: getMistakeCounts(allCorrect), skillPerformanceCounts: getSkillPerformance(allCorrect) });
  if (noMatch.kind !== "end") throw new Error("no_matching_question did not end safely.");
  results.no_matching_question = noMatch.kind;
  return results;
}
