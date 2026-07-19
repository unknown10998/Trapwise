"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { readDemoProfile } from "@/lib/demoMode";

const rows = [{ rank: 1, name: "Jordan S.", level: 5, score: "920 XP", streak: 8 }, { rank: 2, name: "Mina R.", level: 4, score: "810 XP", streak: 6 }, { rank: 3, name: "Theo K.", level: 4, score: "760 XP", streak: 4 }, { rank: 4, name: "Avery Park (Demo)", level: 3, score: "640 XP", streak: 5 }];

export default function LeaderboardPage() {
  const { configured, user } = useAuth();
  const [demoActive, setDemoActive] = useState(false);
  useEffect(() => { const frame = window.requestAnimationFrame(() => setDemoActive(Boolean(readDemoProfile()?.enabled))); return () => window.cancelAnimationFrame(frame); }, []);
  return <main className="mx-auto max-w-5xl px-4 py-10"><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-semibold uppercase text-emerald-700">Leaderboard</p><span className="rounded-full bg-indigo-700 px-3 py-1 text-xs font-bold tracking-wide text-white">DEMO DATA</span></div><h1 className="mt-2 text-3xl font-bold">Celebrate consistent learning</h1><p className="mt-3 max-w-2xl text-slate-600">This leaderboard uses fictional demonstration profiles. No email addresses or private Mistake Twin details are shown.</p><section className="mt-8 rounded-xl border bg-white p-5"><h2 className="font-bold">Weekly XP · Fictional demo data</h2><ol className="mt-4 grid gap-2">{rows.map((row) => <li key={row.rank} className={`flex flex-wrap items-center justify-between gap-3 rounded-md p-3 ${row.rank <= 3 ? "bg-amber-50" : "bg-slate-50"} ${demoActive && row.rank === 4 ? "ring-2 ring-indigo-500" : ""}`} aria-label={`Rank ${row.rank}: ${row.name}, level ${row.level}, ${row.score}, ${row.streak}-day streak`}><span><strong>#{row.rank}</strong> · {row.name}{demoActive && row.rank === 4 ? " · Your demo profile" : ""}</span><span className="text-right text-sm"><strong>{row.score}</strong><span className="ml-2 text-slate-600">Level {row.level} · 🔥 {row.streak}</span></span></li>)}</ol></section>{!configured && <p className="mt-5 text-sm text-slate-600">This is a safe guest demo. Cloud rankings remain opt-in and are not required to test Trapwise.</p>}{user && <Link href="/settings" className="mt-4 inline-flex font-semibold text-emerald-700">Open privacy settings</Link>}</main>;
}
