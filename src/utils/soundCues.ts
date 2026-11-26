let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) {
    sharedCtx = new AudioCtx();
  }
  return sharedCtx;
}

/**
 * Call inside a user gesture (click/tap) so Web Audio is unlocked on iOS Safari & Chrome.
 */
export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
}

/**
 * Soft, serene two-tone acoustic chime played when an action/step transitions.
 */
export function playActionChangeChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;

  const scheduleTone = (freq: number, startOffset: number, peakGain: number, decay: number) => {
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const gain = ctx.createGain();
    const harmonicGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + startOffset);

    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(freq * 2, now + startOffset);

    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + decay);

    harmonicGain.gain.setValueAtTime(0.0001, now + startOffset);
    harmonicGain.gain.exponentialRampToValueAtTime(peakGain * 0.16, now + startOffset + 0.015);
    harmonicGain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + decay * 0.55);

    osc.connect(gain);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + startOffset);
    harmonic.start(now + startOffset);
    osc.stop(now + startOffset + decay + 0.04);
    harmonic.stop(now + startOffset + decay + 0.04);
  };

  // Gentle warm interval (D5 -> A5)
  scheduleTone(587.33, 0, 0.11, 0.34);
  scheduleTone(880.0, 0.085, 0.085, 0.42);
}

/**
 * Peaceful three-note harmonic chord played when Wudu or Namaz finishes.
 */
export function playCompleteChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }

  const now = ctx.currentTime;
  const notes = [587.33, 739.99, 880.0]; // D5 - F#5 - A5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + i * 0.11;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.095, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.72);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.78);
  });
}
