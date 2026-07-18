"use client";

import { AnswerChoice } from "@/components/AnswerChoice";
import { QuestionVisual } from "@/components/QuestionVisual";
import type { AnswerChoiceId, SATQuestion } from "@/types/question";

type QuestionCardProps = {
  question: SATQuestion;
  selectedChoice: AnswerChoiceId | null;
  onSelectChoice: (choiceId: AnswerChoiceId) => void;
  disabled?: boolean;
};

export function QuestionCard({ question, selectedChoice, onSelectChoice, disabled = false }: QuestionCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
          {question.subject}
        </span>
        <span className="rounded-md bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
          {question.primarySkill}
        </span>
        <span className="rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
          {question.difficulty}
        </span>
      </div>
      <h2 className="text-lg font-semibold leading-8 text-slate-950">{question.questionText}</h2>
      {question.visual && <QuestionVisual visual={question.visual} />}
      <div className="mt-6 grid gap-3" aria-label="Answer choices">
        {question.answerChoices.map((choice) => (
          <AnswerChoice
            key={choice.id}
            choice={choice}
            selected={selectedChoice === choice.id}
            onSelect={onSelectChoice}
            disabled={disabled}
          />
        ))}
      </div>
    </article>
  );
}
