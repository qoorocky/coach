let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function tone(frequency: number, durationMs: number, gain = 0.18): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    void c.resume();
  }
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + 0.005);
  g.gain.linearRampToValueAtTime(0, c.currentTime + durationMs / 1000);
  osc.connect(g).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + durationMs / 1000 + 0.02);
}

export function beepCountdown(): void {
  tone(880, 110);
}

export function beepWorkStart(): void {
  tone(1040, 220, 0.22);
}

export function beepRest(): void {
  tone(520, 220, 0.18);
}

export function beepDone(): void {
  tone(1320, 320, 0.22);
  setTimeout(() => tone(1760, 320, 0.22), 200);
}

export function unlockAudio(): void {
  // call from a user gesture so iOS / autoplay policies allow later beeps
  const c = getCtx();
  if (c && c.state === "suspended") {
    void c.resume();
  }
}
