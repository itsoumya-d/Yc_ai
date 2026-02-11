type NoiseType = 'white' | 'pink' | 'brown';

interface ActiveLayer {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private layers = new Map<string, ActiveLayer>();

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.75;
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private generateNoiseBuffer(type: NoiseType, durationSec = 4): AudioBuffer {
    const ctx = this.getContext();
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * durationSec;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    switch (type) {
      case 'white':
        for (let i = 0; i < length; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        break;
      case 'pink': {
        // Pink noise using Voss-McCartney algorithm (simplified)
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
          b6 = white * 0.115926;
        }
        break;
      }
      case 'brown': {
        // Brown noise (integrated white noise)
        let last = 0;
        for (let i = 0; i < length; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + (0.02 * white)) / 1.02;
          data[i] = last * 3.5;
        }
        break;
      }
    }

    return buffer;
  }

  playLayer(id: string, type: NoiseType, volume: number): void {
    // Stop existing layer with this id
    this.stopLayer(id);

    const ctx = this.getContext();
    const buffer = this.generateNoiseBuffer(type);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = volume / 100;

    source.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    this.layers.set(id, { source, gain });
  }

  setLayerVolume(id: string, volume: number): void {
    const layer = this.layers.get(id);
    if (layer) {
      const ctx = this.getContext();
      layer.gain.gain.setTargetAtTime(volume / 100, ctx.currentTime, 0.1);
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.1);
    }
  }

  stopLayer(id: string): void {
    const layer = this.layers.get(id);
    if (layer) {
      try {
        layer.source.stop();
        layer.source.disconnect();
        layer.gain.disconnect();
      } catch {
        // Already stopped
      }
      this.layers.delete(id);
    }
  }

  stopAll(): void {
    for (const id of this.layers.keys()) {
      this.stopLayer(id);
    }
  }

  isPlaying(): boolean {
    return this.layers.size > 0;
  }
}

// Singleton
export const audioEngine = new AudioEngine();
