"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { evaluateLocalTrap, type LocalTrapEvaluation } from "@/lib/localTrapEvaluator";
import { fictionalDemoProfile, readDemoProfile } from "@/lib/demoMode";
import { readPatternImpact, savePatternImpact } from "@/lib/mistakeTwinProgress";
import { readFromStorage, writeToStorage } from "@/lib/storage";

type SavedForge = {
  complete: boolean;
  distractor?: string;
  explanation?: string;
  evaluation?: LocalTrapEvaluation | null;
  rewarded: boolean;
};

const FORGE_KEY = "trap-forge-v1";
const EMPTY_FORGE: SavedForge = { complete: false, distractor: "", explanation: "", evaluation: null, rewarded: false };
const existingChoices = ["0", "3", "6"];

function Score({ label, value }: { label: string; value: number }) {
  return <li className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700"><span className="font-medium">{label}</span><span className="float-right font-bold text-slate-950">{value}/100</span></li>;
}

export default function TrapForgePage() {
  const [distractor, setDistractor] = useState("");
  const [explanation, setExplanation] = useState("");
  const [complete, setComplete] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [awardedThisAttempt, setAwardedThisAttempt] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [evaluation, setEvaluation] = useState<LocalTrapEvaluation | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = readFromStorage<SavedForge>(FORGE_KEY, EMPTY_FORGE);
      const hasForgeDraft = typeof saved.distractor === "string" && typeof saved.explanation === "string";
      setDistractor(hasForgeDraft ? saved.distractor ?? "" : "");
      setExplanation(hasForgeDraft ? saved.explanation ?? "" : "");
      setEvaluation(hasForgeDraft ? saved.evaluation ?? null : null);
      setComplete(Boolean(hasForgeDraft && saved.complete && saved.evaluation?.isValidTrap));
      setRewarded(Boolean(hasForgeDraft && saved.rewarded));
      setDemoActive(Boolean(readDemoProfile()?.enabled));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function checkForge() {
    if (complete) return;

    const nextEvaluation = evaluateLocalTrap({
      trap: distractor,
      correctAnswer: "4",
      existingChoices,
      explanation,
      category: "solved_wrong_value",
      expectedTrap: "2",
      requiredReasoningTerms: ["x", "y"],
    });
    const storedForge = readFromStorage<SavedForge>(FORGE_KEY, EMPTY_FORGE);
    const prior = typeof storedForge.distractor === "string" && typeof storedForge.explanation === "string" ? storedForge : EMPTY_FORGE;
    const shouldAward = demoActive && nextEvaluation.isValidTrap && !prior.rewarded;
    const isComplete = nextEvaluation.isValidTrap;

    if (isComplete) {
      const impact = readPatternImpact();
      if (impact) {
        savePatternImpact({
          ...impact,
          afterForge: Math.max(0, (impact.afterFollowUp ?? impact.before) - 8),
          forgeRecognized: true,
        });
      }
    }

    if (shouldAward) {
      const profile = readDemoProfile() ?? fictionalDemoProfile;
      writeToStorage("demo-profile-v1", {
        ...profile,
        xp: profile.xp + 20,
        trapForgeRounds: profile.trapForgeRounds + 1,
        achievementKeys: [...new Set([...profile.achievementKeys, "first-forged-trap"])],
      });
    }

    const savedForge: SavedForge = {
      complete: isComplete,
      distractor,
      explanation,
      evaluation: nextEvaluation,
      rewarded: prior.rewarded || shouldAward,
    };
    writeToStorage(FORGE_KEY, savedForge);
    setEvaluation(nextEvaluation);
    setRewarded(savedForge.rewarded);
    setAwardedThisAttempt(shouldAward);
    setComplete(isComplete);
  }

  const canCheck = distractor.trim().length > 0 && explanation.trim().length > 0;
  const outcomeTone = evaluation?.isValidTrap ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50";

  return <main className="mx-auto max-w-3xl px-4 py-10">
    <p className="text-sm font-semibold uppercase text-indigo-700">Trap Forge · Verified local evaluation</p>
    <h1 className="mt-2 text-3xl font-bold">Build a tempting wrong answer.</h1>
    <p className="mt-3 text-slate-600">Turn a real mistake into an answer choice. This round is checked locally with clear rules—no AI or account is required.</p>

    <section className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5" aria-labelledby="forge-prompt">
      <h2 id="forge-prompt" className="text-xl font-bold">The student stops too early</h2>
      <p className="theme-notice-copy mt-2">For <strong>x + y = 6</strong> and <strong>y = x²</strong>, a student solves and finds <strong>x = 2</strong>. The question asks for <strong>y</strong>, whose correct answer is <strong>4</strong>.</p>
      <p className="theme-notice-copy mt-3 text-sm">Existing answer choices: {existingChoices.join(", ")}. Add the tempting wrong value created by this exact mistake, then explain the faulty step.</p>
    </section>

    <div className="mt-6 grid gap-5">
      <label className="grid gap-2 font-semibold text-slate-900" htmlFor="distractor">
        Your distractor answer choice
        <input id="distractor" value={distractor} disabled={complete} onChange={(event) => setDistractor(event.target.value)} className="rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 disabled:bg-slate-100" placeholder="For example: 2" aria-describedby="distractor-help" />
        <span id="distractor-help" className="text-sm font-normal text-slate-600">It must be a new wrong answer, not 4 or an existing choice.</span>
      </label>
      <label className="grid gap-2 font-semibold text-slate-900" htmlFor="forge-explanation">
        Why might a student choose it?
        <textarea id="forge-explanation" value={explanation} disabled={complete} onChange={(event) => setExplanation(event.target.value)} className="min-h-28 rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 disabled:bg-slate-100" placeholder="Explain the incorrect step that leads to this answer." aria-describedby="explanation-help" />
        <span id="explanation-help" className="text-sm font-normal text-slate-600">Name both x and y so the local checker can verify the requested-value mistake.</span>
      </label>
    </div>

    {!complete && <button onClick={checkForge} disabled={!canCheck} className="mt-6 rounded-md bg-indigo-700 px-5 py-3 font-semibold text-white disabled:bg-slate-300">Check my distractor</button>}

    {evaluation && <section className={`mt-6 rounded-xl border p-5 ${outcomeTone}`} aria-live="polite">
      <h2 className="text-xl font-bold">{evaluation.isValidTrap ? awardedThisAttempt ? "Distractor forged — +20 demo XP" : "Distractor forged" : "Refine this distractor"}</h2>
      <p className="mt-2 text-slate-700">{evaluation.feedback}</p>
      <p className="mt-2 text-sm text-slate-600"><strong>Next step:</strong> {evaluation.howToImprove}</p>
      <p className="mt-3 text-sm font-medium text-slate-700">Local Trap Evaluation: {evaluation.overallTrapScore}/100</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label="Trap evaluation score breakdown">
        <Score label="Plausibility" value={evaluation.plausibilityScore} />
        <Score label="Temptation" value={evaluation.temptationScore} />
        <Score label="Pattern match" value={evaluation.categoryMatchScore} />
        <Score label="Explanation" value={evaluation.explanationQualityScore} />
      </ul>
      {evaluation.isValidTrap && <>
        {rewarded && !awardedThisAttempt && demoActive && <p className="mt-3 text-sm text-slate-600">The fictional-demo reward was already applied for this completed round.</p>}
        {!demoActive && <p className="mt-3 text-sm text-slate-600">Local practice is complete. XP is shown only for the clearly labeled fictional judge demo.</p>}
        <Link href="/impact" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">See before-and-after impact</Link>
      </>}
    </section>}
  </main>;
}
