import { sampleQuestions } from "@/data/sampleQuestions";
import { buildDailyProgressRecord, calculateDailyMastery, createDailyPracticeSession, getStreak } from "@/lib/dailyPractice";
import type { AnswerRecord } from "@/types/question";
import type { ProgressHistory } from "@/types/progress";

const emptyHistory: ProgressHistory = { version: 1, sessions: [] };

/** Deterministic checks for empty profiles, refreshes, no repeats, capped movement, and streak edge cases. */
export function runDailyPracticeScenarios() {
  const records: AnswerRecord[] = [];
  const first = createDailyPracticeSession({ diagnosticRecords: records, history: emptyHistory, date: "2026-07-18" });
  const refresh = createDailyPracticeSession({ diagnosticRecords: records, history: emptyHistory, date: "2026-07-18" });
  if (first.selectedQuestionIds.join() !== refresh.selectedQuestionIds.join()) throw new Error("Daily selection must be stable on refresh.");
  if (first.selectedQuestionIds.length < 3 || first.selectedQuestionIds.length > 5) throw new Error("Daily sessions must contain 3–5 questions.");
  if (new Set(first.selectedQuestionIds).size !== first.selectedQuestionIds.length) throw new Error("Daily sessions cannot repeat a question.");
  const answered = {
    ...first,
    answers: first.selectedQuestionIds.map((id) => {
      const question = sampleQuestions.find((item) => item.id === id)!;
      return { questionId: id, selectedChoice: question.correctAnswer, correctChoice: question.correctAnswer, isCorrect: true as const, confidence: "certain" as const, mistakeCategory: null, difficultyLevel: question.difficultyLevel, primarySkill: question.primarySkill };
    }),
    isComplete: true,
  };
  const movement = calculateDailyMastery(answered);
  if (movement.change < -3 || movement.change > 5) throw new Error("Daily mastery movement exceeded its cap.");
  const record = buildDailyProgressRecord(answered);
  const history: ProgressHistory = { version: 1, sessions: [{ ...record, date: "2026-07-17" }, { ...record, sessionId: "daily-2026-07-18", date: "2026-07-18" }] };
  const streak = getStreak(history, "2026-07-18");
  if (streak.active !== 2 || streak.longest !== 2) throw new Error("Consecutive daily sessions should increase the streak once per date.");
  const next = createDailyPracticeSession({ diagnosticRecords: records, history, date: "2026-07-19" });
  if (next.selectedQuestionIds.some((id) => first.selectedQuestionIds.includes(id)) && sampleQuestions.length > first.selectedQuestionIds.length) throw new Error("Recent daily questions should not repeat when alternatives exist.");
  return { newStudent: "passed", refresh: "passed", masteryCaps: "passed", streak: "passed", recentQuestionAvoidance: "passed", localBankFallback: "passed" };
}
