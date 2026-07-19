"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetDemoMode, startDemoMode } from "@/lib/demoMode";

export function DemoControls() {
  const router = useRouter();
  const [notice, setNotice] = useState("");

  function startDemo() {
    startDemoMode();
    setNotice("Fictional demo profile loaded. The five-question judge diagnostic opens next; Question 1, choice C reliably reveals the Solved Wrong Value pattern.");
    window.setTimeout(() => router.push("/diagnostic?judgeDemo=1"), 500);
  }

  return <div className="mt-5"><div className="flex flex-wrap gap-3"><button type="button" data-testid="start-judge-demo" onClick={startDemo} className="inline-flex min-h-11 items-center justify-center rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900">Try Judge Demo</button><button type="button" data-testid="reset-demo-data" onClick={() => { resetDemoMode(); setNotice("Fictional demo data reset. Your saved local progress was restored when available."); router.refresh(); }} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">Reset Demo Data</button></div><p className="mt-2 max-w-xl text-sm text-slate-600">Loads a fictional Trapwise profile so you can explore the Mistake Twin, progress, achievements, and leaderboards without creating an account.</p>{notice && <p role="status" className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{notice}</p>}</div>;
}
