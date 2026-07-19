"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { sampleQuestions } from "@/data/sampleQuestions";
import type { DiagnosticStopReason } from "@/lib/adaptiveEngine";
import { patternStrength, savePatternImpact } from "@/lib/mistakeTwinProgress";
import { playCorrectAnswerSound } from "@/lib/sounds";
import { readFromStorage, writeToStorage } from "@/lib/storage";
import type { AnswerChoiceId, AnswerRecord } from "@/types/question";

const question = sampleQuestions.find((item) => item.id === "systems-nonlinear-011")!;
type SavedDiagnostic = { records: AnswerRecord[]; stopReason: DiagnosticStopReason | null };
type SavedFollowUp = { complete: boolean; choice: AnswerChoiceId; change: number; diagnosticFingerprint: string };
const FOLLOW_UP_KEY = "follow-up-v1";

function currentFingerprint() {
  const records = readFromStorage<SavedDiagnostic>("adaptive-diagnostic", { records: [], stopReason: null }).records;
  return records.map((record) => `${record.questionId}:${record.selectedChoice}`).join("|");
}

export default function FollowUpPage() {
  const [choice, setChoice] = useState<AnswerChoiceId | null>(null);
  const [complete, setComplete] = useState(false);
  const [change, setChange] = useState<number | null>(null);
  const correct = choice === question.correctAnswer;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = readFromStorage<SavedFollowUp | null>(FOLLOW_UP_KEY, null);
      if (!saved || saved.diagnosticFingerprint !== currentFingerprint()) return;
      setChoice(saved.choice);
      setChange(saved.change);
      setComplete(saved.complete);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function check() {
    if (!choice || complete) return;
    if (correct) playCorrectAnswerSound();
    const records = readFromStorage<SavedDiagnostic>("adaptive-diagnostic", { records: [], stopReason: null }).records;
    const latestMistake = [...records].reverse().find((record) => !record.isCorrect)?.mistakeCategory ?? "solved_wrong_value";
    const before = patternStrength(records, latestMistake);
    const after = patternStrength(records, latestMistake, correct ? 1 : 0);
    savePatternImpact({ category: latestMistake, before, afterFollowUp: after, afterForge: null, skill: question.primarySkill, followUpCorrect: correct, forgeRecognized: null });
    const nextChange = before - after;
    writeToStorage<SavedFollowUp>(FOLLOW_UP_KEY, { complete: true, choice, change: nextChange, diagnosticFingerprint: currentFingerprint() });
    setChange(nextChange);
    setComplete(true);
  }

  const outcome = <section className={`rounded-xl border p-5 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite"><h2 className="text-xl font-bold">{correct ? `Pattern weakened by ${change ?? 0} points` : "The pattern needs another verified attempt"}</h2><p className="mt-2 text-slate-700">{question.explanation}</p><p className="mt-2 text-sm text-slate-600">Why it changed: {correct ? "you correctly answered a targeted follow-up, so the repeated trap carries less weight." : "a miss keeps the current pattern evidence active."}</p><Link href="/trap-forge" className="mt-4 inline-flex rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white">Continue to Trap Forge</Link></section>;
  return <main className="mx-auto max-w-4xl px-4 py-10"><p className="text-sm font-semibold uppercase text-indigo-700">Verified local follow-up</p><h1 className="mt-2 text-3xl font-bold">Check the value you were asked to find.</h1><p className="mt-3 text-slate-600">This verified question targets the same “solved wrong value” trap with different wording. It is not AI-generated.</p><div className="mt-6"><QuestionCard question={question} selectedChoice={choice} onSelectChoice={setChoice} disabled={complete} /></div>{!complete ? <button disabled={!choice} onClick={check} className="mt-6 rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white disabled:bg-slate-300">Check follow-up</button> : <div className="mt-6">{outcome}</div>}</main>;
}
