"use client";

import { useEffect, useRef, useState } from "react";
import { getSoundVolume, playCorrectAnswerSound, setSoundVolume } from "@/lib/sounds";
import { notifyStorageChange, subscribeToStorage } from "@/lib/storage";

const themes = [
  { id: "signal", name: "Signal Garden", description: "Crisp mint, ink, and notebook cream." },
  { id: "midnight", name: "Midnight Circuit", description: "Deep navy with electric cyan." },
  { id: "paper", name: "Paper Pop", description: "Warm paper, coral, and cobalt." },
  { id: "tilt", name: "Tilt Lab", description: "Playful lilac with skewed study cards." },
] as const;

type ThemeId = (typeof themes)[number]["id"];
const isTheme = (value: string | null): value is ThemeId => themes.some((theme) => theme.id === value);
const themePalette: Record<ThemeId, { background: string; foreground: string }> = {
  signal: { background: "#f3f5ef", foreground: "#18221d" },
  midnight: { background: "#0d1726", foreground: "#eaf4ff" },
  paper: { background: "#fff3df", foreground: "#302334" },
  tilt: { background: "#eeeaff", foreground: "#261f45" },
};

function readTheme(): ThemeId {
  if (typeof window === "undefined") return "signal";
  const stored = window.localStorage.getItem("trapwise:theme");
  return isTheme(stored) ? stored : "signal";
}

function applyTheme(theme: ThemeId) {
  const palette = themePalette[theme];
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("trapwise-dark", theme === "midnight");
  document.documentElement.style.backgroundColor = palette.background;
  document.body.classList.toggle("trapwise-dark", theme === "midnight");
  document.body.style.backgroundColor = palette.background;
  document.body.style.color = palette.foreground;
  document.body.style.background = theme === "midnight" ? palette.background : "";
}

export function ThemeController() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => subscribeToStorage("theme", () => setTheme(readTheme())), []);

  return null;
}

export function SettingsGearIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.9]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 2.7h3.4l.5 2.1a7.7 7.7 0 0 1 1.6.9l2.1-.7 1.7 2.9-1.6 1.5c.1.6.1 1.1 0 1.7l1.6 1.5-1.7 2.9-2.1-.7a7.7 7.7 0 0 1-1.6.9l-.5 2.1h-3.4l-.5-2.1a7.7 7.7 0 0 1-1.6-.9l-2.1.7-1.7-2.9 1.6-1.5a6.5 6.5 0 0 1 0-1.7L4.3 7.9 6 5l2.1.7a7.7 7.7 0 0 1 1.6-.9l.6-2.1Z" />
    <circle cx="12" cy="12" r="2.8" />
  </svg>;
}

export function ThemeSettings() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);
  const [volume, setVolume] = useState(() => getSoundVolume());
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => subscribeToStorage("theme", () => setTheme(readTheme())), []);

  useEffect(() => () => {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
  }, []);

  function chooseTheme(nextTheme: ThemeId) {
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    document.documentElement.classList.add("theme-transitioning");
    setTheme(nextTheme);
    window.localStorage.setItem("trapwise:theme", nextTheme);
    notifyStorageChange("theme");
    transitionTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
      transitionTimer.current = null;
    }, 800);
  }

  return <section className="theme-settings-panel rounded-2xl border p-5 shadow-sm" aria-labelledby="study-atmosphere-heading">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Theme settings</p>
    <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id="study-atmosphere-heading" className="text-xl font-bold">Study atmosphere</h2>
        <p className="mt-1 text-sm opacity-75">Choose a visual rhythm that makes practice feel like yours.</p>
      </div>
      <span className="rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: "var(--line)" }}>{themes.find((option) => option.id === theme)?.name}</span>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {themes.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => chooseTheme(option.id)}
          aria-pressed={theme === option.id}
          className={`theme-option flex min-h-20 items-center gap-3 rounded-xl p-3 text-left ${theme === option.id ? "theme-option-active" : ""}`}
        >
          <span className={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true" />
          <span>
            <span className="block text-sm font-bold">{option.name}</span>
            <span className="block pt-0.5 text-xs opacity-75">{option.description}</span>
          </span>
        </button>
      ))}
    </div>
    <div className="mt-5 border-t pt-4" style={{ borderColor: "var(--line)" }}>
      <div className="flex items-center justify-between gap-3"><label htmlFor="sound-volume" className="text-sm font-bold">Celebration volume</label><span className="text-xs font-semibold">{Math.round(volume * 100)}%</span></div>
      <input id="sound-volume" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(event) => { const next = Number(event.target.value) / 100; setVolume(next); setSoundVolume(next); }} className="mt-3 w-full accent-[var(--accent)]" />
      <button type="button" onClick={playCorrectAnswerSound} className="mt-2 text-sm font-semibold underline underline-offset-4">Preview success cheer</button>
    </div>
  </section>;
}
