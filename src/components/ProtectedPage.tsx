"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth(); const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`); }, [loading, user, router]);
  if (!configured) return <main className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-2xl font-bold">Account features need Supabase setup</h1><p className="mt-3 text-slate-600">Add the public Supabase URL and anon key to .env.local. Local study features remain available.</p></main>;
  if (loading || !user) return <main className="mx-auto max-w-3xl px-4 py-10"><p className="text-slate-600">Checking your account…</p></main>;
  return <>{children}</>;
}
