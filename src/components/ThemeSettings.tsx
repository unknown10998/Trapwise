"use client";

import { useEffect, useState } from "react";

const themes = [
  { id: "signal", name: "Signal Garden", description: "Crisp mint, ink, and notebook cream." },
  { id: "midnight", name: "Midnight Circuit", description: "Deep navy with electric cyan." },
  { id: "paper", name: "Paper Pop", description: "Warm paper, coral, and cobalt." },
  { id: "tilt", name: "Tilt Lab", description: "Playful lilac with skewed study cards." },
] as const;

type ThemeId = (typeof themes)[number]["id"];
const isTheme = (value: string | null): value is ThemeId => themes.some((theme) => theme.id === value);

export function ThemeSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>(() => {
    if (typeof window === "undefined") return "signal";
    const stored = window.localStorage.getItem("trapwise:theme");
    return isTheme(stored) ? stored : "signal";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function chooseTheme(nextTheme: ThemeId) {
    setTheme(nextTheme);
    window.localStorage.setItem("trapwise:theme", nextTheme);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Choose a Trapwise theme"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="theme-gear inline-flex h-10 w-10 items-center justify-center rounded-full border text-slate-700 hover:text-slate-950"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.9]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 2.7h3.4l.5 2.1a7.7 7.7 0 0 1 1.6.9l2.1-.7 1.7 2.9-1.6 1.5c.1.6.1 1.1 0 1.7l1.6 1.5-1.7 2.9-2.1-.7a7.7 7.7 0 0 1-1.6.9l-.5 2.1h-3.4l-.5-2.1a7.7 7.7 0 0 1-1.6-.9l-2.1.7-1.7-2.9 1.6-1.5a6.5 6.5 0 0 1 0-1.7L4.3 7.9 6 5l2.1.7a7.7 7.7 0 0 1 1.6-.9l.6-2.1Z" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      </button>
      {isOpen && (
        <div className="theme-overlay fixed inset-0 z-40 grid place-items-center p-4" onClick={() => setIsOpen(false)}>
          <section
            className="theme-menu w-full max-w-sm rounded-2xl border p-4 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Theme settings"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 px-1 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Study atmosphere</p>
                <p className="pt-1 text-sm opacity-75">Choose a look that makes practice feel like yours.</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} className="theme-close rounded-full px-3 py-1 text-sm font-bold" aria-label="Close theme settings">
                Close
              </button>
            </div>
            <div className="grid gap-2">
              {themes.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseTheme(option.id)}
                  className={`theme-option flex items-center gap-3 rounded-xl p-3 text-left ${theme === option.id ? "theme-option-active" : ""}`}
                >
                  <span className={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-bold">{option.name}</span>
                    <span className="block pt-0.5 text-xs opacity-75">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
