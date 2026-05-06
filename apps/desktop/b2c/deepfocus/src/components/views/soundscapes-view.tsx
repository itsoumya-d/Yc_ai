import { cn } from '@/lib/utils';
import type { SoundscapeType } from '@/types/database';
import { audioEngine } from '@/lib/audio-engine';
import { soundscapeConfigs } from '@/lib/soundscape-config';
import { useSoundscapeStore } from '@/stores/soundscape-store';
import { CloudRain, Coffee, Headphones, Wind, Trees, Waves, Moon, Volume2, Play, Square } from 'lucide-react';
import { useCallback } from 'react';

const soundscapes: { id: SoundscapeType; name: string; description: string; icon: typeof CloudRain }[] = [
  { id: 'rain', name: 'Gentle Rain', description: 'Soft rainfall with distant thunder', icon: CloudRain },
  { id: 'coffee', name: 'Coffee Shop', description: 'Ambient café with muted chatter', icon: Coffee },
  { id: 'lofi', name: 'Lo-fi Beats', description: 'Chill beats for relaxed focus', icon: Headphones },
  { id: 'white-noise', name: 'White Noise', description: 'Consistent full-spectrum noise', icon: Volume2 },
  { id: 'pink-noise', name: 'Pink Noise', description: 'Balanced noise for concentration', icon: Wind },
  { id: 'brown-noise', name: 'Brown Noise', description: 'Deep, warm low-frequency noise', icon: Moon },
  { id: 'forest', name: 'Forest', description: 'Birdsong and rustling leaves', icon: Trees },
  { id: 'ocean', name: 'Ocean Waves', description: 'Rolling waves on a sandy shore', icon: Waves },
];

export function SoundscapesView() {
  const {
    activeSoundscape, setActiveSoundscape,
    layerVolumes, setLayerVolume,
    masterVolume, setMasterVolume,
  } = useSoundscapeStore();

  const config = activeSoundscape ? soundscapeConfigs[activeSoundscape] : null;

  const startSoundscape = useCallback((type: SoundscapeType) => {
    audioEngine.stopAll();
    const layers = soundscapeConfigs[type];
    if (!layers) return;

    for (const layer of layers) {
      const key = `${type}-${layer.name}`;
      const vol = layerVolumes[key] ?? layer.defaultVolume;
      audioEngine.playLayer(key, layer.noiseType, vol);
    }
    audioEngine.setMasterVolume(masterVolume);
    setActiveSoundscape(type);
  }, [layerVolumes, masterVolume, setActiveSoundscape]);

  const stopSoundscape = useCallback(() => {
    audioEngine.stopAll();
    setActiveSoundscape(null);
  }, [setActiveSoundscape]);

  function handleLayerVolumeChange(layerName: string, volume: number) {
    if (!activeSoundscape) return;
    const key = `${activeSoundscape}-${layerName}`;
    setLayerVolume(key, volume);
    audioEngine.setLayerVolume(key, volume);
  }

  function handleMasterVolumeChange(volume: number) {
    setMasterVolume(volume);
    audioEngine.setMasterVolume(volume);
  }

  function handleToggle(type: SoundscapeType) {
    if (activeSoundscape === type) {
      stopSoundscape();
    } else {
      startSoundscape(type);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border-default px-6 py-4">
        <div>
          <h1 className="focus-heading text-lg text-text-primary">Soundscapes</h1>
          <p className="mt-0.5 text-sm text-text-secondary">Ambient audio for deeper focus</p>
        </div>
        {activeSoundscape && (
          <button
            onClick={stopSoundscape}
            className="inline-flex items-center gap-1.5 rounded-md border border-error/30 px-3 py-1.5 text-xs text-error hover:bg-error/10"
          >
            <Square className="h-3.5 w-3.5" /> Stop All
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Soundscape Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-4 gap-4">
            {soundscapes.map((s) => (
              <button
                key={s.id}
                onClick={() => handleToggle(s.id)}
                className={cn(
                  'flex flex-col items-center gap-3 rounded-xl border p-5 transition-all',
                  activeSoundscape === s.id
                    ? 'border-sage-DEFAULT bg-bg-surface-raised shadow-[0_0_20px_rgba(127,176,105,0.15)]'
                    : 'border-border-default bg-bg-surface hover:border-primary-DEFAULT hover:-translate-y-0.5',
                )}
              >
                <div className={cn(
                  'flex h-14 w-14 items-center justify-center rounded-xl',
                  activeSoundscape === s.id ? 'bg-sage-muted' : 'bg-bg-surface-raised',
                )}>
                  <s.icon className={cn('h-7 w-7', activeSoundscape === s.id ? 'text-sage-DEFAULT' : 'text-text-secondary')} />
                </div>
                <div className="text-center">
                  <div className={cn('text-sm font-medium', activeSoundscape === s.id ? 'text-sage-DEFAULT' : 'text-text-primary')}>{s.name}</div>
                  <div className="mt-0.5 text-[10px] text-text-tertiary">{s.description}</div>
                </div>
                {activeSoundscape === s.id && (
                  <div className="flex items-center gap-1 rounded-full bg-sage-muted px-2 py-0.5">
                    <Play className="h-3 w-3 text-sage-DEFAULT" />
                    <span className="text-[10px] font-medium text-sage-DEFAULT">Playing</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mixer Panel */}
        {activeSoundscape && config && (
          <div className="w-72 border-l border-border-default bg-bg-surface p-5 space-y-5">
            <div>
              <h3 className="focus-heading text-sm text-text-primary">
                {soundscapes.find((s) => s.id === activeSoundscape)?.name}
              </h3>
              <p className="mt-0.5 text-xs text-text-tertiary">
                {soundscapes.find((s) => s.id === activeSoundscape)?.description}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-[10px] font-medium text-text-tertiary">LAYERS</div>
              {config.map((layer) => {
                const key = `${activeSoundscape}-${layer.name}`;
                const vol = layerVolumes[key] ?? layer.defaultVolume;
                return (
                  <div key={layer.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-text-primary">{layer.name}</span>
                      <span className="score-value text-[10px] text-text-tertiary">{vol}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={vol}
                      onChange={(e) => handleLayerVolumeChange(layer.name, Number(e.target.value))}
                      className="w-full accent-primary-DEFAULT"
                    />
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border-default pt-4">
              <div className="text-[10px] font-medium text-text-tertiary mb-3">MASTER VOLUME</div>
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-text-tertiary" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(Number(e.target.value))}
                  className="flex-1 accent-sage-DEFAULT"
                />
                <span className="score-value text-[10px] text-text-tertiary w-8 text-right">{masterVolume}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
