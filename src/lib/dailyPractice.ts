import { sampleQuestions } from "@/data/sampleQuestions";
import { buildDiagnosticReport } from "@/lib/diagnosticReport";
import { getMistakeCounts, getSkillPerformance } from "@/lib/adaptiveEngine";
import type { AnswerRecord, DifficultyLevel, SATQuestion } from "@/types/question";
import type { MistakeCategory } from "@/types/mistake";
import type { DailyPracticeSession, ProgressHistory, ProgressRecord } from "@/types/progress";

const HISTORY_KEY = "progress-history-v1";
const DAILY_KEY = "daily-session-v1";
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function readProgressHistory(): ProgressHistory {
  if (typeof window === "undefined") return { version: 1, sessions: [] };
  try {
    const value = window.localStorage.getItem(`trapwise:${HISTORY_KEY}`);
    const parsed = value ? (JSON.parse(value) as ProgressHistory) : null;
    return parsed?.version === 1 && Array.isArray(parsed.sessions) ? parsed : { version: 1, sessions: [] };
  } catch {
    return { version: 1, sessions: [] };
  }
}

export function saveProgressHistory(history: ProgressHistory) {
  window.localStorage.setItem(`trapwise:${HISTORY_KEY}`, JSON.stringify(history));
}

export function readDailySession(): DailyPracticeSession | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(`trapwise:${DAILY_KEY}`);
    const parsed = value ? (JSON.parse(value) as DailyPracticeSession) : null;
    return parsed && Array.isArray(parsed.selectedQuestionIds) && Array.isArray(parsed.answers) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveDailySession(session: DailyPracticeSession) {
  window.localStorage.setItem(`trapwise:${DAILY_KEY}`, JSON.stringify(session));
}

