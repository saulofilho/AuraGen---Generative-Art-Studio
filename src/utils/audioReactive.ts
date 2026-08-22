/**
 * Procedural ambient synthesizer & Web Audio reactive analyzer
 */

export class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isMicActive = false;
  private isSynthActive = false;
  private synthInterval: number | null = null;

  async startMic(): Promise<boolean> {
    try {
      this.stop();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this.isMicActive = true;
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      return false;
    }
  }

  startProceduralSynth() {
    this.stop();
    this.audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    const masterGain = this.audioCtx.createGain();
    masterGain.gain.value = 0.15; // Soft ambient volume
    masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // Play subtle ambient pentatonic drones
    const notes = [130.81, 146.83, 164.81, 196.00, 220.00, 261.63, 329.63]; // C3 minor/major pentatonic
    let step = 0;

    const playChord = () => {
      if (!this.audioCtx || this.audioCtx.state === 'closed') return;
      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      const freq = notes[step % notes.length];
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      noteGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      noteGain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 1.2);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 4.0);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 4.2);
      step = (step + 1) % notes.length;
    };

    playChord();
    this.synthInterval = window.setInterval(playChord, 2200);
    this.isSynthActive = true;
  }

  stop() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
    this.isMicActive = false;
    this.isSynthActive = false;
  }

  getEnergy(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const avg = sum / this.dataArray.length;
    return avg / 255; // 0 to 1
  }

  getStatus() {
    return {
      isMicActive: this.isMicActive,
      isSynthActive: this.isSynthActive
    };
  }
}
