"use client";

import type { AnswerChoice as AnswerChoiceType, AnswerChoiceId } from "@/types/question";

type AnswerChoiceProps = {
  choice: AnswerChoiceType;
  selected: boolean;
  disabled?: boolean;
  onSelect: (choiceId: AnswerChoiceId) => void;
};

export function AnswerChoice({ choice, selected, onSelect, disabled = false }: AnswerChoiceProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect(choice.id)}
      className={`choice-card flex w-full items-start gap-4 rounded-lg border p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.985] ${
        selected
          ? "border-emerald-600 bg-emerald-50 text-emerald-950 shadow-sm"
          : "border-slate-200 bg-white text-slate-800 hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm font-semibold ${
          selected
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-300 bg-white text-slate-700"
        }`}
      >
        {choice.id}
      </span>
      <span className="pt-1 leading-6">{choice.text}</span>
    </button>
  );
}
