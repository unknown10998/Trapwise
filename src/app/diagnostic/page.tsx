"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { fixedDiagnosticQuestions, sampleQuestions } from "@/data/sampleQuestions";
import { estimateMastery, getAdaptiveDecision, getMistakeCounts, getSkillPerformance, type DiagnosticStopReason } from "@/lib/adaptiveEngine";
import { buildDiagnosticReport } from "@/lib/diagnosticReport";
import { localDate, readProgressHistory, saveProgressHistory } from "@/lib/dailyPractice";
import { readScopedFromStorage, scopedDataKey, writeToStorage } from "@/lib/storage";
import { playCorrectAnswerSound } from "@/lib/sounds";
import { startDemoMode } from "@/lib/demoMode";
import { useAuth } from "@/components/AuthProvider";
import type { AnswerChoiceId, AnswerRecord, Confidence, SATQuestion } from "@/types/question";

type SavedDiagnostic = { records: AnswerRecord[]; stopReason: DiagnosticStopReason | null };

const confidenceOptions: { value: Exclude<Confidence, null>; label: string }[] = [
  { value: "guessing", label: "Guessing" },
  { value: "unsure", label: "Unsure" },
  { value: "mostly_sure", label: "Mostly Sure" },
  { value: "certain", label: "Certain" },
];

