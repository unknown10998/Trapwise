"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { sampleQuestions } from "@/data/sampleQuestions";
import { buildDailyProgressRecord, createDailyPracticeSession, getStreak, localDate, readDailySession, readProgressHistory, saveDailySession, saveProgressHistory } from "@/lib/dailyPractice";
import { readScopedFromStorage } from "@/lib/storage";
import { queueProgressForSync } from "@/lib/cloudSync";
import { useAuth } from "@/components/AuthProvider";
import { playCorrectAnswerSound } from "@/lib/sounds";
import { MistakeAnalysis } from "@/components/MistakeAnalysis";
import type { AnswerRecord, AnswerChoiceId, Confidence } from "@/types/question";
import type { DailyAnswer, DailyPracticeSession, ProgressHistory } from "@/types/progress";

type SavedDiagnostic = { records: AnswerRecord[] };
const confidenceOptions: { value: Exclude<Confidence, null>; label: string }[] = [
  { value: "guessing", label: "Guessing" }, { value: "unsure", label: "Unsure" }, { value: "mostly_sure", label: "Mostly Sure" }, { value: "certain", label: "Certain" },
];

function getQuestion(id: string) { return sampleQuestions.find((question) => question.id === id); }

export default function DailyPage() {
  const { dataScope, loading } = useAuth();
  const [session, setSession] = useState<DailyPracticeSession | null>(null);
  const [history, setHistory] = useState<ProgressHistory>({ version: 1, sessions: [] });
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<AnswerChoiceId | null>(null);
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [preparation, setPreparation] = useState<"preparing" | "ready" | "fallback" | "error">("preparing");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (loading) return;
    let active = true;
    const timeout = window.setTimeout(() => { if (active) setPreparation("error"); }, 1800);
    const frame = window.requestAnimationFrame(() => {
      try {
        const currentHistory = readProgressHistory(dataScope);
        const existing = readDailySession(dataScope);
        const today = localDate();
        const diagnostic = readScopedFromStorage<SavedDiagnostic>(dataScope, "adaptive-diagnostic", { records: [] });
        const nextSession = existing?.date === today ? existing : createDailyPracticeSession({ diagnosticRecords: diagnostic.records, history: currentHistory, date: today });
        if (!nextSession?.selectedQuestionIds.length) throw new Error("No local practice questions were available.");
        if (nextSession !== existing) saveDailySession(nextSession, dataScope);
        if (!active) return;
        setHistory(currentHistory); setSession(nextSession); setIndex(nextSession.answers.length); setPreparation("ready");
      } catch {
        try {
          const fallbackHistory: ProgressHistory = { version: 1, sessions: [] };
          const fallback = createDailyPracticeSession({ diagnosticRecords: [], history: fallbackHistory, date: localDate(), availableQuestions: sampleQuestions });
          if (!fallback.selectedQuestionIds.length) throw new Error("No fallback questions were available.");
          if (!active) return;
          saveDailySession(fallback, dataScope); setHistory(fallbackHistory); setSession(fallback); setIndex(0); setPreparation("fallback");
        } catch { if (active) setPreparation("error"); }
      } finally { window.clearTimeout(timeout); }
    });
    return () => { active = false; window.clearTimeout(timeout); window.cancelAnimationFrame(frame); };
  }, [attempt, dataScope, loading]);

  if (!session) return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><p role="status" className="text-slate-600">{preparation === "error" ? "Unable to prepare today’s local practice." : "Preparing today’s practice…"}</p>{preparation === "error" && <div className="mt-5 flex gap-3"><button type="button" onClick={() => { setPreparation("preparing"); setAttempt((value) => value + 1); }} className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">Retry</button><Link href="/" className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-800">Return home</Link></div>}</main>;
  const question = getQuestion(session.selectedQuestionIds[index]);
  const streak = getStreak(history);
  if (session.isComplete || !question) return <DailyComplete session={session} history={history} />;

  function submitAnswer() {
    if (!session || !choice || !question) return;
    const answer: DailyAnswer = {
      questionId: question.id, selectedChoice: choice, correctChoice: question.correctAnswer, isCorrect: choice === question.correctAnswer,
      confidence, mistakeCategory: choice === question.correctAnswer ? null : question.mistakeCategoryByChoice[choice] ?? "unknown",
      difficultyLevel: question.difficultyLevel, primarySkill: question.primarySkill, reasoning: reasoning.trim() || undefined,
      isVisual: Boolean(question.visual), visualCategory: question.visual?.category,
    };
    const updated = { ...session, answers: [...session.answers, answer] };
    if (answer.isCorrect) playCorrectAnswerSound();
    saveDailySession(updated, dataScope); setSession(updated); setShowFeedback(true);
  }

  function nextQuestion() {
    if (!session) return;
    if (index + 1 < session.selectedQuestionIds.length) { setIndex(index + 1); setChoice(null); setReasoning(""); setConfidence(null); setShowFeedback(false); return; }
    const completed = { ...session, isComplete: true };
    const record = buildDailyProgressRecord(completed);
    const updatedHistory = history.sessions.some((item) => item.sessionId === record.sessionId) ? history : { ...history, sessions: [...history.sessions, record] };
    queueProgressForSync(record, dataScope); saveDailySession(completed, dataScope); saveProgressHistory(updatedHistory, dataScope); setHistory(updatedHistory); setSession(completed);
  }

  const answer = session.answers.at(-1);
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">{session.date}</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Daily Practice</h1></div>
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-right"><p className="text-xs font-semibold uppercase text-emerald-800">Current streak</p><p className="text-2xl font-bold text-emerald-950">{streak.active} day{streak.active === 1 ? "" : "s"}</p></div>
        </div>
        <p className="mt-4 leading-7 text-slate-600">{session.reason}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Current mastery" value={String(session.startingMastery)} /><Info label="Previous mastery" value={String(history.sessions.at(-1)?.masteryAfter ?? session.startingMastery)} /><Info label="Today&apos;s target" value={session.targetSkill} /><Info label="Mistake Twin pattern" value={session.targetMistakeCategory?.replaceAll("_", " ") ?? "Building evidence"} /></div>
        <div className="mt-6"><div className="mb-2 flex justify-between text-sm text-slate-600"><span>Daily question {index + 1}</span><span>{session.answers.length} answered</span></div><ProgressBar current={index + 1} total={session.selectedQuestionIds.length} label="Daily practice progress" /></div>
      </div>

      <div className="mt-6"><QuestionCard question={question} selectedChoice={choice} onSelectChoice={setChoice} disabled={showFeedback} /></div>
      {preparation === "fallback" && <p role="status" className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">Using a verified local fallback practice set.</p>}
      {!showFeedback ? <>
        <section className="mt-5 rounded-lg border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="daily-reasoning-heading"><h2 id="daily-reasoning-heading" className="font-semibold text-indigo-950">Show your reasoning (optional)</h2><p className="mt-1 text-sm leading-6 text-indigo-900">Explain what you noticed, which step felt uncertain, or why you chose an answer. This becomes extra Mistake Twin evidence.</p><label htmlFor="daily-reasoning" className="sr-only">Your reasoning for this question</label><textarea id="daily-reasoning" value={reasoning} onChange={(event) => setReasoning(event.target.value)} maxLength={1000} className="mt-3 min-h-24 w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm text-slate-900" placeholder="I chose this because…" aria-describedby="daily-reasoning-help" /><p id="daily-reasoning-help" className="mt-1 text-xs text-indigo-800">{reasoning.length}/1000 characters · Saved with this practice answer.</p></section>
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-950">Confidence (optional)</h2><div className="mt-3 grid gap-2 sm:grid-cols-4">{confidenceOptions.map((option) => <button key={option.value} type="button" aria-pressed={confidence === option.value} onClick={() => setConfidence(option.value)} className={`rounded-md border px-3 py-2 text-sm font-medium ${confidence === option.value ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}>{option.label}</button>)}</div></section>
        <div className="mt-6 flex flex-wrap items-center gap-5"><button type="button" onClick={submitAnswer} disabled={!choice} className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">Check Answer</button><Link href="/progress" className="inline-flex min-h-11 items-center font-semibold text-emerald-700 hover:underline">View your progress</Link></div>
      </> : <section className={`mt-5 rounded-lg border p-5 ${answer?.isCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite">
        <p className="font-bold text-slate-950">{answer?.isCorrect ? "Nice work — you got it." : `The correct answer is ${question.correctAnswer}.`}</p>
        <p className="mt-2 leading-7 text-slate-700">{question.explanation}</p><p className="mt-2 text-sm leading-6 text-slate-600"><strong>Main trap:</strong> {question.mainTrap}</p>
        {!answer?.isCorrect && <p className="mt-2 text-sm text-slate-600">Pattern noticed: {answer?.mistakeCategory?.replaceAll("_", " ")}.</p>}
        <button type="button" onClick={nextQuestion} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-5 py-2 font-semibold text-white">{index + 1 === session.selectedQuestionIds.length ? "Finish Daily Practice" : "Next Question"}</button>
      </section>}
      {showFeedback && !answer?.isCorrect && answer?.reasoning && <div className="mt-5"><MistakeAnalysis questionId={question.id} selectedChoice={answer.selectedChoice} reasoning={answer.reasoning} /></div>}
      {showFeedback && <Link href="/progress" className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-emerald-700 hover:underline">View your progress</Link>}
    </main>
  );
}

function DailyComplete({ session, history }: { session: DailyPracticeSession; history: ProgressHistory }) {
  const record = history.sessions.find((item) => item.sessionId === session.sessionId) ?? buildDailyProgressRecord(session);
  const message = record.correctedMistakes > 0 ? "You defeated part of your most common trap today." : record.masteryChange > 0 ? "Your practice gave Trapwise stronger evidence of growth." : "Your mastery stayed steady while Trapwise gathers more evidence.";
  const highestDifficulty = Math.max(...session.answers.map((answer) => answer.difficultyLevel));
  const confidenceAnswers = session.answers.filter((answer) => answer.confidence !== null);
  const confidenceAccuracy = confidenceAnswers.length ? Math.round((confidenceAnswers.filter((answer) => answer.isCorrect).length / confidenceAnswers.length) * 100) : null;
  return <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-semibold uppercase text-emerald-700">Daily practice complete</p><h1 className="mt-2 text-3xl font-bold text-slate-950">Small practice, real momentum.</h1><p className="mt-4 text-lg text-slate-600">{message}</p><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Info label="Daily score" value={`${record.accuracy}%`} /><Info label="Questions correct" value={`${record.correctAnswers}/${record.questionsAnswered}`} /><Info label="Starting mastery" value={String(record.masteryBefore)} /><Info label="Ending mastery" value={String(record.masteryAfter)} /><Info label="Mastery change" value={`${record.masteryChange >= 0 ? "+" : ""}${record.masteryChange}`} /><Info label="Skill practiced" value={session.targetSkill} /><Info label="Pattern targeted" value={session.targetMistakeCategory?.replaceAll("_", " ") ?? "Building evidence"} /><Info label="Mistakes corrected" value={String(record.correctedMistakes)} /><Info label="Highest level completed" value={`Level ${highestDifficulty}`} /><Info label="Confidence accuracy" value={confidenceAccuracy === null ? "Not enough data" : `${confidenceAccuracy}%`} /></div><section className="mt-6 rounded-xl border border-indigo-200 bg-indigo-50 p-5"><h2 className="font-bold text-indigo-950">Updated Mistake Twin</h2><p className="mt-2 text-indigo-900">{record.reasoningResponses?.length ?? 0} reasoning response{record.reasoningResponses?.length === 1 ? "" : "s"} captured as additional pattern evidence.</p><p className="mt-2 text-sm text-indigo-800">Tomorrow, focus on {record.correctedMistakes > 0 ? "keeping this corrected pattern strong with one slightly harder question." : `${session.targetSkill.toLowerCase()} with deliberate setup checks before calculating.`}</p></section><div className="mt-8 flex gap-3"><Link href="/progress" className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">View Progress</Link><Link href="/" className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-800">Home</Link></div></main>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>; }
