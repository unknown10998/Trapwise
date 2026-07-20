"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { readFromStorage, writeToStorage } from "@/lib/storage";

const steps = [
  { title: "Take a short adaptive diagnostic.", detail: "Start here. Pick an answer and confidence level so Trapwise has real learning evidence.", href: "/diagnostic", action: "Go to Diagnostic" },
  { title: "Meet the mistake pattern holding you back.", detail: "After a diagnostic miss, Results reveals the distractor pattern your Mistake Twin is tracking.", href: "/results", action: "Open Results" },
  { title: "Practice the exact skill behind that pattern.", detail: "Use the verified follow-up to apply the counter-strategy on a new question.", href: "/follow-up", action: "Open Follow-Up" },
  { title: "Forge a tempting wrong answer and track your improvement.", detail: "Finish with Trap Forge, then continue to the impact screen to see the pattern change.", href: "/trap-forge", action: "Open Trap Forge" },
] as const;

export function Onboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setOpen(!readFromStorage("onboarding-complete-v1", false)));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const close = () => { writeToStorage("onboarding-complete-v1", true); setOpen(false); };
  const moveToStep = (nextIndex: number) => { setIndex(nextIndex); router.push(steps[nextIndex].href); };

  // The guided tour is account-oriented; guest mode keeps local practice focused and uncluttered.
  if (!user) return null;
  if (!open) return null;
  const step = steps[index];
  return <section className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8" aria-label="Getting started"><div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase text-indigo-700">Guided tour · {index + 1}/4</p><h2 className="mt-2 text-xl font-bold text-slate-950">{step.title}</h2><p className="mt-2 text-sm text-slate-700">{step.detail}</p></div><button type="button" onClick={close} className="text-sm font-semibold text-indigo-800">Skip</button></div><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => { router.push(step.href); if (index === steps.length - 1) close(); else setIndex((current) => current + 1); }} className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">{index === steps.length - 1 ? "Finish at Trap Forge" : step.action}</button><button type="button" disabled={index === 0} onClick={() => moveToStep(index - 1)} className="rounded-md border border-indigo-300 px-4 py-2 text-sm font-semibold disabled:opacity-50">Back</button></div></div></section>;
}
