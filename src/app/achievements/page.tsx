"use client";

import { useEffect, useMemo, useState } from "react";
import { achievementDefinitions, type AchievementDefinition } from "@/lib/achievementEngine";
import { readDemoProfile } from "@/lib/demoMode";
import { useAuth } from "@/components/AuthProvider";

type Filter = "all" | "unlocked" | "in-progress" | "locked";
const categorySections = [
  { key: "getting-started", title: "Getting started", description: "Your first signals, setup steps, and Mistake Twin discoveries." },
  { key: "accuracy", title: "Accuracy wins", description: "Reward careful answers, ambitious difficulty, and clean practice sets." },
  { key: "improvement", title: "Improvement lab", description: "Show that you can weaken a pattern and turn evidence into growth." },
  { key: "streak", title: "Streak studio", description: "Build a repeatable practice rhythm one day at a time." },
  { key: "forge", title: "Trap Forge", description: "Create believable distractors and explain the trap behind them." },
  { key: "visual", title: "Visual reasoning", description: "Read graphs, tables, diagrams, and the details hiding in them." },
  { key: "hidden", title: "Hidden discoveries", description: "A few deeper goals reveal themselves through consistent habits." },
] as const;

export default function AchievementsPage() {
  const { dataScope } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [demoKeys, setDemoKeys] = useState<string[]>([]);
  const [demoActive, setDemoActive] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const demo = readDemoProfile(dataScope);
      setDemoKeys(demo?.achievementKeys ?? []);
      setDemoActive(Boolean(demo?.enabled));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [dataScope]);

  const summary = useMemo(() => ({
    unlocked: achievementDefinitions.filter((achievement) => demoKeys.includes(achievement.key)).length,
    hidden: achievementDefinitions.filter((achievement) => achievement.hidden && !demoKeys.includes(achievement.key)).length,
    categories: categorySections.length - 1,
  }), [demoKeys]);

  const cards = useMemo(() => achievementDefinitions.filter((achievement) => {
    const unlocked = demoKeys.includes(achievement.key);
    const status: Filter = unlocked ? "unlocked" : achievement.hidden ? "locked" : "in-progress";
    return filter === "all" || status === filter;
  }), [demoKeys, filter]);

  const groups = useMemo(() => categorySections.map((section) => ({
    ...section,
    achievements: cards.filter((achievement) => achievement.category === section.key),
  })).filter((section) => section.achievements.length > 0), [cards]);

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <p className="text-sm font-semibold uppercase text-emerald-700">Achievements</p>
    <h1 className="mt-2 text-3xl font-bold text-slate-950">Build learning momentum</h1>
    <p className="mt-3 max-w-3xl text-slate-600">Achievements mark meaningful learning actions—not official SAT scores. They stay local in the fictional demo until cloud achievement tracking is configured.</p>
    {demoActive && <p className="mt-4 w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">Fictional demo profile · Demo preview</p>}

    <section className="mt-7 grid gap-3 sm:grid-cols-3" aria-label="Achievement summary">
      <Summary label="Unlocked" value={`${summary.unlocked}/${achievementDefinitions.length}`} detail={demoActive ? "shown in demo data" : "local tracking begins in demo mode"} />
      <Summary label="Achievement sections" value={String(summary.categories)} detail="organized by the kind of progress" />
      <Summary label="Hidden goals" value={String(summary.hidden)} detail="revealed when their learning action is complete" />
    </section>

    <div className="mt-7 flex flex-wrap gap-2" aria-label="Achievement filter">
      {(["all", "unlocked", "in-progress", "locked"] as Filter[]).map((option) => <button key={option} type="button" aria-pressed={filter === option} onClick={() => setFilter(option)} className={`min-h-11 rounded-md px-3 py-2 text-sm font-semibold ${filter === option ? "bg-emerald-600 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{option.replace("-", " ")}</button>)}
    </div>

    <div className="mt-9 grid gap-10">
      {groups.map((section) => <section key={section.key} aria-labelledby={`achievement-section-${section.key}`}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-3">
          <div><p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{section.achievements.length} goal{section.achievements.length === 1 ? "" : "s"}</p><h2 id={`achievement-section-${section.key}`} className="mt-1 text-2xl font-bold text-slate-950">{section.title}</h2><p className="mt-2 max-w-2xl text-sm text-slate-600">{section.description}</p></div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{section.achievements.map((achievement) => <AchievementCard key={achievement.key} achievement={achievement} unlocked={demoKeys.includes(achievement.key)} demoActive={demoActive} />)}</div>
      </section>)}
    </div>
    {groups.length === 0 && <p className="mt-8 rounded-lg border border-slate-200 bg-white p-5 text-slate-600">No achievements match this filter. Choose All to view the full catalog.</p>}
  </main>;
}

function AchievementCard({ achievement, unlocked, demoActive }: { achievement: AchievementDefinition; unlocked: boolean; demoActive: boolean }) {
  const status = unlocked ? "Unlocked" : achievement.hidden ? "Hidden" : demoActive ? "Demo preview" : "In progress";
  return <article className={`rounded-xl border p-5 shadow-sm ${unlocked ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
    <div className="flex items-start justify-between gap-3"><div><p className="text-2xl" aria-hidden>🏅</p><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">{achievement.category.replace("-", " ")}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">{status}</span></div>
    <h3 className="mt-3 font-bold text-slate-950">{achievement.hidden && !unlocked ? "Hidden achievement" : achievement.name}</h3>
    <p className="mt-2 text-sm leading-6 text-slate-600">{achievement.hidden && !unlocked ? "Keep practicing to reveal this achievement." : achievement.description}</p>
    <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="font-semibold text-slate-700">{achievement.xpReward} XP</span><span className="text-slate-600">Goal: {achievement.target}</span></div>
    {unlocked ? <p className="mt-3 text-sm font-semibold text-emerald-800">Unlocked in fictional demo data</p> : <p className="mt-3 text-sm text-slate-600">{demoActive ? "Preview the learning goal in the fictional demo." : "Progress will appear here when achievement tracking is configured."}</p>}
  </article>;
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-600">{detail}</p></article>; }