function hash(value: string) {
  return [...value].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function masteryFromHistory(history: ProgressHistory, diagnostic: AnswerRecord[]) {
  const previous = history.sessions.at(-1);
  if (previous) return previous.masteryAfter;
  return diagnostic.length ? buildDiagnosticReport(diagnostic, "maximum_questions").mastery : 50;
}

function levelFromMastery(mastery: number): DifficultyLevel {
  if (mastery < 40) return 1;
  if (mastery < 60) return 2;
  if (mastery < 75) return 3;
  if (mastery < 90) return 4;
  return 5;
}

function dominantMistake(records: AnswerRecord[]): MistakeCategory | null {
  const entries = Object.entries(getMistakeCounts(records)) as [MistakeCategory, number][];
  return entries.sort(([, left], [, right]) => right - left)[0]?.[0] ?? null;
}

function weakestSkill(records: AnswerRecord[]) {
  const skills = Object.entries(getSkillPerformance(records));
  return skills.sort(([, left], [, right]) => (left.correct / left.total) - (right.correct / right.total))[0]?.[0] ?? "Basic substitution";
}

export type DailySessionInput = {
  diagnosticRecords: AnswerRecord[];
  history: ProgressHistory;
  date: string;
  availableQuestions?: SATQuestion[];
  aiFollowUp?: never;
};

/** Deterministic local-only selection: the same date and profile always produce the same verified bank questions. */
export function createDailyPracticeSession(input: DailySessionInput): DailyPracticeSession {
  const questions = (input.availableQuestions ?? sampleQuestions).filter((question) => question.status === "approved");
  const mastery = masteryFromHistory(input.history, input.diagnosticRecords);
  const targetSkill = weakestSkill(input.diagnosticRecords);
  const targetMistakeCategory = dominantMistake(input.diagnosticRecords);
  const recentIds = new Set(input.history.sessions.slice(-7).flatMap((session) => session.questionIds));
  const currentLevel = levelFromMastery(mastery);
  const weakSkills = Object.values(getSkillPerformance(input.diagnosticRecords)).filter((item) => item.total && item.correct / item.total < 0.6).length;
  const count = weakSkills >= 2 ? 5 : 3;
  const candidates = questions.filter((question) => !recentIds.has(question.id));
  const fallback = candidates.length >= count ? candidates : questions;
  const sorted = [...fallback].sort((left, right) => {
    const leftScore = Math.abs(left.difficultyLevel - currentLevel) * 20 - (left.primarySkill === targetSkill ? 30 : 0) - (targetMistakeCategory && Object.values(left.mistakeCategoryByChoice).includes(targetMistakeCategory) ? 10 : 0) + (hash(`${input.date}-${left.id}`) % 11);
    const rightScore = Math.abs(right.difficultyLevel - currentLevel) * 20 - (right.primarySkill === targetSkill ? 30 : 0) - (targetMistakeCategory && Object.values(right.mistakeCategoryByChoice).includes(targetMistakeCategory) ? 10 : 0) + (hash(`${input.date}-${right.id}`) % 11);
    return leftScore - rightScore || left.id.localeCompare(right.id);
  });
  const recovery = sorted.find((question) => question.difficultyLevel <= Math.max(1, currentLevel - 1)) ?? sorted[0];
  const current = sorted.find((question) => question.id !== recovery?.id && question.difficultyLevel === currentLevel) ?? sorted.find((question) => question.id !== recovery?.id);
  const challenge = sorted.find((question) => question.id !== recovery?.id && question.id !== current?.id && question.difficultyLevel === Math.min(5, currentLevel + 1));
  const selected = [recovery, current, challenge, ...sorted].filter((question): question is SATQuestion => Boolean(question)).filter((question, index, all) => all.findIndex((candidate) => candidate.id === question.id) === index).reduce<SATQuestion[]>((result, question) => {
    const visualCount = result.filter((item) => item.visual).length;
    if (question.visual && visualCount >= 2) return result;
    return [...result, question];
  }, []).slice(0, count);
  return {
    sessionId: `daily-${input.date}-${hash(`${targetSkill}-${mastery}`).toString(36)}`,
    date: input.date,
    selectedQuestionIds: selected.map((question) => question.id),
    targetSkill,
    targetMistakeCategory,
    startingMastery: mastery,
    reason: `Today targets ${targetSkill.toLowerCase()}${targetMistakeCategory ? ` and ${targetMistakeCategory.replaceAll("_", "-")} mistakes` : " to confirm your current level"}.`,
    includesAiQuestion: false,
    answers: [],
    isComplete: false,
  };
}

/** Daily movement uses evidence quality and is intentionally capped to +5/−3 so a short set cannot overreact. */
export function calculateDailyMastery(session: DailyPracticeSession): { endingMastery: number; change: number; correctedMistakes: number } {
  if (session.answers.length < 3) return { endingMastery: session.startingMastery, change: 0, correctedMistakes: 0 };
  let evidence = 0;
  let correctedMistakes = 0;
  for (const answer of session.answers) {
    const targeted = answer.primarySkill === session.targetSkill || answer.mistakeCategory === session.targetMistakeCategory;
    if (answer.isCorrect) {
      evidence += 0.8 + answer.difficultyLevel * 0.2 + (targeted ? 0.5 : 0) + (answer.confidence === "certain" ? 0.35 : 0);
      if (targeted) correctedMistakes += 1;
    } else {
      evidence -= answer.confidence === "certain" ? 1.15 : answer.confidence === "guessing" ? 0.25 : 0.65;
    }
  }
  const change = clamp(Math.round(evidence / 2.2), -3, 5);
  return { endingMastery: clamp(session.startingMastery + change, 0, 100), change, correctedMistakes };
}

export function buildDailyProgressRecord(session: DailyPracticeSession): ProgressRecord {
  const { endingMastery, change, correctedMistakes } = calculateDailyMastery(session);
  const correctAnswers = session.answers.filter((answer) => answer.isCorrect).length;
  const difficultyPerformance = session.answers.reduce<Record<number, { correct: number; total: number }>>((result, answer) => {
    const current = result[answer.difficultyLevel] ?? { correct: 0, total: 0 };
    current.total += 1; if (answer.isCorrect) current.correct += 1; result[answer.difficultyLevel] = current; return result;
  }, {});
  const confidencePerformance = session.answers.reduce<Record<string, { correct: number; total: number }>>((result, answer) => {
    const key = answer.confidence ?? "not_selected"; const current = result[key] ?? { correct: 0, total: 0 };
    current.total += 1; if (answer.isCorrect) current.correct += 1; result[key] = current; return result;
  }, {});
  const visualAnswers = session.answers.filter((answer) => answer.isVisual);
  const visualPerformance = visualAnswers.reduce<Record<string, { correct: number; total: number }>>((result, answer) => { const key = answer.visualCategory ?? "other"; const current = result[key] ?? { correct: 0, total: 0 }; current.total += 1; if (answer.isCorrect) current.correct += 1; result[key] = current; return result; }, {});
  return { sessionId: session.sessionId, sessionType: "daily", date: session.date, questionsAnswered: session.answers.length, correctAnswers,
    accuracy: Math.round((correctAnswers / session.answers.length) * 100), masteryBefore: session.startingMastery, masteryAfter: endingMastery, masteryChange: change,
    strongestSkill: session.targetSkill, weakestSkill: session.targetSkill, dominantMistake: session.targetMistakeCategory?.replaceAll("_", " ") ?? "No repeated mistake",
    difficultyPerformance, confidencePerformance, correctedMistakes, questionIds: session.selectedQuestionIds, visualPerformance: { answered: visualAnswers.length, correct: visualAnswers.filter((answer) => answer.isCorrect).length, visualMisinterpretations: visualAnswers.filter((answer) => answer.mistakeCategory === "visual_misinterpretation").length, byCategory: visualPerformance } };
}

export function getStreak(history: ProgressHistory, today = localDate()) {
  const days = [...new Set(history.sessions.filter((session) => session.sessionType === "daily").map((session) => session.date))].sort();
  const parse = (value: string) => new Date(`${value}T12:00:00`);
  const active = days.at(-1) === today ? days.reduceRight((streak, day, index) => index === days.length - 1 || (parse(days[index + 1]).getTime() - parse(day).getTime()) / 86_400_000 === 1 ? streak + 1 : streak, 0) : 0;
  let longest = 0; let running = 0; let previous = "";
  for (const day of days) { running = previous && (parse(day).getTime() - parse(previous).getTime()) / 86_400_000 === 1 ? running + 1 : 1; longest = Math.max(longest, running); previous = day; }
  return { active, longest };
}
