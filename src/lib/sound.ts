/**
 * Two short synthesised cues, for the dice and for unlocking a reward.
 *
 * Synthesised rather than sampled so the app ships no audio files and no
 * licensing question, and kept to two cues so the experience never becomes
 * noisy in a classroom. Nothing here plays on load: both cues are triggered by
 * a direct tap, which is also what browser autoplay policy requires.
 *
 * Every call is a no-op when sound is off, when the browser has no Web Audio,
 * or when the player has asked for reduced motion — someone who has turned the
 * animation down has not asked for sound effects instead.
 */

type Cue = "roll" | "land" | "reward";

const TONES: Record<Cue, { freq: number; ms: number; type: OscillatorType }> = {
  roll: { freq: 420, ms: 90, type: "triangle" },
  land: { freq: 660, ms: 130, type: "sine" },
  reward: { freq: 880, ms: 220, type: "sine" },
};

let context: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!context) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      context = new Ctor();
    }
    if (context.state === "suspended") void context.resume();
    return context;
  } catch {
    return null;
  }
}

export function playCue(cue: Cue, enabled: boolean): void {
  if (!enabled) return;
  const ctx = audioContext();
  if (!ctx) return;

  try {
    const { freq, ms, type } = TONES[cue];
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // A short envelope rather than a hard stop, which clicks.
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + ms / 1000 + 0.02);
  } catch {
    // Audio is a nicety. A failure here must never interrupt gameplay.
  }
}
