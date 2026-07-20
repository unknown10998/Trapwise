"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import trapwiseLogo from "../../logo.png";

export function AuthFormShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { continueAsGuest } = useAuth();
  return <main className="mx-auto max-w-md px-4 py-12"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><Link href="/" className="brand-mark inline-flex items-center gap-2 text-lg font-semibold" aria-label="Trapwise home"><span className="relative h-8 w-6 shrink-0 overflow-hidden rounded-md" aria-hidden><Image src={trapwiseLogo} alt="" className="brand-logo-image absolute left-0 top-1/2 h-12 w-auto max-w-none -translate-y-1/2 object-left" /></span><span>Trapwise</span></Link><p className="mt-5 text-sm font-semibold uppercase text-emerald-700">Trapwise account</p><h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>{children}</section><div className="mt-5 text-center text-sm text-slate-600"><Link href="/" onClick={continueAsGuest} className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-4 py-2 font-semibold text-emerald-700 hover:underline">Continue as Guest</Link><p className="mt-2">Guest mode unlocks local practice without creating an account.</p></div></main>;
}
