"use client";

import { useMemo, useState } from "react";
import type { ProgressRecord } from "@/types/progress";

type Range = "day" | "month" | "year";
type Point = { label: string; mastery: number; sessions: number; accuracy: number; change: number };

function groupSessions(sessions: ProgressRecord[], range: Range): Point[] {
  const grouped = new Map<string, ProgressRecord[]>();
  for (const session of sessions) {
    const label = range === "day" ? session.date : range === "month" ? session.date.slice(0, 7) : session.date.slice(0, 4);
    grouped.set(label, [...(grouped.get(label) ?? []), session]);
  }
  return [...grouped.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([label, entries]) => {
    const latest = entries.at(-1)!;
    return { label, mastery: latest.masteryAfter, sessions: entries.length, accuracy: Math.round(entries.reduce((sum, item) => sum + item.accuracy, 0) / entries.length), change: entries.reduce((sum, item) => sum + item.masteryChange, 0) };
  });
}

export function ProgressTimeline({ sessions }: { sessions: ProgressRecord[] }) {
  const [range, setRange] = useState<Range>("day");
  const points = useMemo(() => groupSessions(sessions, range), [range, sessions]);
  const width = 660; const height = 210; const padding = 24;
  const line = points.map((point, index) => `${points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * (width - padding * 2)},${height - padding - (point.mastery / 100) * (height - padding * 2)}`).join(" ");
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase text-emerald-700">Learning timeline</p><h2 className="mt-1 text-xl font-bold text-slate-950">Day, month, and year momentum</h2></div><div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1" aria-label="Timeline range">{(["day", "month", "year"] as Range[]).map((option) => <button key={option} type="button" aria-pressed={range === option} onClick={() => setRange(option)} className={`rounded-md px-3 py-1.5 text-sm font-semibold capitalize ${range === option ? "bg-emerald-600 text-white" : "text-slate-600"}`}>{option}</button>)}</div></div>
      <svg className="mt-5 w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Trapwise mastery timeline by ${range}`}><path d={`M${padding} ${height - padding}H${width - padding}`} stroke="currentColor" opacity=".16" /><path d={`M${padding} ${height / 2}H${width - padding}`} stroke="currentColor" opacity=".1" /><polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{points.map((point, index) => <g key={point.label}><circle cx={points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * (width - padding * 2)} cy={height - padding - (point.mastery / 100) * (height - padding * 2)} r="6" fill="var(--accent)" /><text x={points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * (width - padding * 2)} y={height - 4} textAnchor="middle" fill="currentColor" opacity=".65" fontSize="11">{point.label.slice(5)}</text></g>)}</svg>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{points.slice(-6).reverse().map((point) => <li key={point.label} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"><span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-emerald-600" /><div><p className="font-semibold text-slate-950">{point.label}</p><p className="mt-1 text-sm text-slate-600">{point.sessions} session{point.sessions === 1 ? "" : "s"} • {point.accuracy}% accuracy • {point.change >= 0 ? "+" : ""}{point.change} mastery</p></div></li>)}</ol>
    </section>
  );
}
