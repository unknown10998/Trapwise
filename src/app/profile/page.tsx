"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getStreak, readProgressHistory } from "@/lib/dailyPractice";
import { readDemoProfile, type DemoProfile } from "@/lib/demoMode";
import type { ProgressHistory } from "@/types/progress";

type Snapshot = { demo: DemoProfile | null; history: ProgressHistory };
const empty: Snapshot = { demo: null, history: { version: 1, sessions: [] } };

export default function ProfilePage() {
  const { configured, user } = useAuth();
  const [snapshot, setSnapshot] = useState(empty);
  useEffect(() => { const frame = window.requestAnimationFrame(() => setSnapshot({ demo: readDemoProfile(), history: readProgressHistory() })); return () => window.cancelAnimationFrame(frame); }, []);
  const demo = snapshot.demo?.enabled ? snapshot.demo : null;
  const latest = snapshot.history.sessions.at(-1);
  const streak = getStreak(snapshot.history);
  const name = demo?.name ?? String(user?.user_metadata.display_name ?? (user ? "Trapwise learner" : "Local learner"));
  const mastery = demo?.mastery ?? latest?.masteryAfter ?? 0;
  const level = demo?.level ?? 1;
  const xp = demo?.xp ?? 0;
  const achievements = demo?.achievementKeys.length ?? 0;

  return <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"><p className="text-sm font-semibold uppercase text-emerald-700">Your profile</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{name}</h1><p className="mt-3 max-w-3xl text-slate-600">Your learning snapshot stays local unless you choose to connect a configured account. Trapwise Mastery is an internal learning estimate, not an official SAT score.</p>{demo && <p className="mt-4 w-fit rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">Fictional demo profile · local preview</p>}<section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Card label="Level" value={`Level ${level}`} detail={demo ? "fictional demo level" : "local practice starts here"} /><Card label="XP" value={String(xp)} detail={demo ? "fictional demo XP" : "available in the fictional demo"} /><Card label="Current streak" value={`${demo?.streak ?? streak.active} days`} detail={`Best: ${streak.longest} days`} /><Card label="Achievements" value={`${achievements} unlocked`} detail={demo ? "fictional demo data" : "view the learning catalog"} /></section><section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-sm font-semibold uppercase text-emerald-700">Learning snapshot</p><h2 className="mt-2 text-2xl font-bold text-slate-950">{latest ? "What your recent practice shows" : "Your first learning signal starts with practice"}</h2>{latest ? <div className="mt-5 grid gap-3 sm:grid-cols-2"><Metric label="Trapwise Mastery" value={`${mastery}%`} /><Metric label="Strongest skill" value={latest.strongestSkill} /><Metric label="Focus next" value={latest.weakestSkill} /><Metric label="Pattern corrected" value={latest.correctedMistakes > 0 ? `${latest.correctedMistakes} this session` : "Keep gathering evidence"} /></div> : <p className="mt-4 leading-7 text-slate-600">Complete a diagnostic or daily practice set to see your strongest skill, next focus, and pattern evidence here.</p>}</article><article className="rounded-xl border border-indigo-200 bg-indigo-50 p-6"><p className="text-sm font-semibold uppercase text-indigo-700">Next action</p><h2 className="mt-2 text-2xl font-bold text-slate-950">Keep the loop moving.</h2><p className="mt-3 leading-7 text-slate-700">Practice a skill, spot the trap, train the weakness, then return to see the pattern change.</p><div className="mt-5 flex flex-wrap gap-3"><Link href={latest ? "/progress" : "/diagnostic"} className="inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-700 px-4 py-2 font-semibold text-white">{latest ? "View progress" : "Start Diagnostic"}</Link><Link href="/achievements" className="inline-flex min-h-11 items-center justify-center rounded-md border border-indigo-300 px-4 py-2 font-semibold text-indigo-900">View achievements</Link></div></article></section>{configured && user && <Link href="/settings" className="mt-6 inline-flex font-semibold text-emerald-700 hover:underline">Manage account privacy settings</Link>}</main>;
}

function Card({ label, value, detail }: { label: string; value: string; detail: string }) { return <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 text-xl font-bold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-600">{detail}</p></article>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-1 font-bold text-slate-950">{value}</p></div>; }
