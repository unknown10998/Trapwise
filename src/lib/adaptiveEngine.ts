import type { AnswerRecord, Confidence, DifficultyLevel, SATQuestion } from "@/types/question";
import type { MistakeCategory } from "@/types/mistake";

export type DiagnosticStopReason =
  | "maximum_questions"
  | "strong_mastery"
  | "developing_level_identified"
  | "prerequisite_gap_identified"
  | "no_safe_question_available";

export type AdaptiveDecision =
  | { kind: "next"; question: SATQuestion; targetDifficulty: DifficultyLevel; targetSkill: string; dominantMistake: MistakeCategory | null; reason: string }
  | { kind: "end"; reason: DiagnosticStopReason; explanation: string };

export type AdaptiveEngineInput = {
  allQuestions: SATQuestion[];
  questionsAlreadyAnswered: string[];
  answerHistory: AnswerRecord[];
  currentMastery: number;
  mistakeCategoryCounts: Partial<Record<MistakeCategory, number>>;
  skillPerformanceCounts: Record<string, { correct: number; total: number }>;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getMistakeCounts(records: AnswerRecord[]) {
  return records.reduce<Partial<Record<MistakeCategory, number>>>((counts, record) => {
    if (record.mistakeCategory) counts[record.mistakeCategory] = (counts[record.mistakeCategory] ?? 0) + 1;
    return counts;
  }, {});
}

export function getSkillPerformance(records: AnswerRecord[]) {
  return records.reduce<Record<string, { correct: number; total: number }>>((skills, record) => {
    const current = skills[record.primarySkill] ?? { correct: 0, total: 0 };
    current.total += 1;
    if (record.isCorrect) current.correct += 1;
    skills[record.primarySkill] = current;
    return skills;
  }, {});
}

/**
 * Topic mastery is a local 0–100 estimate, not an SAT score. It starts from
 * weighted correctness, then adds small adjustments for recent improvement and
 * skill coverage while reducing the score for repeated misconceptions.
 */
export function estimateMastery(records: AnswerRecord[]): number {
  if (records.length === 0) return 50;
  const weightedTotal = records.reduce((sum, record) => sum + 0.7 + record.difficultyLevel * 0.12, 0);
  const weightedCorrect = records.reduce((sum, record) => sum + (record.isCorrect ? 0.7 + record.difficultyLevel * 0.12 : 0), 0);
  const correctness = (weightedCorrect / weightedTotal) * 100;
  const recent = records.slice(-5);
  const recentAdjustment = ((recent.filter((record) => record.isCorrect).length / recent.length) - 0.5) * 12;
  const early = records.slice(0, Math.ceil(records.length / 2));
  const late = records.slice(Math.floor(records.length / 2));
  const improvement = records.length >= 4
    ? ((late.filter((record) => record.isCorrect).length / late.length) - (early.filter((record) => record.isCorrect).length / early.length)) * 10
    : 0;
  const coverageBonus = Math.min(Object.keys(getSkillPerformance(records)).length, 4) * 1.5;
  const repeatedMistakePenalty = Object.values(getMistakeCounts(records)).reduce((sum, count) => sum + Math.max(0, (count ?? 0) - 1) * 2, 0);
  return Math.round(clamp(correctness + recentAdjustment + improvement + coverageBonus - repeatedMistakePenalty, 0, 100));
}

function dominantMistake(records: AnswerRecord[]): MistakeCategory | null {
  const entries = Object.entries(getMistakeCounts(records)) as [MistakeCategory, number][];
  return entries.sort(([leftKey, leftCount], [rightKey, rightCount]) => rightCount - leftCount || leftKey.localeCompare(rightKey))[0]?.[0] ?? null;
}

function targetDifficulty(records: AnswerRecord[]): DifficultyLevel {
  const latest = records.at(-1);
  if (!latest) return 1;
  let target = latest.difficultyLevel;
  const recent = records.slice(-2);
  const twoCorrect = recent.length === 2 && recent.every((record) => record.isCorrect);
  const twoIncorrect = recent.length === 2 && recent.every((record) => !record.isCorrect);
  const repeated = latest.mistakeCategory && (getMistakeCounts(records)[latest.mistakeCategory] ?? 0) > 1;

  if (twoCorrect && latest.confidence !== "guessing") target += 1;
  if (twoIncorrect || repeated || (!latest.isCorrect && latest.confidence === "guessing")) target -= 1;
  if (latest.isCorrect && latest.confidence === "guessing") target = latest.difficultyLevel;
  if (!latest.isCorrect && latest.mistakeCategory === "calculation_error") target = latest.difficultyLevel;
  return clamp(target, 1, 5) as DifficultyLevel;
}

function shouldEnd(records: AnswerRecord[]): AdaptiveDecision | null {
  if (records.length >= 15) return { kind: "end", reason: "maximum_questions", explanation: "The diagnostic reached its 15-question limit." };
  if (records.length < 8) return null;
  const accuracy = records.filter((record) => record.isCorrect).length / records.length;
  const recent = records.slice(-4);
  const stable = recent.length === 4 && recent.filter((record) => record.isCorrect).length >= 3;
  const highCorrect = records.filter((record) => record.isCorrect && record.difficultyLevel >= 4).length;
  const highestMistake = Math.max(0, ...Object.values(getMistakeCounts(records)));
  if (accuracy >= 0.85 && highCorrect >= 2 && highestMistake <= 2 && stable) {
    return { kind: "end", reason: "strong_mastery", explanation: "Strong, stable performance across challenging questions provided enough evidence." };
  }
  if (records.length >= 10) {
    const dominant = dominantMistake(records);
    const sameDifficulty = records.slice(-5).filter((record) => record.difficultyLevel === records.at(-1)?.difficultyLevel).length >= 3;
    if (dominant && (getMistakeCounts(records)[dominant] ?? 0) >= 3 && sameDifficulty) {
      return { kind: "end", reason: "developing_level_identified", explanation: "A consistent difficulty level and repeated misconception identified a clear practice target." };
    }
    const lowLevelMisses = records.filter((record) => !record.isCorrect && record.difficultyLevel <= 2);
    if (lowLevelMisses.length >= 3 && dominant) {
      return { kind: "end", reason: "prerequisite_gap_identified", explanation: "Repeated foundational misses indicate that practice should focus on prerequisite skills." };
    }
  }
  return null;
}

export function selectAdaptiveQuestion(allQuestions: SATQuestion[], records: AnswerRecord[]): AdaptiveDecision {
  const end = shouldEnd(records);
  if (end) return end;

  const usedIds = new Set(records.map((record) => record.questionId));
  const available = allQuestions.filter((question) => !usedIds.has(question.id) && !question.tags.includes("fixed") && question.status === "approved");
  if (available.length === 0) return { kind: "end", reason: "no_safe_question_available", explanation: "No unused question met the adaptive safety checks." };

  const target = targetDifficulty(records);
  const latest = records.at(-1);
  const recent = records.slice(-3);
  const recentSkills = recent.map((record) => record.primarySkill);
  const recentLetters = recent.map((record) => record.correctChoice);
  const mistake = dominantMistake(records);
  const targetSkill = latest && !latest.isCorrect ? latest.primarySkill : "";

  const scored = available.map((question) => {
    let score = 100 - Math.abs(question.difficultyLevel - target) * 20;
    if (targetSkill && question.primarySkill === targetSkill) score += 25;
    if (mistake && Object.values(question.mistakeCategoryByChoice).includes(mistake)) score += 8;
    if (recentSkills.length === 3 && recentSkills.every((skill) => skill === question.primarySkill)) score -= 60;
    if (recent.filter((record) => record.difficultyLevel === question.difficultyLevel).length === 3) score -= 35;
    if (recentLetters.length === 3 && recentLetters.every((letter) => letter === question.correctAnswer)) score -= 50;
    if (latest?.mistakeCategory === "misread_question" && question.questionText.length < 155) score += 6;
    if (latest?.mistakeCategory === "wrong_operation" && question.difficultyLevel <= latest.difficultyLevel) score += 6;
    if (latest?.mistakeCategory === "visual_misinterpretation" && question.visual) score += 18;
    if (recent.length >= 2 && recent.slice(-2).every((record) => record.isVisual) && question.visual) score -= 10_000;
    return { question, score };
  });
  scored.sort((left, right) => right.score - left.score || left.question.id.localeCompare(right.question.id));
  const selected = scored[0]?.question;
  if (!selected) return { kind: "end", reason: "no_safe_question_available", explanation: "No safe fallback question was available." };
  return {
    kind: "next",
    question: selected,
    targetDifficulty: target,
    targetSkill: targetSkill || selected.primarySkill,
    dominantMistake: mistake,
    reason: targetSkill ? "It targets the most recent missed skill at an appropriate difficulty." : "It balances the current difficulty target with unused-question guardrails.",
  };
}

/** Accepts the full diagnostic state so UI callers do not need to duplicate adaptation bookkeeping. */
export function getAdaptiveDecision(input: AdaptiveEngineInput): AdaptiveDecision {
  const historyIds = new Set(input.answerHistory.map((record) => record.questionId));
  const completeHistory = input.questionsAlreadyAnswered.length === historyIds.size
    ? input.answerHistory
    : input.answerHistory.filter((record) => input.questionsAlreadyAnswered.includes(record.questionId));
  return selectAdaptiveQuestion(input.allQuestions, completeHistory);
}

export function confidenceLabel(confidence: Confidence) {
  return confidence ? confidence.replace("_", " ") : "not selected";
}
