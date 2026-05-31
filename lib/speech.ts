// Thin wrappers over the browser's built-in Web Speech API — free, no key, no
// server. TTS (speechSynthesis) is widely supported; STT (SpeechRecognition) is
// Chrome/Safari. Callers feature-detect and fall back to a "coming soon" note
// where unsupported.

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, onEnd?: () => void): void {
  if (!ttsSupported()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.92; // a touch slower — it's a listening model for learners
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export function sttSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
}

export interface Recognizer {
  start: () => void;
  stop: () => void;
}

export function createRecognizer(
  onResult: (transcript: string) => void,
  onEnd: () => void,
): Recognizer | null {
  if (!sttSupported()) return null;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const Ctor =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  rec.onresult = (e: any) => {
    const t = e?.results?.[0]?.[0]?.transcript ?? "";
    onResult(t);
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
  rec.onend = onEnd;
  rec.onerror = onEnd;
  return { start: () => rec.start(), stop: () => rec.stop() };
}
