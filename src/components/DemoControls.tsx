"use client";
import { useRouter } from "next/navigation";
import { resetDemoMode, startDemoMode } from "@/lib/demoMode";
export function DemoControls() { const router = useRouter(); return <div className="flex flex-wrap gap-3"><button type="button" onClick={() => { startDemoMode(); router.push("/progress"); }} className="rounded-md border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-900">Load Fictional Demo Data</button><button type="button" onClick={() => { resetDemoMode(); router.refresh(); }} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Reset Demo Data</button></div>; }