export default function DiagnosticPage() {
  const { dataScope, loading } = useAuth();
  const router = useRouter();
  const [selectedChoice, setSelectedChoice] = useState<AnswerChoiceId | null>(null);
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [records, setRecords] = useState<AnswerRecord[]>([]);
  const [question, setQuestion] = useState<SATQuestion>(fixedDiagnosticQuestions[0]);
  const [selectionNote, setSelectionNote] = useState("Start with five foundation-to-challenge questions.");
  const [judgeDemo, setJudgeDemo] = useState(false);

  const questionNumber = records.length + 1;
  const wasAdaptive = records.length >= fixedDiagnosticQuestions.length;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const isJudgeDemo = new URLSearchParams(window.location.search).get("judgeDemo") === "1";
      setJudgeDemo(isJudgeDemo);
      if (isJudgeDemo) {
        startDemoMode();
        return;
      }

      const saved = readScopedFromStorage<SavedDiagnostic>(dataScope, "adaptive-diagnostic", { records: [], stopReason: null });
      if (saved.stopReason) {
        router.replace("/results");
        return;
      }
      if (saved.records.length === 0) return;
      const lastRecord = saved.records.at(-1);
      const nextFixed = fixedDiagnosticQuestions[saved.records.length];
      if (nextFixed) {
        setRecords(saved.records);
        setQuestion(nextFixed);
        setSelectionNote("Resumed your saved diagnostic.");
        return;
      }
      const decision = getAdaptiveDecision({
        allQuestions: sampleQuestions,
        questionsAlreadyAnswered: saved.records.map((record) => record.questionId),
        answerHistory: saved.records,
        currentMastery: lastRecord?.masteryAfter ?? 50,
        mistakeCategoryCounts: getMistakeCounts(saved.records),
        skillPerformanceCounts: getSkillPerformance(saved.records),
      });
      if (decision.kind === "next") {
        setRecords(saved.records);
        setQuestion(decision.question);
        setSelectionNote("Resumed your saved diagnostic. " + decision.reason);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [dataScope, router]);

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-10"><h1 className="text-2xl font-bold">Checking your practice data</h1></main>;

  function finishDiagnostic(updatedRecords: AnswerRecord[], stopReason: DiagnosticStopReason) {
    writeToStorage<SavedDiagnostic>(scopedDataKey(dataScope, "adaptive-diagnostic"), { records: updatedRecords, stopReason });
    const report = buildDiagnosticReport(updatedRecords, stopReason);
    const sessionId = `diagnostic-${localDate()}-${updatedRecords[0]?.questionId ?? "session"}`;
    const history = readProgressHistory(dataScope);
    if (!history.sessions.some((session) => session.sessionId === sessionId)) {
      const difficultyPerformance = updatedRecords.reduce<Record<number, { correct: number; total: number }>>((result, record) => {
        const current = result[record.difficultyLevel] ?? { correct: 0, total: 0 };
        current.total += 1; if (record.isCorrect) current.correct += 1; result[record.difficultyLevel] = current; return result;
      }, {});
      const confidencePerformance = updatedRecords.reduce<Record<string, { correct: number; total: number }>>((result, record) => {
        const key = record.confidence ?? "not_selected"; const current = result[key] ?? { correct: 0, total: 0 };
        current.total += 1; if (record.isCorrect) current.correct += 1; result[key] = current; return result;
      }, {});
      const visualAnswers = updatedRecords.filter((record) => record.isVisual);
      const visualPerformance = visualAnswers.reduce<Record<string, { correct: number; total: number }>>((result, record) => { const key = record.visualCategory ?? "other"; const current = result[key] ?? { correct: 0, total: 0 }; current.total += 1; if (record.isCorrect) current.correct += 1; result[key] = current; return result; }, {});
      saveProgressHistory({ ...history, sessions: [...history.sessions, {
        sessionId, sessionType: "diagnostic", date: localDate(), questionsAnswered: updatedRecords.length, correctAnswers: report.correct,
        accuracy: report.accuracy, masteryBefore: updatedRecords[0]?.masteryBefore ?? 50, masteryAfter: report.mastery,
        masteryChange: report.mastery - (updatedRecords[0]?.masteryBefore ?? 50), strongestSkill: report.strongestSkill, weakestSkill: report.weakestSkill,
        dominantMistake: report.mostCommonMistake, difficultyPerformance, confidencePerformance, correctedMistakes: 0, questionIds: updatedRecords.map((record) => record.questionId), visualPerformance: { answered: visualAnswers.length, correct: visualAnswers.filter((record) => record.isCorrect).length, visualMisinterpretations: visualAnswers.filter((record) => record.mistakeCategory === "visual_misinterpretation").length, byCategory: visualPerformance },
      }] }, dataScope);
    }
    router.push("/results");
  }

  function handleSubmit() {
    if (!selectedChoice) return;

    const masteryBefore = estimateMastery(records);
    const isCorrect = selectedChoice === question.correctAnswer;
    if (isCorrect) playCorrectAnswerSound();
    const nextRecord: AnswerRecord = {
      questionId: question.id,
      selectedChoice,
      correctChoice: question.correctAnswer,
      isCorrect,
      mistakeCategory: isCorrect ? null : question.mistakeCategoryByChoice[selectedChoice] ?? "unknown",
      difficultyLevel: question.difficultyLevel,
      primarySkill: question.primarySkill,
      confidence,
      responseOrder: questionNumber,
      wasAdaptive,
      masteryBefore,
      masteryAfter: 0,
      isVisual: Boolean(question.visual),
      visualCategory: question.visual?.category,
    };
    const provisionalRecords = [...records, nextRecord];
    nextRecord.masteryAfter = estimateMastery(provisionalRecords);
    const updatedRecords = [...records, nextRecord];
    setRecords(updatedRecords);
    writeToStorage<SavedDiagnostic>(scopedDataKey(dataScope, "adaptive-diagnostic"), { records: updatedRecords, stopReason: null });

    if (updatedRecords.length < fixedDiagnosticQuestions.length) {
      setQuestion(fixedDiagnosticQuestions[updatedRecords.length]);
      setSelectionNote("Continue through the fixed diagnostic sequence.");
    } else if (judgeDemo) {
      finishDiagnostic(updatedRecords, "maximum_questions");
      return;
    } else {
      const decision = getAdaptiveDecision({
        allQuestions: sampleQuestions,
        questionsAlreadyAnswered: updatedRecords.map((record) => record.questionId),
        answerHistory: updatedRecords,
        currentMastery: nextRecord.masteryAfter,
        mistakeCategoryCounts: getMistakeCounts(updatedRecords),
        skillPerformanceCounts: getSkillPerformance(updatedRecords),
      });
      if (decision.kind === "end") {
        finishDiagnostic(updatedRecords, decision.reason);
        return;
      }
      setQuestion(decision.question);
      setSelectionNote(decision.reason);
      if (process.env.NODE_ENV !== "production") {
        console.info("Trapwise adaptive selection", decision);
      }
    }

    setSelectedChoice(null);
    setConfidence(null);
  }

  function handlePrevious() {
    const previous = records.at(-1);
    if (!previous) return;
    const remaining = records.slice(0, -1);
    const previousQuestion = sampleQuestions.find((item) => item.id === previous.questionId);
    if (!previousQuestion) return;
    setRecords(remaining);
    setQuestion(previousQuestion);
    setSelectedChoice(previous.selectedChoice);
    setConfidence(previous.confidence);
    setSelectionNote("You can change this saved answer before continuing.");
    writeToStorage<SavedDiagnostic>(scopedDataKey(dataScope, "adaptive-diagnostic"), { records: remaining, stopReason: null });
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        {judgeDemo && <p className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm leading-6 text-indigo-950"><strong>Judge Demo:</strong> this is a fixed five-question local flow. On Question 1, choose <strong>C</strong> to reveal the deterministic <strong>Solved Wrong Value</strong> Mistake Twin pattern; no account, API key, or Supabase setup is required.</p>}
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">{question.subject}</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Adaptive Diagnostic</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {wasAdaptive ? `Question ${questionNumber} • Adaptive Practice` : `Question ${questionNumber} • Diagnostic Foundations`}
        </p>
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>Estimated progress</span>
            <span>{wasAdaptive ? "Building your topic profile" : "Establishing your starting point"}</span>
          </div>
          <ProgressBar current={questionNumber} total={15} label="Diagnostic progress" />
        </div>
      </div>

      <QuestionCard question={question} selectedChoice={selectedChoice} onSelectChoice={setSelectedChoice} />

      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-base font-semibold text-slate-950">How confident are you?</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Optional. This helps Trapwise choose an appropriate next challenge.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {confidenceOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={confidence === option.value}
              onClick={() => setConfidence(option.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${confidence === option.value ? "border-emerald-600 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <div className="flex flex-wrap gap-3"><Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50">Exit Diagnostic</Link><button type="button" onClick={handlePrevious} disabled={records.length === 0} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Previous Question</button></div>
        <button
          type="button"
          data-testid="submit-diagnostic-answer"
          onClick={handleSubmit}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!selectedChoice}
        >
          Submit Answer
        </button>
      </div>

      {process.env.NODE_ENV !== "production" && (
        <p className="mt-6 text-xs text-slate-400">Developer note: {selectionNote}</p>
      )}
    </main>
  );
}
