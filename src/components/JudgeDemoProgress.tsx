"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { readDemoProfile } from "@/lib/demoMode";
import { useAuth } from "@/components/AuthProvider";

const steps = [
  { route: "/diagnostic", label: "Diagnostic" },
  { route: "/results", label: "Mistake Twin" },
  { route: "/follow-up", label: "Follow-Up" },
  { route: "/trap-forge", label: "Trap Forge" },
  { route: "/impact", label: "Progress" },
] as const;

export function JudgeDemoProgress() {
  const pathname = usePathname();
  const { dataScope, loading } = useAuth();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setActive(Boolean(readDemoProfile(dataScope)?.enabled)));
    return () => window.cancelAnimationFrame(frame);
  }, [dataScope, pathname]);

  const stepIndex = steps.findIndex((step) => step.route === pathname);
  if (loading) return null;
  if (!active || stepIndex < 0) return null;

  const step = steps[stepIndex];
  return (
    <aside className="border-b border-indigo-200 bg-indigo-50" aria-label="Judge demo progress">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-sm sm:px-6 lg:px-8">
        <strong className="font-semibold text-indigo-950">Judge Demo</strong>
        <span className="text-indigo-800">Step {stepIndex + 1} of {steps.length} — {step.label}</span>
        <span className="text-xs text-indigo-700">Fictional local profile; no account or external service is used.</span>
      </div>
    </aside>
  );
}
