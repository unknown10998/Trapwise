import type { MistakeCategory } from "./mistake";
import type { QuestionVisual } from "./visual";

export const subjects = ["Math", "Reading and Writing"] as const;
export type Subject = (typeof subjects)[number];

export const difficulties = ["Easy", "Medium-Easy", "Medium", "Hard", "Extremely Hard"] as const;
export type Difficulty = (typeof difficulties)[number];
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
export type AnswerChoiceId = "A" | "B" | "C" | "D";
export type QuestionStatus = "draft" | "needs-review" | "approved" | "rejected";
export type Confidence = "guessing" | "unsure" | "mostly_sure" | "certain" | null;

export type AnswerChoice = { id: AnswerChoiceId; text: string };

export type SATQuestion = {
  id: string;
  subject: Subject;
  topic: string;
  primarySkill: string;
  difficulty: Difficulty;
  difficultyLevel: DifficultyLevel;
  questionText: string;
  answerChoices: AnswerChoice[];
  correctAnswer: AnswerChoiceId;
  explanation: string;
  fastStrategy: string;
  mainTrap: string;
  distractorAnalysis: Record<AnswerChoiceId, string>;
  mistakeCategoryByChoice: Partial<Record<AnswerChoiceId, MistakeCategory>>;
  prerequisiteSkills: string[];
  tags: string[];
  /** Only approved questions are eligible for student-facing practice. */
  status: QuestionStatus;
  /** A controlled, data-based visual. Never render arbitrary SVG or HTML here. */
  visual?: QuestionVisual;
};

export type AnswerRecord = {
  questionId: string;
  selectedChoice: AnswerChoiceId;
  correctChoice: AnswerChoiceId;
  isCorrect: boolean;
  mistakeCategory: MistakeCategory | null;
  difficultyLevel: DifficultyLevel;
  primarySkill: string;
  confidence: Confidence;
  responseOrder: number;
  wasAdaptive: boolean;
  masteryBefore: number;
  masteryAfter: number;
  isVisual?: boolean;
  visualCategory?: string;
};
