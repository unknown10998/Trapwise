import type { AnswerRecord } from "@/types/question";
import type { MistakeCategory } from "@/types/mistake";
import { readFromStorage, writeToStorage } from "@/lib/storage";

export type PatternImpact = { category: MistakeCategory; before: number; afterFollowUp: number | null; afterForge: number | null; skill: string; followUpCorrect: boolean | null; forgeRecognized: boolean | null };
const key = "mistake-twin-impact-v1";
export function patternStrength(records: AnswerRecord[], category: MistakeCategory, corrections = 0, forgeRecognition = 0) { const related = records.map((record, index) => ({ record, index })).filter(({ record }) => record.mistakeCategory === category); if (!related.length) return 0; const occurrences = related.length * 17; const recency = related.reduce((sum, { index }) => sum + ((index + 1) / records.length) * 12, 0); const difficulty = related.reduce((sum, { record }) => sum + record.difficultyLevel * 2, 0); const confidence = related.filter(({ record }) => record.confidence === "certain" || record.confidence === "mostly_sure").length * 7; const repeated = related.length > 1 ? 10 : 0; const reduction = corrections * 14 + forgeRecognition * 8; return Math.max(0, Math.min(100, Math.round(occurrences + recency + difficulty + confidence + repeated - reduction))); }
export function readPatternImpact() { return readFromStorage<PatternImpact | null>(key, null); }
export function savePatternImpact(value: PatternImpact) { writeToStorage(key, value); }
