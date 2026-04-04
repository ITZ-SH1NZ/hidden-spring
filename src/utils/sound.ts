// Sound engine — Web Audio API, no imports, SSR-safe
// Do NOT add "use client" — this is a plain TS utility

export type SoundType =
  | "move"
  | "crack_good"
  | "crack_bad"
  | "hit"
  | "shoot"
  | "collect"
  | "defeat_enemy"
  | "level_complete"
  | "gameover"
  | "win"
  | "boss_hit"
  | "boss_phase"
  | "ui_click"
  | "pause"
  | "konami"
  | "stealth_caught"
  | "timer_low"
  | "guardian_patrol";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

type OscType = OscillatorType;

function playNote(
  frequency: number,
  duration: number,
  type: OscType = "sine",
  startTime: number = 0,
  volume: number = 0.3,
  endVolume: number = 0.001
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ac.currentTime + startTime);

  const now = ac.currentTime + startTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(endVolume, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

function playNoise(duration: number, startTime: number = 0, volume: number = 0.1): void {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ac.createBufferSource();
  source.buffer = buffer;

  const gain = ac.createGain();
  source.connect(gain);
  gain.connect(ac.destination);

  const now = ac.currentTime + startTime;
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  source.start(now);
  source.stop(now + duration);
}

function playSweep(
  freqStart: number,
  freqEnd: number,
  duration: number,
  type: OscType = "sine",
  startTime: number = 0,
  volume: number = 0.3
): void {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = type;
  const now = ac.currentTime + startTime;
  osc.frequency.setValueAtTime(freqStart, now);
  osc.frequency.exponentialRampToValueAtTime(freqEnd, now + duration);

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

export function playSound(type: SoundType): void {
  if (typeof window === "undefined") return;

  // Check mute
  try {
    if (localStorage.getItem("easter_muted") === "true") return;
  } catch {
    // ignore
  }

  try {
    switch (type) {
      case "move":
        // Very short low blip (20ms, square wave, 180Hz)
        playNote(180, 0.02, "square", 0, 0.15);
        break;

      case "crack_good":
        // Three ascending notes: 440→554→659Hz, 80ms each, sine
        playNote(440, 0.08, "sine", 0);
        playNote(554, 0.08, "sine", 0.08);
        playNote(659, 0.12, "sine", 0.16);
        break;

      case "crack_bad":
        // Descending sawtooth buzz 300→150Hz, 200ms, with noise
        playSweep(300, 150, 0.2, "sawtooth", 0, 0.3);
        playNoise(0.15, 0, 0.08);
        break;

      case "hit":
        // Sharp impact: 200Hz triangle, 80ms, fast decay
        playNote(200, 0.08, "triangle", 0, 0.4, 0.001);
        break;

      case "shoot":
        // High click: 800Hz sine, 40ms, fast decay
        playNote(800, 0.04, "sine", 0, 0.3, 0.001);
        break;

      case "collect":
        // Ding: 880Hz sine, 200ms, slow decay
        playNote(880, 0.2, "sine", 0, 0.35, 0.001);
        break;

      case "defeat_enemy":
        // Power-up: 330→440→554→659Hz, 60ms each, sine
        playNote(330, 0.06, "sine", 0);
        playNote(440, 0.06, "sine", 0.06);
        playNote(554, 0.06, "sine", 0.12);
        playNote(659, 0.1, "sine", 0.18);
        break;

      case "level_complete": {
        // Triumphant: C5→E5→G5→C6, 120ms each, sine
        const noteFreqs = [523.25, 659.25, 783.99, 1046.5];
        noteFreqs.forEach((f, i) => {
          playNote(f, i === noteFreqs.length - 1 ? 0.25 : 0.12, "sine", i * 0.12);
        });
        break;
      }

      case "gameover":
        // Descending: 440→330→220Hz, 300ms each, sawtooth
        playNote(440, 0.3, "sawtooth", 0, 0.25);
        playNote(330, 0.3, "sawtooth", 0.3, 0.25);
        playNote(220, 0.4, "sawtooth", 0.6, 0.25);
        break;

      case "win": {
        // Big victory: C5→E5→G5→C6→G6, 100ms each, triangle, full chord at end
        const winFreqs = [523.25, 659.25, 783.99, 1046.5, 1567.98];
        winFreqs.forEach((f, i) => {
          playNote(f, i === winFreqs.length - 1 ? 0.5 : 0.1, "triangle", i * 0.1);
        });
        // Full chord at end
        [523.25, 659.25, 783.99, 1046.5].forEach((f) => {
          playNote(f, 0.4, "triangle", 0.5, 0.15);
        });
        break;
      }

      case "boss_hit":
        // Heavy impact: 100Hz sine + noise burst, 150ms
        playNote(100, 0.15, "sine", 0, 0.4, 0.001);
        playNoise(0.1, 0, 0.15);
        break;

      case "boss_phase":
        // Dramatic sweep: 200→600Hz, 400ms, sawtooth
        playSweep(200, 600, 0.4, "sawtooth", 0, 0.3);
        break;

      case "ui_click":
        // Tick: 1200Hz sine, 20ms
        playNote(1200, 0.02, "sine", 0, 0.2, 0.001);
        break;

      case "pause":
        // Soft whoosh: 400→200Hz, 150ms, sine
        playSweep(400, 200, 0.15, "sine", 0, 0.2);
        break;

      case "konami": {
        // 8-bit jingle: B4→B4→B4→B4→G4→E5→D5→C5, 80ms each
        const konamiNotes = [493.88, 493.88, 493.88, 493.88, 392, 659.25, 587.33, 523.25];
        konamiNotes.forEach((f, i) => {
          playNote(f, 0.07, "square", i * 0.08, 0.25);
        });
        break;
      }

      case "stealth_caught": {
        // Alarm: 880→440 alternating x3, 100ms each, square
        [880, 440, 880, 440, 880, 440].forEach((f, i) => {
          playNote(f, 0.09, "square", i * 0.1, 0.3);
        });
        break;
      }

      case "timer_low":
        // Urgent beep: 660Hz sine, 50ms, repeatable
        playNote(660, 0.05, "sine", 0, 0.3, 0.001);
        break;

      case "guardian_patrol":
        // Low rumble: 60Hz sine, 100ms, subtle
        playNote(60, 0.1, "sine", 0, 0.1, 0.001);
        break;

      default:
        break;
    }
  } catch {
    // Non-blocking — silent on error
  }
}
