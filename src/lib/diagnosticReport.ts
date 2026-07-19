import { estimateMastery, getMistakeCounts, getSkillPerformance, type DiagnosticStopReason } from "@/lib/adaptiveEngine";
import type { AnswerRecord, SATQuestion } from "@/types/question";

const labels = ["Foundations Needed", "Developing", "Proficient", "Advanced", "Exceptional"];
const titleCase = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export type DiagnosticReport = {
  total: number; correct: number; accuracy: number; mastery: number; masteryLabel: string; highestDifficulty: number;
  mostConsistentDifficulty: number; strongestSkill: string; weakestSkill: string; mostCommonMistake: string; improvementTrend: string;
  mistakeTwinSummary: string; stopReason: string; recommendedSkill: string;
};

export function buildDiagnosticReport(records: AnswerRecord[], stopReason: DiagnosticStopReason): DiagnosticReport {
  const correct = records.filter((record) => record.isCorrect).length;
  const mastery = estimateMastery(records);
  const skillPerformance = getSkillPerformance(records);
  const skillEntries = Object.entries(skillPerformance).sort(([, left], [, right]) => (right.correct / right.total) - (left.correct / left.total));
  const strongestSkill = skillEntries[0]?.[0] ?? "Systems of nonlinear equations";
  const weakestSkill = skillEntries.at(-1)?.[0] ?? strongestSkill;
  const mistakeEntries = Object.entries(getMistakeCounts(records)).sort(([, left], [, right]) => right - left);
  const mostCommonMistake = mistakeEntries[0]?.[0] ? titleCase(mistakeEntries[0][0]) : "No Repeated Mistake";
  const difficultyCounts = records.reduce<Record<number, number>>((counts, record) => ({ ...counts, [record.difficultyLevel]: (counts[record.difficultyLevel] ?? 0) + 1 }), {});
  const mostConsistentDifficulty = Number(Object.entries(difficultyCounts).sort(([, left], [, right]) => right - left)[0]?.[0] ?? 1);
  const early = records.slice(0, Math.ceil(records.length / 2));
  const late = records.slice(Math.floor(records.length / 2));
  const earlyRate = early.filter((record) => record.isCorrect).length / Math.max(early.length, 1);
  const lateRate = late.filter((record) => record.isCorrect).length / Math.max(late.length, 1);
  const improvementTrend = lateRate > earlyRate + 0.1 ? "Improving" : lateRate < earlyRate - 0.1 ? "Needs reinforcement" : "Steady";
  const label = mastery < 40 ? labels[0] : mastery < 60 ? labels[1] : mastery < 75 ? labels[2] : mastery < 90 ? labels[3] : labels[4];
  const twin = mostCommonMistake === "No Repeated Mistake"
    ? "Your Mistake Twin is still gathering evidence, with no repeated misconception dominating this session."
    : `Your Mistake Twin tends to show ${mostCommonMistake}, especially when working with ${weakestSkill.toLowerCase()}.`;
  return { total: records.length, correct, accuracy: Math.round((correct / Math.max(records.length, 1)) * 100), mastery, masteryLabel: label,
    highestDifficulty: Math.max(0, ...records.filter((record) => record.isCorrect).map((record) => record.difficultyLevel)), mostConsistentDifficulty,
    strongestSkill, weakestSkill, mostCommonMistake, improvementTrend, mistakeTwinSummary: twin,
    stopReason: stopReason.replaceAll("_", " "), recommendedSkill: weakestSkill };
}

export function getQuestionReview(records: AnswerRecord[], questions: SATQuestion[]) {
  const byId = new Map(questions.map((question) => [question.id, question]));
  return records.map((record) => ({ record, question: byId.get(record.questionId) })).filter((item): item is { record: AnswerRecord; question: SATQuestion } => Boolean(item.question));
}
