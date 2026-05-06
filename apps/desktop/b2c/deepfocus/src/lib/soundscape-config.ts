import type { SoundscapeType } from '@/types/database';

export interface LayerConfig {
  name: string;
  noiseType: 'white' | 'pink' | 'brown';
  defaultVolume: number;
}

export const soundscapeConfigs: Record<SoundscapeType, LayerConfig[]> = {
  rain: [
    { name: 'Rain drops', noiseType: 'pink', defaultVolume: 70 },
    { name: 'Thunder', noiseType: 'brown', defaultVolume: 30 },
    { name: 'Wind', noiseType: 'white', defaultVolume: 20 },
  ],
  coffee: [
    { name: 'Chatter', noiseType: 'pink', defaultVolume: 40 },
    { name: 'Espresso', noiseType: 'brown', defaultVolume: 25 },
    { name: 'Music', noiseType: 'pink', defaultVolume: 15 },
  ],
  lofi: [
    { name: 'Drums', noiseType: 'brown', defaultVolume: 50 },
    { name: 'Keys', noiseType: 'pink', defaultVolume: 40 },
    { name: 'Vinyl crackle', noiseType: 'white', defaultVolume: 20 },
  ],
  'white-noise': [
    { name: 'White noise', noiseType: 'white', defaultVolume: 60 },
    { name: 'Fan hum', noiseType: 'brown', defaultVolume: 30 },
  ],
  'pink-noise': [
    { name: 'Pink noise', noiseType: 'pink', defaultVolume: 60 },
    { name: 'Gentle breeze', noiseType: 'white', defaultVolume: 15 },
  ],
  'brown-noise': [
    { name: 'Brown noise', noiseType: 'brown', defaultVolume: 70 },
    { name: 'Low rumble', noiseType: 'brown', defaultVolume: 25 },
  ],
  forest: [
    { name: 'Birds', noiseType: 'white', defaultVolume: 35 },
    { name: 'Leaves', noiseType: 'pink', defaultVolume: 45 },
    { name: 'Stream', noiseType: 'brown', defaultVolume: 30 },
  ],
  ocean: [
    { name: 'Waves', noiseType: 'brown', defaultVolume: 65 },
    { name: 'Seagulls', noiseType: 'white', defaultVolume: 15 },
    { name: 'Wind', noiseType: 'pink', defaultVolume: 25 },
  ],
};
