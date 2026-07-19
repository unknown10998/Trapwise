"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const navigationEvent = "trapwise:navigation-loading";

export function startRouteLoadingGlint() {
  window.dispatchEvent(new Event(navigationEvent));
}

export function RouteLoadingGlint({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    function showLoading() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setLoading(true);
      timerRef.current = window.setTimeout(() => setLoading(false), 850);
    }

    window.addEventListener(navigationEvent, showLoading);
    return () => {
      window.removeEventListener(navigationEvent, showLoading);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!loading) return <>{children}</>;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8" aria-busy="true" aria-live="polite">
      <p className="sr-only">Loading page</p>
      <div className="route-loading-glint h-24 w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
      <div className="route-loading-glint mt-6 min-h-[32rem] w-full rounded-xl border border-slate-200 bg-white shadow-sm" />
    </main>
  );
}
