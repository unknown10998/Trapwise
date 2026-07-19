const volumeKey = "trapwise:sound-volume";

export function getSoundVolume() {
  if (typeof window === "undefined") return 0.55;
  const value = Number(window.localStorage.getItem(volumeKey));
  return Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0.55;
}

export function setSoundVolume(volume: number) {
  if (typeof window !== "undefined") window.localStorage.setItem(volumeKey, String(Math.max(0, Math.min(1, volume))));
}

/** A short browser-generated chime keeps success feedback local and asset-free. */
export function playCorrectAnswerSound() {
  if (typeof window === "undefined") return;
  const volume = getSoundVolume();
  if (volume === 0) return;
  const browserWindow = window as typeof window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext;
  if (!AudioContextConstructor) return;
  const context = new AudioContextConstructor();
  const start = context.currentTime;
  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start + index * 0.08);
    gain.gain.setValueAtTime(0.0001, start + index * 0.08);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.11), start + index * 0.08 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + index * 0.08 + 0.22);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start + index * 0.08);
    oscillator.stop(start + index * 0.08 + 0.24);
  });
  window.setTimeout(() => void context.close(), 650);
}
