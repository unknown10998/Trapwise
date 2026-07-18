export const mistakeCategories = [
  "misread_question",
  "wrong_operation",
  "wrong_formula",
  "calculation_error",
  "solved_wrong_value",
  "tempting_distractor",
  "weak_text_evidence",
  "vocabulary_confusion",
  "rushed_answer",
  "visual_misinterpretation",
  "unknown",
] as const;

export type MistakeCategory = (typeof mistakeCategories)[number];

export type MistakePattern = {
  category: MistakeCategory;
  label: string;
  description: string;
};
