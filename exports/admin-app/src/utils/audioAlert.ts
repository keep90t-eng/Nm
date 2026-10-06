// Synthesized high-fidelity audio chime using Web Audio API
// This guarantees instant, reliable sound playback across all browsers without external mp3 downloads

let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
};

// Automatically unlock AudioContext on first user interaction so alerts always play
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch {
      // ignore
    }
  };
  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
}

/**
 * Play a crystal-clear, resonant doorbell / store entrance chime (Ding - Dong 🔔)
 * Triggered the very second a customer enters the payment gateway portal
 */
export const playGatewayEnteredAlertSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Classic Two-Tone Resonant Brass Doorbell (Ding - Dong 🔔)
    // 1. "Ding" Tone (E5 + harmonic overtone)
    const dingFrequencies = [659.25, 1318.5];
    dingFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    });

    // 2. "Dong" Tone (C5 + harmonic overtone, deeper and longer decay)
    const dongFrequencies = [523.25, 1046.5];
    dongFrequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.28);

      gain.gain.setValueAtTime(0, now + 0.28);
      gain.gain.linearRampToValueAtTime(0.45, now + 0.28 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + 0.28);
      osc.stop(now + 0.28 + 1.2);
    });
  } catch (err) {
    console.warn('Failed to play gateway entered alert sound:', err);
  }
};

/**
 * Play a high-priority, elegant cash register / chime bell sound
 * Perfect for notifying the admin when a customer submits card details
 */
export const playPaymentAlertSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic bell sequence: Ding - Dong - Chime
    const notes = [
      { freq: 880, start: 0, duration: 0.25 },     // A5
      { freq: 1174.66, start: 0.12, duration: 0.35 }, // D6
      { freq: 1760, start: 0.25, duration: 0.6 },    // A6
      { freq: 2349.32, start: 0.35, duration: 0.8 },  // D7
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      // Bell envelope
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration);
    });
  } catch (err) {
    console.warn('Failed to play payment alert sound:', err);
  }
};

/**
 * Play an urgent attention ring for pending OTP submissions
 */
export const playOtpAlertSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [659.25, 880, 1046.5]; // E5, A5, C6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.4);
    });
  } catch (err) {
    console.warn('Failed to play OTP alert sound:', err);
  }
};

/**
 * Play a gentle success confirmation tone
 */
export const playSuccessSound = () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  } catch (err) {
    console.warn('Failed to play success sound:', err);
  }
};
