import type { AnswerChoiceId, Confidence, DifficultyLevel } from "@/types/question";
import type { MistakeCategory } from "@/types/mistake";

export type DailyAnswer = {
  questionId: string;
  selectedChoice: AnswerChoiceId;
  correctChoice: AnswerChoiceId;
  isCorrect: boolean;
  confidence: Confidence;
  mistakeCategory: MistakeCategory | null;
  difficultyLevel: DifficultyLevel;
  primarySkill: string;
  isVisual?: boolean;
  visualCategory?: string;
};

export type DailyPracticeSession = {
  sessionId: string;
  date: string;
  selectedQuestionIds: string[];
  targetSkill: string;
  targetMistakeCategory: MistakeCategory | null;
  startingMastery: number;
  reason: string;
  includesAiQuestion: false;
  answers: DailyAnswer[];
  isComplete: boolean;
};

export type ProgressRecord = {
  sessionId: string;
  sessionType: "diagnostic" | "daily" | "follow-up" | "trap-forge" | "challenge";
  date: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  masteryBefore: number;
  masteryAfter: number;
  masteryChange: number;
  strongestSkill: string;
  weakestSkill: string;
  dominantMistake: string;
  difficultyPerformance: Record<number, { correct: number; total: number }>;
  confidencePerformance: Record<string, { correct: number; total: number }>;
  correctedMistakes: number;
  questionIds: string[];
  visualPerformance?: { answered: number; correct: number; visualMisinterpretations: number; byCategory: Record<string, { correct: number; total: number }> };
};

export type ProgressHistory = { version: 1; sessions: ProgressRecord[] };
