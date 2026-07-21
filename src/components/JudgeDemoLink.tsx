"use client";

import Link from "next/link";
import { startDemoMode } from "@/lib/demoMode";
import { useAuth } from "@/components/AuthProvider";

export function JudgeDemoLink() {
  const { continueAsGuest } = useAuth();
  return <Link href="/diagnostic?judgeDemo=1" onClick={() => { continueAsGuest(); startDemoMode(); }} className="inline-flex min-h-12 items-center justify-center rounded-md bg-indigo-700 px-5 py-3 font-semibold text-white">Start Judge Flow</Link>;
}
