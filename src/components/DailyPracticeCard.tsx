"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getStreak, localDate, readDailySession, readProgressHistory } from "@/lib/dailyPractice";

export function DailyPracticeCard() {
  const [state, setState] = useState({ mastery: 50, streak: 0, complete: false, target: "your next skill" });
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const history = readProgressHistory(); const session = readDailySession(); const today = localDate();
      setState({ mastery: history.sessions.at(-1)?.masteryAfter ?? 50, streak: getStreak(history).active, complete: session?.date === today && session.isComplete, target: session?.targetSkill ?? "your next skill" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase text-emerald-700">Daily Practice</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Keep your momentum.</h2></div><span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-800">🔥 {state.streak}</span></div><p className="mt-4 leading-7 text-slate-600">Today&apos;s target: <strong>{state.target}</strong>. Your current Trapwise Mastery is {state.mastery}.</p><Link href="/daily" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">{state.complete ? "Review Today’s Results" : "Start Daily Practice"}</Link></article>;
}
