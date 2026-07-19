"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { evaluateLocalTrap, type LocalTrapEvaluation } from "@/lib/localTrapEvaluator";
import { readDemoProfile, fictionalDemoProfile } from "@/lib/demoMode";
import { readPatternImpact, savePatternImpact } from "@/lib/mistakeTwinProgress";
import { readFromStorage, writeToStorage } from "@/lib/storage";

type SavedForge = { complete: boolean; choice: string; correct: boolean; rewarded: boolean };
const EMPTY_FORGE: SavedForge = { complete: false, choice: "", correct: false, rewarded: false };

export default function TrapForgePage() {
  const [choice, setChoice] = useState("");
  const [complete, setComplete] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [demoActive, setDemoActive] = useState(false);
  const [evaluation, setEvaluation] = useState<LocalTrapEvaluation | null>(null);
  const correct = choice === "solved_wrong_value";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = readFromStorage<SavedForge>("trap-forge-v1", EMPTY_FORGE);
      setChoice(saved.choice);
      setComplete(saved.complete);
      setRewarded(saved.rewarded);
      setDemoActive(Boolean(readDemoProfile()?.enabled));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function finish() {
    if (!choice || complete) return;
    const score = evaluateLocalTrap({
      trap: correct ? "2" : "4",
      correctAnswer: "4",
      existingChoices: ["1", "3", "5"],
      explanation: correct ? "The solver found x instead of the requested y-value." : "This does not describe the requested-value trap.",
      category: correct ? "solved_wrong_value" : "unknown",
    });
    const prior = readFromStorage<SavedForge>("trap-forge-v1", EMPTY_FORGE);
    const shouldAward = demoActive && correct && !prior.rewarded;
    setEvaluation(score);
    const impact = readPatternImpact();
    if (impact) savePatternImpact({ ...impact, afterForge: Math.max(0, (impact.afterFollowUp ?? impact.before) - (correct ? 8 : 0)), forgeRecognized: correct });
    if (shouldAward) {
      const profile = readDemoProfile() ?? fictionalDemoProfile;
      writeToStorage("demo-profile-v1", { ...profile, xp: profile.xp + 20, trapForgeRounds: profile.trapForgeRounds + 1, achievementKeys: [...new Set([...profile.achievementKeys, "convincing-trap"])] });
    }
    writeToStorage<SavedForge>("trap-forge-v1", { complete: true, choice, correct, rewarded: prior.rewarded || shouldAward });
    setRewarded(prior.rewarded || shouldAward);
    setComplete(true);
  }

  return <main className="mx-auto max-w-3xl px-4 py-10"><p className="text-sm font-semibold uppercase text-indigo-700">Trap Forge · Local evaluation</p><h1 className="mt-2 text-3xl font-bold">Recognize a tempting wrong answer.</h1><p className="mt-3 text-slate-600">For the equation x + y = 6 and y = x², a student finds x = 2 and stops. Which trap created that wrong final answer?</p><fieldset className="mt-6 grid gap-3"><legend className="font-semibold">Choose the trap</legend>{[["wrong_operation", "Used the wrong operation"], ["solved_wrong_value", "Solved for x instead of the requested y-value"], ["calculation_error", "Made an arithmetic calculation error"]].map(([value, label]) => <label key={value} className="flex gap-3 rounded-lg border bg-white p-4"><input type="radio" name="trap" value={value} checked={choice === value} disabled={complete} onChange={() => setChoice(value)} />{label}</label>)}</fieldset>{!complete ? <button onClick={finish} disabled={!choice} className="mt-6 rounded-md bg-indigo-700 px-5 py-3 font-semibold text-white disabled:bg-slate-300">Evaluate trap</button> : <section className={`mt-6 rounded-xl border p-5 ${correct ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} aria-live="polite"><h2 className="text-xl font-bold">{correct ? (rewarded ? "Trap recognition improved — +20 demo XP" : "Trap recognition improved") : "A useful distractor needs a precise mistake"}</h2><p className="mt-2 text-slate-700">The student correctly found x = 2, but the prompt asks for y. Their answer came from solving the wrong value.</p>{evaluation && <p className="mt-2 text-sm text-slate-700"><strong>Local Trap Evaluation:</strong> {evaluation.overallTrapScore}/100 · {evaluation.feedback}</p>}{correct && !rewarded && !demoActive && <p className="mt-2 text-sm text-slate-600">Local practice is complete. XP is shown only for the clearly labeled fictional judge demo.</p>}<Link href="/impact" className="mt-4 inline-flex rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">See before-and-after impact</Link></section>}</main>;
}
