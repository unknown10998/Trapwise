const volumeKey = "trapwise:sound-volume";
const celebrationStartSeconds = 1.5;
const celebrationDurationMs = 3_000;
let activeCelebration: HTMLAudioElement | null = null;
let celebrationStopTimer: number | null = null;

export function getSoundVolume() {
  if (typeof window === "undefined") return 0.55;
  const value = Number(window.localStorage.getItem(volumeKey));
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.55;
}

export function setSoundVolume(volume: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(volumeKey, String(Math.max(0, Math.min(1, volume))));
}

function stopCelebration(audio: HTMLAudioElement) {
  if (celebrationStopTimer !== null) {
    window.clearTimeout(celebrationStopTimer);
    celebrationStopTimer = null;
  }
  audio.pause();
  audio.currentTime = 0;
  if (activeCelebration === audio) activeCelebration = null;
}

/** Play the celebration asset from 1.5s into the file for a 3s success window. */
export function playCorrectAnswerSound() {
  if (typeof window === "undefined") return;
  const volume = getSoundVolume();
  if (volume === 0) return;
  if (activeCelebration) stopCelebration(activeCelebration);

  const audio = new Audio("/celebration.mp3");
  audio.preload = "auto";
  audio.volume = volume;
  audio.currentTime = celebrationStartSeconds;
  activeCelebration = audio;
  void audio.play().catch(() => {
    if (activeCelebration === audio) activeCelebration = null;
  });
  celebrationStopTimer = window.setTimeout(() => stopCelebration(audio), celebrationDurationMs);
}
