"use client";

import { GuestAccessLink } from "@/components/GuestAccessLink";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { readPatternImpact, type PatternImpact } from "@/lib/mistakeTwinProgress";

export default function ImpactPage() {
  const { dataScope, loading } = useAuth();
  const judgeDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("judgeDemo") === "1";
  const impactScope = judgeDemo ? "guest" : dataScope;
  const [impact, setImpact] = useState<PatternImpact | null>(null);

  useEffect(() => {
    if (loading) return;
    const frame = window.requestAnimationFrame(() => setImpact(readPatternImpact(impactScope)));
    return () => window.cancelAnimationFrame(frame);
  }, [dataScope, impactScope, loading]);

  if (loading) return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-bold">Checking your learning data</h1></main>;
  if (!impact) return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-bold">No pattern change yet</h1><p className="mt-3 text-slate-600">Complete a Mistake Twin follow-up and Trap Forge round to see before-and-after impact.</p><GuestAccessLink href="/diagnostic" className="mt-6 inline-flex rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white">Start diagnostic</GuestAccessLink></main>;

  const after = impact.afterForge ?? impact.afterFollowUp ?? impact.before;
  const change = impact.before - after;
  const forgeStatus = impact.forgeRecognized === true ? "built a valid distractor around the same pattern" : impact.forgeRecognized === false ? "needs a revised distractor" : "not completed yet";
  return <main className="mx-auto max-w-4xl px-4 py-10"><p className="text-sm font-semibold uppercase text-indigo-700">Mistake Twin impact</p><h1 className="mt-2 text-3xl font-bold">You corrected the reasoning pattern—not just one answer.</h1><p className="mt-3 text-slate-600">Trapwise mastery is an internal learning estimate, not an official SAT score.</p><section className="mt-8 rounded-2xl border border-indigo-200 bg-indigo-50 p-6"><h2 className="text-2xl font-bold capitalize">{impact.category.replaceAll("_", " ")}</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat label="Before" value={`${impact.before}%`} /><Stat label="After" value={`${after}%`} /><Stat label="Pattern weakened" value={`${Math.max(0, change)} points`} /></div><p className="mt-6 text-slate-700">Follow-up: {impact.followUpCorrect ? "correctly applied the counter-strategy" : "needs another verified attempt"}. Trap Forge: {forgeStatus}.</p><p className="mt-3 text-sm text-slate-600">Skill practiced: {impact.skill}. Recommended next step: repeat the exact-value check on a slightly different problem.</p></section><div className="mt-6 flex gap-3"><GuestAccessLink href="/progress" className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">View progress</GuestAccessLink><GuestAccessLink href="/daily" className="rounded-md border border-slate-300 px-4 py-2 font-semibold">Continue practice</GuestAccessLink></div></main>;
}

function Stat({ label, value }: { label: string; value: string }) { return <article className="rounded-xl bg-white p-4"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></article>; }
