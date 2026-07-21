"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { MistakeTwinCard } from "@/components/MistakeTwinCard";
import { MistakeAnalysis } from "@/components/MistakeAnalysis";
import { MistakeTwinReveal } from "@/components/MistakeTwinReveal";
import { sampleQuestions } from "@/data/sampleQuestions";
import { buildDiagnosticReport, getQuestionReview } from "@/lib/diagnosticReport";
import { writeToStorage } from "@/lib/storage";
import { scopedDataKey, type DataScope } from "@/lib/storage";
import { useAuth } from "@/components/AuthProvider";
import { buildMistakeTwinProfile } from "@/lib/mistakeTwinEngine";
import { patternStrength } from "@/lib/mistakeTwinProgress";
import type { AnswerRecord } from "@/types/question";
import type { DiagnosticStopReason } from "@/lib/adaptiveEngine";

type SavedDiagnostic = { records: AnswerRecord[]; stopReason: DiagnosticStopReason | null };
const EMPTY_DIAGNOSTIC: SavedDiagnostic = { records: [], stopReason: null };
let cachedDiagnosticValue: string | null | undefined;
let cachedDiagnosticSnapshot: SavedDiagnostic = EMPTY_DIAGNOSTIC;
let cachedDiagnosticScope: DataScope | null = null;

function getDiagnosticSnapshot(scope: DataScope): SavedDiagnostic {
  const scopedKey = `trapwise:${scopedDataKey(scope, "adaptive-diagnostic")}`;
  const storedValue = window.localStorage.getItem(scopedKey) ?? (scope === "guest" ? window.localStorage.getItem("trapwise:adaptive-diagnostic") : null);
  if (storedValue === cachedDiagnosticValue && scope === cachedDiagnosticScope) return cachedDiagnosticSnapshot;
  cachedDiagnosticValue = storedValue;
  cachedDiagnosticScope = scope;
  try {
    cachedDiagnosticSnapshot = storedValue ? (JSON.parse(storedValue) as SavedDiagnostic) : EMPTY_DIAGNOSTIC;
  } catch {
    cachedDiagnosticSnapshot = EMPTY_DIAGNOSTIC;
  }
  return cachedDiagnosticSnapshot;
}

export default function ResultsPage() {
  const { dataScope, loading } = useAuth();
  const saved = useSyncExternalStore(
    () => () => undefined,
    () => loading ? EMPTY_DIAGNOSTIC : getDiagnosticSnapshot(dataScope),
    () => EMPTY_DIAGNOSTIC,
  );
  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-bold">Checking your results</h1></main>;
  if (saved.records.length === 0) return <EmptyResults />;

  const report = buildDiagnosticReport(saved.records, saved.stopReason ?? "no_safe_question_available");
  const review = getQuestionReview(saved.records, sampleQuestions);
  const twinProfile = buildMistakeTwinProfile(saved.records);
  const dominantCategory = twinProfile.dominantMistake === "none" ? "unknown" : twinProfile.dominantMistake;
  const strength = patternStrength(saved.records, dominantCategory);
  const dominantDifficulty = Math.max(1, ...saved.records.filter((record) => record.mistakeCategory === dominantCategory).map((record) => record.difficultyLevel));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">Adaptive diagnostic results</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Your systems profile</h1>
        <p className="mt-4 leading-7 text-slate-600">This is a Trapwise topic-mastery estimate, not an official SAT score.</p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Diagnostic summary">
        <ResultStat label="Questions answered" value={String(report.total)} />
        <ResultStat label="Correct answers" value={String(report.correct)} />
        <ResultStat label="Accuracy" value={`${report.accuracy}%`} />
        <ResultStat label="Topic mastery" value={`${report.mastery}%`} />
        <ResultStat label="Current skill level" value={report.masteryLabel} />
        <ResultStat label="Highest difficulty correct" value={`Level ${report.highestDifficulty}`} />
        <ResultStat label="Most consistent level" value={`Level ${report.mostConsistentDifficulty}`} />
        <ResultStat label="Improvement trend" value={report.improvementTrend} />
        <ResultStat label="Strongest skill" value={report.strongestSkill} />
        <ResultStat label="Practice next" value={report.recommendedSkill} />
        <ResultStat label="Most common mistake" value={report.mostCommonMistake} />
        <ResultStat label="Why it ended" value={report.stopReason} />
      </section>

      <MistakeTwinReveal profile={twinProfile} strength={strength} dominantDifficulty={dominantDifficulty} />

      <section className="mt-8 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <MistakeTwinCard
          title="Mistake Twin summary"
          summary={report.mistakeTwinSummary}
          patterns={[
            `Strongest area: ${report.strongestSkill}`,
            `Priority practice: ${report.recommendedSkill}`,
            `Trend: ${report.improvementTrend}`,
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">Recommended next step</h2>
          <p className="mt-3 leading-7 text-slate-600">
            Practice {report.recommendedSkill.toLowerCase()} with clear attention to {report.mostCommonMistake}.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/follow-up" className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
              Try Personalized Follow-Up
            </Link>
            <Link href="/trap-forge" className="inline-flex min-h-11 items-center justify-center rounded-md border border-indigo-300 px-4 py-2 font-semibold text-indigo-800 hover:bg-indigo-50">Open Trap Forge</Link>
            <Link
              href="/diagnostic"
              onClick={() => writeToStorage<SavedDiagnostic>(scopedDataKey(dataScope, "adaptive-diagnostic"), { records: [], stopReason: null })}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-50"
            >
              Restart Diagnostic
            </Link>
          </div>
        </div>
      </section>

      {review.find((item) => !item.record.isCorrect) && <section className="mt-8"><MistakeAnalysis questionId={review.find((item) => !item.record.isCorrect)!.record.questionId} selectedChoice={review.find((item) => !item.record.isCorrect)!.record.selectedChoice} /></section>}

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-slate-950">Question review</h2>
        <div className="mt-5 grid gap-4">
          {review.map(({ record, question }) => (
            <article key={record.questionId} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className={`rounded-md px-2.5 py-1 font-medium ${record.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                  {record.isCorrect ? "Correct" : "Review"}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">Level {record.difficultyLevel}</span>
                {record.wasAdaptive && <span className="rounded-md bg-amber-50 px-2.5 py-1 font-medium text-amber-800">Adaptive</span>}
              </div>
              <h3 className="mt-3 font-semibold leading-7 text-slate-950">{question.questionText}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your answer: {record.selectedChoice} • Correct answer: {record.correctChoice}
                {!record.isCorrect && record.mistakeCategory ? ` • Pattern: ${record.mistakeCategory.replaceAll("_", " ")}` : ""}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{question.explanation}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function EmptyResults() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-normal text-emerald-700">No diagnostic yet</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">Start a diagnostic to build your Trapwise profile.</h1>
      <Link href="/diagnostic" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
        Start Diagnostic
      </Link>
    </main>
  );
}

function ResultStat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-slate-950">{value}</p>
    </article>
  );
}
