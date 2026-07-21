import type { ProgressHistory } from "@/types/progress";
import { readFromStorage, removeFromStorage, scopedDataKey, writeToStorage, type DataScope } from "@/lib/storage";
import { readProgressHistory } from "@/lib/dailyPractice";

export type DemoProfile = { enabled: boolean; name: string; mastery: number; xp: number; level: number; streak: number; achievementKeys: string[]; trapForgeRounds: number; leaderboardRank: number; dominantMistake: string };
const profileKey = "demo-profile-v1";
const savedHistoryKey = "pre-demo-progress-history-v1";
const demoHistory: ProgressHistory = { version: 1, sessions: [
  { sessionId: "demo-diagnostic-01", sessionType: "diagnostic", date: "2026-07-14", questionsAnswered: 12, correctAnswers: 8, accuracy: 67, masteryBefore: 50, masteryAfter: 68, masteryChange: 18, strongestSkill: "Basic substitution", weakestSkill: "Parameter tangency", dominantMistake: "solved wrong value", difficultyPerformance: { 1: { correct: 3, total: 3 }, 2: { correct: 3, total: 4 }, 3: { correct: 2, total: 3 }, 4: { correct: 0, total: 2 } }, confidencePerformance: {}, correctedMistakes: 2, questionIds: ["systems-nonlinear-001"], visualPerformance: { answered: 2, correct: 1, visualMisinterpretations: 1, byCategory: { graph_interpretation: { correct: 1, total: 2 } } } },
  { sessionId: "demo-daily-02", sessionType: "daily", date: "2026-07-17", questionsAnswered: 3, correctAnswers: 3, accuracy: 100, masteryBefore: 68, masteryAfter: 72, masteryChange: 4, strongestSkill: "Circle intersections", weakestSkill: "Parameter tangency", dominantMistake: "solved wrong value", difficultyPerformance: { 2: { correct: 3, total: 3 } }, confidencePerformance: {}, correctedMistakes: 1, questionIds: ["systems-nonlinear-008"], visualPerformance: { answered: 1, correct: 1, visualMisinterpretations: 0, byCategory: { chart_reading: { correct: 1, total: 1 } } } },
] };
export const fictionalDemoProfile: DemoProfile = { enabled: true, name: "Avery Park (Demo)", mastery: 72, xp: 640, level: 3, streak: 5, achievementKeys: ["first-step", "diagnostic-complete", "pattern-breaker", "three-day-spark"], trapForgeRounds: 2, leaderboardRank: 4, dominantMistake: "solved wrong value" };
const guestScope: DataScope = "guest";
export function readDemoProfile(scope: DataScope = guestScope) { return scope === guestScope ? readFromStorage<DemoProfile | null>(scopedDataKey(guestScope, profileKey), readFromStorage<DemoProfile | null>(profileKey, null)) : null; }
export function startDemoMode() {
  const existingHistory = readProgressHistory(guestScope);
  if (existingHistory.sessions.length && !readFromStorage<ProgressHistory | null>(scopedDataKey(guestScope, savedHistoryKey), null)) writeToStorage(scopedDataKey(guestScope, savedHistoryKey), existingHistory);
  writeToStorage(scopedDataKey(guestScope, profileKey), fictionalDemoProfile);
  writeToStorage(scopedDataKey(guestScope, "progress-history-v1"), demoHistory);
  removeFromStorage(scopedDataKey(guestScope, "follow-up-v1")); removeFromStorage(scopedDataKey(guestScope, "trap-forge-v1")); removeFromStorage(scopedDataKey(guestScope, "mistake-twin-impact-v1"));
}
export function resetDemoMode() {
  if (typeof window === "undefined") return;
  const previousHistory = readFromStorage<ProgressHistory | null>(scopedDataKey(guestScope, savedHistoryKey), null);
  removeFromStorage(scopedDataKey(guestScope, profileKey)); removeFromStorage(profileKey);
  if (previousHistory) { writeToStorage(scopedDataKey(guestScope, "progress-history-v1"), previousHistory); removeFromStorage(scopedDataKey(guestScope, savedHistoryKey)); } else removeFromStorage(scopedDataKey(guestScope, "progress-history-v1"));
  removeFromStorage(scopedDataKey(guestScope, "adaptive-diagnostic")); removeFromStorage(scopedDataKey(guestScope, "follow-up-v1")); removeFromStorage(scopedDataKey(guestScope, "trap-forge-v1")); removeFromStorage(scopedDataKey(guestScope, "mistake-twin-impact-v1"));
}
