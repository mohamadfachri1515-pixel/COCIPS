/**
 * Clash of Champions: IPS Arena - Global Audio Manager
 * Dual-engine audio system:
 * - HTML5 Audio channel for custom audio files (/assets/audio/bgm.mp3, etc.)
 * - Built-in procedural Web Audio API Synthesizer fallback for 100% offline, guaranteed esports battle music & SFX
 * - Strict layering: BGM and SFX run on independent audio graphs so SFX NEVER interrupts, pauses, or restarts BGM.
 */

export const BGM_URL = '/assets/audio/bgm.mp3';
export const CORRECT_SFX_URL = '/assets/audio/correct.mp3';
export const WRONG_SFX_URL = '/assets/audio/wrong.mp3';

class AudioManagerService {
  private bgmAudio: HTML5AudioChannel | null = null;
  private isSynthesizingBgm: boolean = false;
  private audioCtx: AudioContext | null = null;
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private bgmSynthInterval: number | null = null;
  private bgmSynthTimeout: number | null = null;
  
  // Public state
  private isBgmPlaying: boolean = false;
  private isBgmMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean }) => void> = new Set();

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initAudioContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.bgmGainNode = this.audioCtx.createGain();
        this.sfxGainNode = this.audioCtx.createGain();

        this.bgmGainNode.gain.value = this.isBgmMuted ? 0 : 0.35;
        this.sfxGainNode.gain.value = this.isSfxMuted ? 0 : 0.6;

        this.bgmGainNode.connect(this.audioCtx.destination);
        this.sfxGainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public subscribe(callback: (state: { isPlaying: boolean; isMuted: boolean }) => void) {
    this.listeners.add(callback);
    callback({ isPlaying: this.isBgmPlaying, isMuted: this.isBgmMuted });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb({ isPlaying: this.isBgmPlaying, isMuted: this.isBgmMuted }));
  }

  /**
   * Start Background Music
   * Must be called during user interaction (e.g. "MASUK ARENA PERTANDINGAN" button click).
   * Safe to call multiple times without restarting.
   */
  public startBGM(): void {
    if (this.isBgmPlaying) return;

    this.initAudioContext();
    this.isBgmPlaying = true;
    this.notify();

    // Check if HTML5 audio file exists and works
    const htmlAudio = new Audio(BGM_URL);
    htmlAudio.loop = true;
    htmlAudio.volume = this.isBgmMuted ? 0 : 0.45;

    const playPromise = htmlAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Custom mp3 audio played successfully
          this.bgmAudio = new HTML5AudioChannel(htmlAudio);
        })
        .catch(() => {
          // File not found or blocked: Fallback to built-in procedural Web Audio esports theme
          this.startProceduralBGM();
        });
    } else {
      this.startProceduralBGM();
    }
  }

  /**
   * Procedural synthesized BGM:
   * Ambient Cyberpunk/Championship Battle Loop using Web Audio API nodes.
   * Plays a 4-chord driving harmonic pattern with bass pulses and subtle arpeggio shimmer.
   */
  private startProceduralBGM(): void {
    if (this.isSynthesizingBgm) return;
    const ctx = this.initAudioContext();
    if (!ctx || !this.bgmGainNode) return;

    this.isSynthesizingBgm = true;

    // Chord progressions in D-minor / Cyberpunk Esports feel:
    // Dm (D3, F3, A3) -> Bb (Bb2, D3, F3) -> C (C3, E3, G3) -> Am (A2, C3, E3)
    const chords = [
      { bass: 73.42, notes: [146.83, 174.61, 220.0, 293.66] }, // Dm
      { bass: 58.27, notes: [116.54, 146.83, 174.61, 233.08] }, // Bb
      { bass: 65.41, notes: [130.81, 164.81, 196.0, 261.63] }, // C
      { bass: 55.0, notes: [110.0, 130.81, 164.81, 220.0] }    // Am
    ];

    let chordIndex = 0;
    const tempoBpm = 118;
    const beatSeconds = 60 / tempoBpm;
    const chordDuration = beatSeconds * 4; // 1 measure per chord

    const playMeasure = () => {
      if (!this.isSynthesizingBgm || !this.audioCtx || !this.bgmGainNode) return;

      const now = this.audioCtx.currentTime;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      // 1. Warm pad chord
      currentChord.notes.forEach((freq) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        const filter = this.audioCtx!.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + chordDuration * 0.5);
        filter.frequency.exponentialRampToValueAtTime(400, now + chordDuration);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
        gain.gain.setValueAtTime(0.04, now + chordDuration - 0.4);
        gain.gain.linearRampToValueAtTime(0, now + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGainNode!);

        osc.start(now);
        osc.stop(now + chordDuration);
      });

      // 2. Pulse sub-bass on eighth beats
      for (let i = 0; i < 8; i++) {
        const pulseTime = now + (i * beatSeconds) / 2;
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(currentChord.bass, pulseTime);

        bassGain.gain.setValueAtTime(0.12, pulseTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.22);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGainNode);

        bassOsc.start(pulseTime);
        bassOsc.stop(pulseTime + 0.25);
      }

      // 3. Cybernetic high arpeggio sequence
      const arpNotes = [...currentChord.notes, currentChord.notes[0] * 2];
      for (let i = 0; i < 8; i++) {
        const arpTime = now + (i * beatSeconds) / 2;
        const arpFreq = arpNotes[i % arpNotes.length] * 1.5;

        const arpOsc = this.audioCtx.createOscillator();
        const arpGain = this.audioCtx.createGain();

        arpOsc.type = 'sine';
        arpOsc.frequency.setValueAtTime(arpFreq, arpTime);

        arpGain.gain.setValueAtTime(0.035, arpTime);
        arpGain.gain.exponentialRampToValueAtTime(0.0001, arpTime + 0.18);

        arpOsc.connect(arpGain);
        arpGain.connect(this.bgmGainNode);

        arpOsc.start(arpTime);
        arpOsc.stop(arpTime + 0.2);
      }

      // Schedule next measure
      this.bgmSynthTimeout = window.setTimeout(playMeasure, (chordDuration - 0.05) * 1000);
    };

    playMeasure();
  }

  /**
   * Stop BGM permanently (called on GAME OVER)
   */
  public stopBGM(): void {
    this.isBgmPlaying = false;
    this.isSynthesizingBgm = false;

    if (this.bgmSynthTimeout) {
      clearTimeout(this.bgmSynthTimeout);
      this.bgmSynthTimeout = null;
    }

    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    this.notify();
  }

  /**
   * Toggle Speaker ON / OFF
   * When muted: keeps state and position, mutes gain node.
   * When unmuted: restores sound without restarting song.
   */
  public toggleMusic(): boolean {
    this.isBgmMuted = !this.isBgmMuted;

    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.isBgmMuted ? 0 : 0.35;
    }
    if (this.bgmAudio) {
      this.bgmAudio.setVolume(this.isBgmMuted ? 0 : 0.45);
    }

    // If BGM wasn't started yet, clicking speaker toggle ON also starts it
    if (!this.isBgmPlaying && !this.isBgmMuted) {
      this.startBGM();
    }

    this.notify();
    return !this.isBgmMuted;
  }

  public getSpeakerState(): { isPlaying: boolean; isMuted: boolean } {
    return {
      isPlaying: this.isBgmPlaying,
      isMuted: this.isBgmMuted
    };
  }

  /**
   * Play Correct Sound Effect
   * Layers simultaneously over BGM without pausing or restarting BGM!
   */
  public playCorrectSFX(): void {
    // Try HTML5 audio file first
    const sound = new Audio(CORRECT_SFX_URL);
    sound.volume = this.isSfxMuted ? 0 : 0.7;
    sound.play().catch(() => {
      // Procedural fallback: Grand high-tier championship victory fanfare
      this.synthVictoryChime();
    });
  }

  /**
   * Play Wrong Sound Effect
   * Layers simultaneously over BGM without pausing or restarting BGM!
   */
  public playWrongSFX(): void {
    // Try HTML5 audio file first
    const sound = new Audio(WRONG_SFX_URL);
    sound.volume = this.isSfxMuted ? 0 : 0.7;
    sound.play().catch(() => {
      // Procedural fallback: Heavy cybernetic low-end error thud
      this.synthWrongBuzzer();
    });
  }

  /**
   * Procedural synthesized victory fanfare
   */
  private synthVictoryChime(): void {
    const ctx = this.initAudioContext();
    if (!ctx || !this.sfxGainNode) return;

    const now = ctx.currentTime;
    // Chime notes: C5, E5, G5, C6 (523Hz, 659Hz, 784Hz, 1046Hz)
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });
  }

  /**
   * Procedural synthesized wrong answer buzzer
   */
  private synthWrongBuzzer(): void {
    const ctx = this.initAudioContext();
    if (!ctx || !this.sfxGainNode) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Pitch drops from 160Hz down to 65Hz
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.45);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

class HTML5AudioChannel {
  private element: HTMLAudioElement;

  constructor(el: HTMLAudioElement) {
    this.element = el;
  }

  public setVolume(vol: number) {
    this.element.volume = Math.max(0, Math.min(1, vol));
  }

  public pause() {
    this.element.pause();
  }

  public play() {
    this.element.play().catch(() => {});
  }
}

export const audioManager = new AudioManagerService();
