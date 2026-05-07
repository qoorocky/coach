type Listener = (speaking: boolean) => void;
const listeners = new Set<Listener>();

function emit(speaking: boolean) {
  for (const l of listeners) l(speaking);
}

export function onSpeechActive(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function speak(text: string): void {
  if (typeof window === "undefined") return;
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-TW";
  u.rate = 1.05;
  u.pitch = 1.0;
  u.onstart = () => emit(true);
  u.onend = () => emit(false);
  u.onerror = () => emit(false);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function cancelSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    emit(false);
  }
}
