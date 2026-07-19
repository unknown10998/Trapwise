"use client";

import { useEffect, useMemo, useState } from "react";
import { achievementDefinitions } from "@/lib/achievementEngine";
import { readDemoProfile } from "@/lib/demoMode";

type Filter = "all" | "unlocked" | "in-progress" | "locked";

export default function AchievementsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [demoKeys, setDemoKeys] = useState<string[]>([]);
  const [demoActive, setDemoActive] = useState(false);
  useEffect(() => { const frame = window.requestAnimationFrame(() => { const demo = readDemoProfile(); setDemoKeys(demo?.achievementKeys ?? []); setDemoActive(Boolean(demo?.enabled)); }); return () => window.cancelAnimationFrame(frame); }, []);
  const cards = useMemo(() => achievementDefinitions.filter((achievement) => {
    const unlocked = demoKeys.includes(achievement.key);
    const status: Filter = unlocked ? "unlocked" : achievement.hidden ? "locked" : "in-progress";
    return filter === "all" || status === filter;
  }), [demoKeys, filter]);

  return <main className="mx-auto max-w-6xl px-4 py-10"><p className="text-sm font-semibold uppercase text-emerald-700">Achievements</p><h1 className="mt-2 text-3xl font-bold">Build learning momentum</h1><p className="mt-3 text-slate-600">Achievement progress is shown locally for the fictional demo profile. It never changes a signed-in account.</p>{demoActive && <p className="mt-4 w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">Fictional demo profile · Demo preview</p>}<div className="mt-6 flex flex-wrap gap-2" aria-label="Achievement filter">{(["all", "unlocked", "in-progress", "locked"] as Filter[]).map((option) => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className={`rounded-md px-3 py-2 text-sm font-semibold ${filter === option ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-700"}`}>{option.replace("-", " ")}</button>)}</div><section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map((achievement) => { const unlocked = demoKeys.includes(achievement.key); const status = unlocked ? "Unlocked" : achievement.hidden ? "Hidden" : demoActive ? "Demo preview" : "Locked"; return <article key={achievement.key} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-2xl" aria-hidden>🏅</p><div className="mt-3 flex items-start justify-between gap-3"><h2 className="font-bold">{achievement.hidden && !unlocked ? "Hidden achievement" : achievement.name}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">{status}</span></div><p className="mt-2 text-sm text-slate-600">{achievement.hidden && !unlocked ? "Keep learning to reveal this badge." : achievement.description}</p><p className="mt-3 text-xs font-semibold uppercase text-emerald-700">{achievement.xpReward} XP · {achievement.category}</p>{unlocked ? <p className="mt-3 text-sm font-semibold text-emerald-800">Unlocked in fictional demo data</p> : <p className="mt-3 text-sm text-slate-600">Progress: not yet tracked in cloud mode.</p>}</article>; })}</section>{cards.length === 0 && <p className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-slate-600">No achievements match this filter. Choose All to view the full catalog.</p>}</main>;
}
