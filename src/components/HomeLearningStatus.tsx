"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStreak, localDate, readDailySession, readProgressHistory } from "@/lib/dailyPractice";
import { readDemoProfile, type DemoProfile } from "@/lib/demoMode";

type Status = { demo: DemoProfile | null; streak: number; bestStreak: number; completedToday: boolean; sessions: number };
const emptyStatus: Status = { demo: null, streak: 0, bestStreak: 0, completedToday: false, sessions: 0 };

export function HomeLearningStatus() {
  const [status, setStatus] = useState(emptyStatus);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const history = readProgressHistory();
      const streak = getStreak(history);
      const session = readDailySession();
      setStatus({ demo: readDemoProfile(), streak: streak.active, bestStreak: streak.longest, completedToday: session?.date === localDate() && session.isComplete, sessions: history.sessions.length });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const demo = status.demo?.enabled ? status.demo : null;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Learning status">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold uppercase text-emerald-700">Your learning rhythm</p><h2 className="mt-1 text-xl font-bold text-slate-950">{status.completedToday ? "Today’s practice is complete." : "A short practice set is ready when you are."}</h2></div>{demo && <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-900">Level {demo.level} · {demo.xp} XP</span>}</div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Stat label="Current streak" value={`${demo?.streak ?? status.streak} day${(demo?.streak ?? status.streak) === 1 ? "" : "s"}`} /><Stat label="Best streak" value={`${status.bestStreak} day${status.bestStreak === 1 ? "" : "s"}`} /><Stat label="Practice records" value={String(status.sessions)} /></div>
    <p className="mt-4 text-sm leading-6 text-slate-600">{status.completedToday ? "Nice work. Your next daily set will be ready tomorrow; you can still review your progress today." : "Keep the loop simple: practice a skill, notice the trap, train the weakness, and return when you’re ready."}</p>
    <Link href={status.completedToday ? "/progress" : "/daily"} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">{status.completedToday ? "View progress" : "Start Daily Practice"}</Link>
  </section>;
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-950">{value}</p></div>; }
