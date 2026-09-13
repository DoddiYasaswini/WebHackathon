class SoundSystem {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    this.muted = localStorage.getItem('lifequest_muted') === 'true';
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    localStorage.setItem('lifequest_muted', String(this.muted));
    return this.muted;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Melodic quest completion chord
  public playQuestComplete() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } catch (e) {
      // Ignore audio failure
    }
  }

  // Triumphant Level-Up Brass Fanfare
  public playLevelUp() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Fanfare sequence: C4, G4, C5, E5, G5
      const freqs = [261.63, 392.00, 523.25, 659.25, 783.99];
      const durations = [0.15, 0.15, 0.2, 0.25, 0.8];
      let timeOffset = 0;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === freqs.length - 1 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + timeOffset);

        const dur = durations[idx];
        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.22, now + timeOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + timeOffset + dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + dur + 0.05);

        timeOffset += dur * 0.75;
      });
    } catch (e) {
      // Ignore audio failure
    }
  }

  // Gold coins clink
  public playCoin() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [987.77, 1318.51].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.15, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.26);
      });
    } catch (e) {}
  }

  // Equip resonant tone
  public playEquip() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }

  // Gentle button tap feedback
  public playClick() {
    if (this.muted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {}
  }
}

export const sound = new SoundSystem();
